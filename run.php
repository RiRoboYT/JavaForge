<?php
/**
 * JavaForge — run.php
 *
 * Server-side proxy between the JavaForge page and the OnlineCompiler.io API.
 * Browsers are not allowed to call OnlineCompiler.io directly (it sends no CORS
 * headers), so the page sends code here and this script forwards it, adding
 * your API key. The key never reaches the browser.
 *
 *   GET  run.php?health=1  -> {"ok":true,"hasKey":true}
 *   POST run.php           -> body {"code": "...", "input": "..."}
 *                             returns the OnlineCompiler.io response
 *
 * Your key goes in secret.php (next to this file). See README.md.
 */

// ---------------- Settings you can change ----------------
const JF_API_URL       = 'https://api.onlinecompiler.io/api/run-code-sync/';
const JF_COMPILER      = 'openjdk-25';
const JF_MAX_CODE      = 65536;   // max characters of code
const JF_MAX_INPUT     = 65536;   // max characters of stdin
const JF_RATE_LIMIT    = 30;      // max runs per visitor ...
const JF_RATE_WINDOW   = 300;     // ... per this many seconds (5 minutes)
const JF_TIMEOUT       = 60;      // seconds to wait for the compiler
// ----------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function jf_reply($status, $data)
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

function jf_api_key()
{
    $env = getenv('JAVAFORGE_API_KEY');
    if ($env) {
        return trim($env);
    }
    $file = __DIR__ . '/secret.php';
    if (is_file($file)) {
        $key = include $file;
        if (is_string($key) && trim($key) !== '' && stripos($key, 'PASTE') === false) {
            return trim($key);
        }
    }
    return '';
}

function jf_api_url()
{
    $env = getenv('JAVAFORGE_API_URL'); // only used for testing
    return $env ? $env : JF_API_URL;
}

// ---- Health check (used by the page to show "Connected") ----
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jf_reply(200, [
        'ok'     => true,
        'server' => 'php',
        'hasKey' => jf_api_key() !== '',
        'curl'   => function_exists('curl_init'),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    jf_reply(405, ['error' => 'Method not allowed']);
}

// ---- Only accept requests coming from this website ----
$host = isset($_SERVER['HTTP_HOST']) ? strtolower($_SERVER['HTTP_HOST']) : '';
if (!empty($_SERVER['HTTP_ORIGIN'])) {
    $originHost = strtolower((string) parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST));
    $originPort = parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_PORT);
    if ($originPort) {
        $originHost .= ':' . $originPort;
    }
    $hostNoPort = preg_replace('/:\d+$/', '', $host);
    if ($originHost !== $host && $originHost !== $hostNoPort) {
        jf_reply(403, ['error' => 'Requests from other websites are not allowed.']);
    }
}
if (!empty($_SERVER['HTTP_SEC_FETCH_SITE']) && !in_array($_SERVER['HTTP_SEC_FETCH_SITE'], ['same-origin', 'none'], true)) {
    jf_reply(403, ['error' => 'Requests from other websites are not allowed.']);
}

// ---- Read and validate the request ----
$raw = file_get_contents('php://input', false, null, 0, (JF_MAX_CODE + JF_MAX_INPUT) * 4 + 1024);
$req = json_decode($raw === false ? '' : $raw, true);
if (!is_array($req) || !isset($req['code']) || !is_string($req['code'])) {
    jf_reply(400, ['error' => 'Bad request: expected JSON with "code".']);
}
$code  = $req['code'];
$input = isset($req['input']) && is_string($req['input']) ? $req['input'] : '';
if (trim($code) === '') {
    jf_reply(400, ['error' => 'There is no code to run.']);
}
function jf_len($s)
{
    return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}
if (jf_len($code) > JF_MAX_CODE) {
    jf_reply(413, ['error' => 'Your program is too long (limit ' . JF_MAX_CODE . ' characters).']);
}
if (jf_len($input) > JF_MAX_INPUT) {
    jf_reply(413, ['error' => 'The input is too long (limit ' . JF_MAX_INPUT . ' characters).']);
}

$key = jf_api_key();
if ($key === '') {
    jf_reply(500, ['error' => 'No API key on the server. Put your OnlineCompiler.io key in secret.php.']);
}

// ---- Rate limit per visitor (protects your monthly quota) ----
function jf_rate_limited()
{
    $ip  = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown';
    $dir = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . 'javaforge-rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return false; // can't track: fail open rather than block the student
    }
    $file = $dir . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return false;
    }
    flock($fh, LOCK_EX);
    $now   = time();
    $stamp = json_decode(stream_get_contents($fh), true);
    $stamp = is_array($stamp) ? array_values(array_filter($stamp, function ($t) use ($now) {
        return is_int($t) && $t > $now - JF_RATE_WINDOW;
    })) : [];
    $limited = count($stamp) >= JF_RATE_LIMIT;
    if (!$limited) {
        $stamp[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($stamp));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $limited;
}
if (jf_rate_limited()) {
    header('Retry-After: 60');
    jf_reply(429, ['error' => 'Too many runs. Please wait a minute and try again.']);
}

// ---- Forward to OnlineCompiler.io ----
$payload = json_encode(['compiler' => JF_COMPILER, 'code' => $code, 'input' => $input], JSON_UNESCAPED_UNICODE);
$headers = ['Authorization: ' . $key, 'Content-Type: application/json', 'Accept: application/json'];
$status  = 0;
$body    = false;
$error   = '';

if (function_exists('curl_init')) {
    $ch = curl_init(jf_api_url());
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $payload,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_TIMEOUT        => JF_TIMEOUT,
    ]);
    $body   = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($body === false) {
        $error = curl_error($ch);
    }
    curl_close($ch);
} else {
    $ctx = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => implode("\r\n", $headers),
        'content'       => $payload,
        'timeout'       => JF_TIMEOUT,
        'ignore_errors' => true,
    ]]);
    $body = @file_get_contents(jf_api_url(), false, $ctx);
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $status = (int) $m[1];
    }
    if ($body === false) {
        $error = 'could not connect';
    }
}

if ($body === false || $status === 0) {
    jf_reply(502, ['error' => 'The server could not reach OnlineCompiler.io (' . ($error ?: 'no response') . ').']);
}

// Pass the compiler's answer straight through.
http_response_code($status);
echo $body;
