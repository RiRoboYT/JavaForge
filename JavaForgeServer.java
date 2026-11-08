/*
 * JavaForge local server (Java version — for computers without Python).
 *
 * Run it with:  java JavaForgeServer.java     (Java 11 or newer)
 * or just double-click start.bat on Windows.
 *
 * It serves JavaForge at http://localhost:8000 and answers /run.php exactly like
 * run.php does on a web host: it forwards your code to OnlineCompiler.io and adds
 * the API key from secret.php. Only this computer can connect to it.
 */
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.awt.Desktop;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JavaForgeServer {
    static final String API_URL = System.getenv().getOrDefault("JAVAFORGE_API_URL", "https://api.onlinecompiler.io/api/run-code-sync/");
    static final String COMPILER = "openjdk-25";
    static final int MAX_BODY = (65536 * 2) * 4 + 1024;
    static final Path ROOT = Paths.get("").toAbsolutePath();
    static final Set<String> BLOCKED = Set.of("secret.php", "secret.example.php", "server.py", "javaforgeserver.java", "start.bat", "config.js", "run.php");
    static final Map<String, String> TYPES = Map.of(
            "html", "text/html; charset=utf-8", "css", "text/css; charset=utf-8", "js", "application/javascript; charset=utf-8",
            "json", "application/json", "svg", "image/svg+xml", "png", "image/png", "ico", "image/x-icon", "md", "text/plain; charset=utf-8");
    static final HttpClient CLIENT = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();

    public static void main(String[] args) throws Exception {
        if (!Files.isRegularFile(ROOT.resolve("index.html"))) {
            System.out.println("Run this from the JavaForge folder (the one with index.html), or double-click start.bat.");
            System.exit(1);
        }
        HttpServer server = null;
        int port = 8000;
        for (; port <= 8010; port++) {
            try {
                server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
                break;
            } catch (IOException busy) {
                // try the next port
            }
        }
        if (server == null) {
            System.out.println("Ports 8000-8010 are all busy. Close other servers and try again.");
            System.exit(1);
        }
        server.createContext("/", JavaForgeServer::handle);
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();

        String url = "http://localhost:" + port + "/";
        System.out.println("====================================================");
        System.out.println("  JavaForge is running at " + url);
        System.out.println("  API key: " + (apiKey().isEmpty() ? "MISSING - add it to secret.php" : "found in secret.php"));
        System.out.println("  Keep this window open while you use JavaForge.");
        System.out.println("  Press Ctrl+C (or close this window) to stop.");
        System.out.println("====================================================");
        boolean openBrowser = args.length == 0 || !args[0].equals("--no-browser");
        if (openBrowser) {
            try {
                if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                    Desktop.getDesktop().browse(new URI(url));
                }
            } catch (Exception ignored) {
                System.out.println("  Open " + url + " in your browser.");
            }
        }
    }

    static String apiKey() {
        String env = System.getenv("JAVAFORGE_API_KEY");
        if (env != null && !env.isBlank()) return env.trim();
        try {
            String text = Files.readString(ROOT.resolve("secret.php"), StandardCharsets.UTF_8);
            Matcher m = Pattern.compile("return\\s*['\"]([^'\"]+)['\"]").matcher(text);
            if (m.find() && !m.group(1).toUpperCase(Locale.ROOT).contains("PASTE")) return m.group(1).trim();
        } catch (IOException ignored) {
        }
        return "";
    }

    static void handle(HttpExchange ex) throws IOException {
        try {
            String path = ex.getRequestURI().getPath();
            String method = ex.getRequestMethod();
            if (path.equals("/run.php")) {
                if (method.equals("GET")) {
                    send(ex, 200, "application/json", "{\"ok\":true,\"server\":\"local-java\",\"hasKey\":" + !apiKey().isEmpty() + "}");
                } else if (method.equals("POST")) {
                    proxy(ex);
                } else {
                    send(ex, 405, "application/json", "{\"error\":\"Method not allowed\"}");
                }
                return;
            }
            if (!method.equals("GET") && !method.equals("HEAD")) {
                send(ex, 405, "text/plain", "Method not allowed");
                return;
            }
            if (path.equals("/")) path = "/index.html";
            Path file = ROOT.resolve(path.substring(1)).normalize();
            String name = file.getFileName() == null ? "" : file.getFileName().toString().toLowerCase(Locale.ROOT);
            if (!file.startsWith(ROOT) || BLOCKED.contains(name) || name.startsWith(".") || !Files.isRegularFile(file)) {
                send(ex, 404, "text/plain", "Not found");
                return;
            }
            String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1) : "";
            sendBytes(ex, 200, TYPES.getOrDefault(ext, "application/octet-stream"), Files.readAllBytes(file));
        } catch (Exception e) {
            send(ex, 500, "text/plain", "Server error: " + e.getMessage());
        }
    }

    static void proxy(HttpExchange ex) throws IOException {
        byte[] body;
        try (InputStream in = ex.getRequestBody()) {
            body = in.readNBytes(MAX_BODY + 1);
        }
        if (body.length == 0 || body.length > MAX_BODY) {
            send(ex, 413, "application/json", "{\"error\":\"Bad request size.\"}");
            return;
        }
        String key = apiKey();
        if (key.isEmpty()) {
            send(ex, 500, "application/json", "{\"error\":\"No API key found. Put your OnlineCompiler.io key in secret.php.\"}");
            return;
        }
        // The page sends {"code": ..., "input": ...}; add the compiler id without parsing JSON.
        String json = new String(body, StandardCharsets.UTF_8).trim();
        if (!json.startsWith("{") || !json.contains("\"code\"")) {
            send(ex, 400, "application/json", "{\"error\":\"Bad request: expected JSON with \\\"code\\\".\"}");
            return;
        }
        String payload = "{\"compiler\":\"" + COMPILER + "\"," + json.substring(1);
        HttpRequest req = HttpRequest.newBuilder(URI.create(API_URL))
                .timeout(Duration.ofSeconds(60))
                .header("Authorization", key)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                .build();
        try {
            HttpResponse<byte[]> res = CLIENT.send(req, HttpResponse.BodyHandlers.ofByteArray());
            sendBytes(ex, res.statusCode(), "application/json; charset=utf-8", res.body());
        } catch (Exception e) {
            String msg = String.valueOf(e.getMessage()).replace("\\", "\\\\").replace("\"", "'");
            send(ex, 502, "application/json", "{\"error\":\"Could not reach OnlineCompiler.io (" + msg + ").\"}");
        }
    }

    static void send(HttpExchange ex, int status, String type, String text) throws IOException {
        sendBytes(ex, status, type, text.getBytes(StandardCharsets.UTF_8));
    }

    static void sendBytes(HttpExchange ex, int status, String type, byte[] data) throws IOException {
        ex.getResponseHeaders().set("Content-Type", type);
        ex.getResponseHeaders().set("Cache-Control", "no-store");
        boolean head = ex.getRequestMethod().equals("HEAD");
        ex.sendResponseHeaders(status, head ? -1 : (data.length == 0 ? -1 : data.length));
        if (!head && data.length > 0) {
            try (OutputStream out = ex.getResponseBody()) {
                out.write(data);
            }
        }
        ex.close();
    }
}
