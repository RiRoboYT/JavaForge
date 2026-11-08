/* ==========================================================================
   JavaForge — app logic
   Sections:
     1. Config & constants
     2. Templates
     3. Themes (UI + Monaco)
     4. Java preparation (makes BlueJ/ICSE-style code run on the server)
     5. Run result parsing
     6. Storage
     7. App (UI, editor, routing, running code)
   ========================================================================== */

/* ---------- 1. Config & constants ---------- */
const API_URL = "https://api.onlinecompiler.io/api/run-code-sync/";
const COMPILER_ID = "openjdk-25";
const MONACO_BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";
const RUN_TIMEOUT_MS = 60000;

const STORAGE_KEYS = {
  programs: "javaforge.programs",
  settings: "javaforge.settings",
  runs: "javaforge.runs",
};

const DEFAULT_SETTINGS = {
  theme: "one-dark",
  lastDarkTheme: "one-dark",
  lastLightTheme: "clean-light",
  apiKey: "",
  fontSize: 14,
  wordWrap: false,
  minimap: true,
  autosave: true,
  clearOnRun: true,
  sidebarWidth: 400,
  sort: "recent",
};

const STARTER_CODE = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from JavaForge!");
    }
}
`;

/* ---------- 2. Templates ---------- */
const TEMPLATES = [
  {
    id: "hello",
    icon: "Hi",
    title: "Hello World",
    desc: "The classic first program.",
    name: "Hello World",
    input: "",
    code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Welcome to JavaForge.");
    }
}
`,
  },
  {
    id: "scanner",
    icon: "In",
    title: "Scanner Input",
    desc: "Read a name and age from the user.",
    name: "Scanner Input",
    input: "Aarav\n15\n",
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter your name: ");
        String name = sc.nextLine();

        System.out.print("Enter your age: ");
        int age = sc.nextInt();

        System.out.println();
        System.out.println("Hello, " + name + "!");
        System.out.println("In 5 years you will be " + (age + 5) + " years old.");

        sc.close();
    }
}
`,
  },
  {
    id: "class",
    icon: "{}",
    title: "Class with Methods",
    desc: "Objects, constructor and methods.",
    name: "Student Class",
    input: "",
    code: `class Student {
    private String name;
    private int[] marks;

    // Constructor
    Student(String name, int[] marks) {
        this.name = name;
        this.marks = marks;
    }

    int total() {
        int sum = 0;
        for (int m : marks) {
            sum += m;
        }
        return sum;
    }

    double average() {
        return (double) total() / marks.length;
    }

    char grade() {
        double avg = average();
        if (avg >= 90) return 'A';
        else if (avg >= 75) return 'B';
        else if (avg >= 60) return 'C';
        else return 'D';
    }

    void display() {
        System.out.println("Name    : " + name);
        System.out.println("Total   : " + total());
        System.out.printf("Average : %.2f%n", average());
        System.out.println("Grade   : " + grade());
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Riya", new int[] {92, 88, 95, 90, 85});
        Student s2 = new Student("Kabir", new int[] {70, 65, 80, 72, 68});

        s1.display();
        System.out.println("-------------------");
        s2.display();
    }
}
`,
  },
  {
    id: "arrays",
    icon: "[]",
    title: "Arrays & Loops",
    desc: "Sum, max, average and reverse.",
    name: "Arrays and Loops",
    input: "",
    code: `public class Main {
    public static void main(String[] args) {
        int[] numbers = {12, 45, 7, 23, 56, 89, 34};

        int sum = 0;
        int max = numbers[0];
        int min = numbers[0];

        for (int i = 0; i < numbers.length; i++) {
            sum += numbers[i];
            if (numbers[i] > max) max = numbers[i];
            if (numbers[i] < min) min = numbers[i];
        }

        System.out.println("Numbers : " + java.util.Arrays.toString(numbers));
        System.out.println("Sum     : " + sum);
        System.out.println("Max     : " + max);
        System.out.println("Min     : " + min);
        System.out.println("Average : " + (double) sum / numbers.length);

        System.out.print("Reversed: ");
        for (int i = numbers.length - 1; i >= 0; i--) {
            System.out.print(numbers[i] + " ");
        }
        System.out.println();

        // Multiplication table using nested loops
        System.out.println();
        System.out.println("Multiplication table (1-5):");
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= 5; j++) {
                System.out.printf("%4d", i * j);
            }
            System.out.println();
        }
    }
}
`,
  },
  {
    id: "icse-prime",
    icon: "P",
    icse: true,
    title: "Prime Number",
    desc: "Check if a number is prime.",
    name: "Prime Number Check",
    input: "29\n",
    code: `import java.util.Scanner;

public class PrimeCheck {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int n = sc.nextInt();

        int count = 0;
        for (int i = 1; i <= n; i++) {
            if (n % i == 0) {
                count++;
            }
        }

        if (count == 2)
            System.out.println(n + " is a Prime Number");
        else
            System.out.println(n + " is not a Prime Number");
    }
}
`,
  },
  {
    id: "icse-menu",
    icon: "#",
    icse: true,
    title: "Menu-Driven Numbers",
    desc: "Palindrome or Armstrong using switch.",
    name: "Menu Driven Program",
    input: "1\n121\n",
    code: `import java.util.Scanner;

public class NumberMenu {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("1. Palindrome number");
        System.out.println("2. Armstrong number");
        System.out.print("Enter your choice: ");
        int choice = sc.nextInt();

        switch (choice) {
            case 1:
                System.out.print("Enter a number: ");
                int n = sc.nextInt();
                int rev = 0, copy = n;
                while (copy > 0) {
                    rev = rev * 10 + copy % 10;
                    copy /= 10;
                }
                if (rev == n)
                    System.out.println(n + " is a Palindrome number");
                else
                    System.out.println(n + " is not a Palindrome number");
                break;

            case 2:
                System.out.print("Enter a number: ");
                int num = sc.nextInt();
                int digits = String.valueOf(num).length();
                int sum = 0, temp = num;
                while (temp > 0) {
                    int d = temp % 10;
                    sum += (int) Math.pow(d, digits);
                    temp /= 10;
                }
                if (sum == num)
                    System.out.println(num + " is an Armstrong number");
                else
                    System.out.println(num + " is not an Armstrong number");
                break;

            default:
                System.out.println("Invalid choice");
        }
    }
}
`,
  },
  {
    id: "icse-bubble",
    icon: "↕",
    icse: true,
    title: "Bubble Sort",
    desc: "Sort an array in ascending order.",
    name: "Bubble Sort",
    input: "5\n64 25 12 22 11\n",
    code: `import java.util.Scanner;

public class BubbleSort {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("How many numbers? ");
        int n = sc.nextInt();
        int[] a = new int[n];

        System.out.println("Enter " + n + " numbers:");
        for (int i = 0; i < n; i++) {
            a[i] = sc.nextInt();
        }

        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = t;
                }
            }
        }

        System.out.print("Sorted array: ");
        for (int i = 0; i < n; i++) {
            System.out.print(a[i] + " ");
        }
        System.out.println();
    }
}
`,
  },
  {
    id: "icse-bill",
    icon: "₹",
    icse: true,
    title: "Electricity Bill",
    desc: "Class with input(), calculate(), display().",
    name: "Electricity Bill",
    input: "Meera Sharma\n275\n",
    code: `import java.util.Scanner;

/*
 * ICSE-style question:
 * Define a class ElectricBill with the following specifications:
 *   Data members : String n, int units, double bill
 *   void accept()    : to accept name and number of units
 *   void calculate() : to calculate the bill as per the tariff
 *       First 100 units           : Rs 2.00 per unit
 *       Next 200 units            : Rs 3.00 per unit
 *       Above 300 units           : Rs 5.00 per unit
 *       A surcharge of 2.5% is charged if units consumed exceed 300.
 *   void print()     : to display the details
 */
public class ElectricBill {
    String n;
    int units;
    double bill;

    void accept() {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter name: ");
        n = sc.nextLine();
        System.out.print("Enter units consumed: ");
        units = sc.nextInt();
    }

    void calculate() {
        if (units <= 100)
            bill = units * 2.0;
        else if (units <= 300)
            bill = 100 * 2.0 + (units - 100) * 3.0;
        else {
            bill = 100 * 2.0 + 200 * 3.0 + (units - 300) * 5.0;
            bill += bill * 2.5 / 100;
        }
    }

    void print() {
        System.out.println();
        System.out.println("Name of the customer : " + n);
        System.out.println("Number of units      : " + units);
        System.out.println("Bill amount          : Rs " + bill);
    }

    public static void main(String[] args) {
        ElectricBill ob = new ElectricBill();
        ob.accept();
        ob.calculate();
        ob.print();
    }
}
`,
  },
  {
    id: "icse-string",
    icon: "Ab",
    icse: true,
    title: "String Handling",
    desc: "Count vowels, words and reverse.",
    name: "String Handling",
    input: "Java is fun to learn\n",
    code: `import java.util.Scanner;

public class StringDemo {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter a sentence: ");
        String s = sc.nextLine().trim();

        int vowels = 0, words = 1;
        String reversed = "";

        for (int i = 0; i < s.length(); i++) {
            char ch = Character.toUpperCase(s.charAt(i));
            if ("AEIOU".indexOf(ch) != -1)
                vowels++;
            if (ch == ' ')
                words++;
            reversed = s.charAt(i) + reversed;
        }

        System.out.println("Vowels   : " + vowels);
        System.out.println("Words    : " + words);
        System.out.println("Reversed : " + reversed);
        System.out.println("Upper    : " + s.toUpperCase());
    }
}
`,
  },
];

/* ---------- 3. Themes ---------- */
// Each theme: mode (dark/light) + Monaco colors. UI colors live in style.css.
const THEMES = {
  "one-dark": {
    label: "One Dark", mode: "dark", base: "vs-dark",
    colors: { bg: "#282c34", fg: "#abb2bf", line: "#2c313a", lineNo: "#495162", lineNoActive: "#abb2bf", cursor: "#528bff", selection: "#3e4451", indent: "#3b4048", widget: "#21252b" },
    tokens: { keyword: "c678dd", type: "e5c07b", string: "98c379", number: "d19a66", comment: "5c6370", annotation: "61afef", delimiter: "abb2bf", operator: "56b6c2", escape: "56b6c2", ident: "abb2bf" },
  },
  dracula: {
    label: "Dracula", mode: "dark", base: "vs-dark",
    colors: { bg: "#282a36", fg: "#f8f8f2", line: "#31343f", lineNo: "#6272a4", lineNoActive: "#f8f8f2", cursor: "#f8f8f0", selection: "#44475a", indent: "#3b3d4a", widget: "#21222c" },
    tokens: { keyword: "ff79c6", type: "8be9fd", string: "f1fa8c", number: "bd93f9", comment: "6272a4", annotation: "50fa7b", delimiter: "f8f8f2", operator: "ff79c6", escape: "ff79c6", ident: "f8f8f2" },
  },
  monokai: {
    label: "Monokai", mode: "dark", base: "vs-dark",
    colors: { bg: "#272822", fg: "#f8f8f2", line: "#3e3d32", lineNo: "#90908a", lineNoActive: "#f8f8f2", cursor: "#f8f8f0", selection: "#49483e", indent: "#464741", widget: "#1e1f1c" },
    tokens: { keyword: "f92672", type: "66d9ef", string: "e6db74", number: "ae81ff", comment: "75715e", annotation: "a6e22e", delimiter: "f8f8f2", operator: "f92672", escape: "ae81ff", ident: "f8f8f2" },
  },
  "solarized-dark": {
    label: "Solarized Dark", mode: "dark", base: "vs-dark",
    colors: { bg: "#002b36", fg: "#93a1a1", line: "#073642", lineNo: "#586e75", lineNoActive: "#93a1a1", cursor: "#d30102", selection: "#0d4a59", indent: "#0d3f4c", widget: "#00212b" },
    tokens: { keyword: "859900", type: "b58900", string: "2aa198", number: "d33682", comment: "586e75", annotation: "268bd2", delimiter: "93a1a1", operator: "859900", escape: "cb4b16", ident: "839496" },
  },
  "clean-light": {
    label: "Clean Light", mode: "light", base: "vs",
    colors: { bg: "#ffffff", fg: "#24292f", line: "#f5f7fa", lineNo: "#a0a8b5", lineNoActive: "#24292f", cursor: "#2563eb", selection: "#cfe0ff", indent: "#e8ebf0", widget: "#f6f8fa" },
    tokens: { keyword: "cf222e", type: "8250df", string: "0a3069", number: "0550ae", comment: "6e7781", annotation: "953800", delimiter: "24292f", operator: "cf222e", escape: "116329", ident: "24292f" },
  },
  "soft-light": {
    label: "Soft Light", mode: "light", base: "vs",
    colors: { bg: "#fbf8f1", fg: "#3a352c", line: "#f3ede1", lineNo: "#b3aa95", lineNoActive: "#3a352c", cursor: "#c0632f", selection: "#efdcc4", indent: "#ebe3d3", widget: "#f5efe3" },
    tokens: { keyword: "a8456e", type: "2f7d8c", string: "4f7d2c", number: "c0632f", comment: "a39a84", annotation: "7a5ea8", delimiter: "3a352c", operator: "a8456e", escape: "c0632f", ident: "3a352c" },
  },
};

function monacoThemeData(theme) {
  const t = theme.tokens;
  const c = theme.colors;
  return {
    base: theme.base,
    inherit: true,
    rules: [
      { token: "", foreground: c.fg.slice(1) },
      { token: "keyword", foreground: t.keyword },
      { token: "type", foreground: t.type },
      { token: "type.identifier", foreground: t.type },
      { token: "identifier", foreground: t.ident },
      { token: "string", foreground: t.string },
      { token: "string.escape", foreground: t.escape },
      { token: "number", foreground: t.number },
      { token: "number.float", foreground: t.number },
      { token: "number.hex", foreground: t.number },
      { token: "comment", foreground: t.comment, fontStyle: "italic" },
      { token: "comment.doc", foreground: t.comment, fontStyle: "italic" },
      { token: "annotation", foreground: t.annotation },
      { token: "delimiter", foreground: t.delimiter },
      { token: "operator", foreground: t.operator },
    ],
    colors: {
      "editor.background": c.bg,
      "editor.foreground": c.fg,
      "editor.lineHighlightBackground": c.line,
      "editor.lineHighlightBorder": c.line,
      "editorLineNumber.foreground": c.lineNo,
      "editorLineNumber.activeForeground": c.lineNoActive,
      "editorCursor.foreground": c.cursor,
      "editor.selectionBackground": c.selection,
      "editor.inactiveSelectionBackground": c.selection + "99",
      "editorIndentGuide.background1": c.indent,
      "editorIndentGuide.activeBackground1": c.lineNo,
      "editorWidget.background": c.widget,
      "editorSuggestWidget.background": c.widget,
      "editorGutter.background": c.bg,
      "minimap.background": c.bg,
      "scrollbarSlider.background": c.lineNo + "40",
      "scrollbarSlider.hoverBackground": c.lineNo + "70",
    },
  };
}

/* ---------- 4. Java preparation ----------
   OnlineCompiler.io compiles your code as a single file (Main.java). Students
   (especially BlueJ/ICSE) name their class anything — e.g. "public class
   PrimeCheck" — which would normally fail with "class PrimeCheck is public,
   should be declared in a file named PrimeCheck.java".

   To make any single-file program run, we:
     • remove `public` from top-level types and blank out a `package` line,
     • if there is no class named Main, insert a tiny `class Main` launcher on
       the same line as the first class, which calls the real main method
       (static or not, with or without String[] args).
   Line numbers are preserved so compile errors still point to the right line. */
const JavaPrep = (() => {
  // Replace comments, strings and char literals with spaces (same length, newlines kept).
  function mask(src) {
    const out = new Array(src.length);
    const n = src.length;
    let i = 0;
    const blank = (k) => { out[k] = src[k] === "\n" ? "\n" : " "; };
    while (i < n) {
      const c = src[i];
      const d = src[i + 1];
      if (c === "/" && d === "/") {
        while (i < n && src[i] !== "\n") blank(i++);
      } else if (c === "/" && d === "*") {
        blank(i++); blank(i++);
        while (i < n && !(src[i] === "*" && src[i + 1] === "/")) blank(i++);
        if (i < n) { blank(i++); blank(i++); }
      } else if (src.startsWith('"""', i)) {
        blank(i++); blank(i++); blank(i++);
        while (i < n && !src.startsWith('"""', i)) {
          if (src[i] === "\\" && i + 1 < n) blank(i++);
          blank(i++);
        }
        if (i < n) { blank(i++); blank(i++); blank(i++); }
      } else if (c === '"' || c === "'") {
        blank(i++);
        while (i < n && src[i] !== c && src[i] !== "\n") {
          if (src[i] === "\\" && i + 1 < n) blank(i++);
          blank(i++);
        }
        if (i < n && src[i] === c) blank(i++);
      } else {
        out[i] = c;
        i++;
      }
    }
    return out.join("");
  }

  function analyze(src) {
    const m = mask(src);
    // depth[i] = brace depth at position i
    const depth = new Int32Array(m.length + 1);
    let dd = 0;
    for (let i = 0; i < m.length; i++) {
      depth[i] = dd;
      if (m[i] === "{") dd++;
      else if (m[i] === "}") dd = Math.max(0, dd - 1);
    }
    depth[m.length] = dd;

    const types = [];
    const re = /\b(class|interface|enum|record)\s+([A-Za-z_$][\w$]*)/g;
    let match;
    while ((match = re.exec(m))) {
      const idx = match.index;
      if (depth[idx] !== 0) continue;
      // body start / end
      const open = m.indexOf("{", idx);
      if (open === -1) continue;
      let k = open + 1;
      let level = 1;
      while (k < m.length && level > 0) {
        if (m[k] === "{") level++;
        else if (m[k] === "}") level--;
        k++;
      }
      const close = k - 1;
      // declaration start: after previous top-level ';' or '}' (or file start)
      let b = idx - 1;
      while (b >= 0 && !(depth[b] === 0 && (m[b] === ";" || m[b] === "}"))) b--;
      let start = b + 1;
      while (start < idx && /\s/.test(m[start])) start++;
      // main method directly inside this type's body (depth 1)
      const body = m.slice(open, close);
      const mainRe = /\bvoid\s+main\s*\(([^)]*)\)/g;
      let hasMain = false;
      let mm;
      while ((mm = mainRe.exec(body))) {
        if (depth[open + mm.index] === 1) {
          const params = mm[1].trim();
          // supported: no params, or a single String[]/String... parameter
          if (params === "" || /^(final\s+)?String\s*(\[\s*\]|\.\.\.)\s*[A-Za-z_$][\w$]*(\s*\[\s*\])?$/.test(params)) {
            hasMain = true;
            break;
          }
        }
      }
      types.push({ kind: match[1], name: match[2], keywordIndex: idx, declStart: start, open, close, hasMain });
      re.lastIndex = close + 1;
    }

    // Java 25 "compact source file": top-level `void main()` with no class around it.
    let topLevelMain = false;
    const tlRe = /\bvoid\s+main\s*\(/g;
    let t;
    while ((t = tlRe.exec(m))) {
      if (depth[t.index] === 0) { topLevelMain = true; break; }
    }
    return { masked: m, depth, types, topLevelMain };
  }

  function launcher(cls, name) {
    return (
      `class ${name}{public static void main(String[] a)throws Throwable{` +
      `Class<?> c=${cls}.class;java.lang.reflect.Method m;boolean w=true;` +
      'try{m=c.getDeclaredMethod("main",String[].class);}catch(NoSuchMethodException e){m=c.getDeclaredMethod("main");w=false;}' +
      "m.setAccessible(true);Object o=null;" +
      "if(!java.lang.reflect.Modifier.isStatic(m.getModifiers())){java.lang.reflect.Constructor<?> k=c.getDeclaredConstructor();k.setAccessible(true);o=k.newInstance();}" +
      "try{if(w)m.invoke(o,(Object)a);else m.invoke(o);}catch(java.lang.reflect.InvocationTargetException e){throw e.getCause();}}} "
    );
  }

  /**
   * @returns {{code:string, mainClass:string|null, wrapped:boolean, launcher:string|null, error?:string}}
   */
  function prepare(src) {
    const { masked, depth, types, topLevelMain } = analyze(src);
    const chars = src.split("");

    // Blank out `package x.y;` (keeps line numbers)
    const pkg = /\bpackage\s+[\w.\s]+;/g;
    let p;
    while ((p = pkg.exec(masked))) {
      if (depth[p.index] === 0) {
        for (let i = p.index; i < p.index + p[0].length; i++) if (chars[i] !== "\n") chars[i] = " ";
      }
    }

    // Remove `public` from top-level type declarations
    for (const ty of types) {
      const region = masked.slice(ty.declStart, ty.keywordIndex);
      const pubRe = /\bpublic\b/g;
      let pm;
      while ((pm = pubRe.exec(region))) {
        const at = ty.declStart + pm.index;
        for (let i = at; i < at + 6; i++) chars[i] = " ";
      }
    }

    const mainType = types.find((ty) => ty.name === "Main");
    const withMain = types.find((ty) => ty.hasMain);

    if (!types.length && topLevelMain) {
      // Java 25 compact source file — the compiler handles it as-is.
      return { code: chars.join(""), mainClass: "Main", wrapped: false, launcher: null };
    }
    if (!withMain) {
      return {
        code: chars.join(""),
        mainClass: null,
        wrapped: false,
        launcher: null,
        error:
          types.length === 0
            ? "No class found. A Java program needs a class with a main method, e.g.\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello\");\n    }\n}"
            : "No main method found.\nAdd this method inside your class so the program has a starting point:\n\n    public static void main(String[] args) {\n        // your code here\n    }",
      };
    }
    if (mainType && !mainType.hasMain) {
      return {
        code: chars.join(""),
        mainClass: null,
        wrapped: false,
        launcher: null,
        error: `Your class "Main" has no main method, but "${withMain.name}" does.\nRename class "Main" (the runner always starts a class called Main), or move the main method into it.`,
      };
    }
    const target = mainType || withMain;
    const first = types[0];
    if (first === target && target.name === "Main") {
      return { code: chars.join(""), mainClass: "Main", wrapped: false, launcher: null };
    }
    // Insert a launcher right before the first top-level type, on the same line,
    // so it is the first class in the file (source-launch mode) and/or provides
    // a class called Main (compile-then-run mode).
    const name = mainType ? "JavaForgeLauncher" : "Main";
    const code = chars.slice(0, first.declStart).join("") + launcher(target.name, name) + chars.slice(first.declStart).join("");
    return { code, mainClass: target.name, wrapped: true, launcher: name };
  }

  return { prepare, mask, analyze };
})();

/* ---------- 5. Run result parsing ---------- */
const ResultParser = (() => {
  const pick = (obj, keys) => {
    for (const k of keys) {
      if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
    }
    return undefined;
  };
  const asText = (v) => {
    if (v === undefined || v === null) return "";
    if (typeof v === "string") return v;
    if (Array.isArray(v)) return v.map(asText).join("\n");
    if (typeof v === "object") return JSON.stringify(v, null, 2);
    return String(v);
  };

  function cleanTrace(text, launcher) {
    if (!text) return text;
    return text
      .split("\n")
      .filter((line) => {
        if (/^\s+at (java\.base\/)?jdk\.internal\.reflect\./.test(line)) return false;
        if (/^\s+at (java\.base\/)?java\.lang\.reflect\.Method\.invoke/.test(line)) return false;
        if (launcher && new RegExp(`^\\s+at ${launcher}\\.main\\(Main\\.java:\\d+\\)\\s*$`).test(line)) return false;
        return true;
      })
      .join("\n");
  }

  /** Normalise whatever the API returns into a consistent shape. */
  function normalize(json, launcher) {
    const src = json && typeof json === "object" ? json : { output: asText(json) };
    const run = src.run && typeof src.run === "object" ? src.run : null;
    const compile = src.compile && typeof src.compile === "object" ? src.compile : null;

    let stdout = asText(pick(src, ["output", "stdout"]) ?? (run && pick(run, ["stdout", "output"])));
    let stderr = asText(pick(src, ["error", "stderr", "errors"]) ?? (run && pick(run, ["stderr"])));
    const compileOut = asText(pick(src, ["compile_output", "compileOutput", "compile_error"]) ?? (compile && pick(compile, ["stderr", "output"])));
    const status = asText(pick(src, ["status", "result"])).toLowerCase();
    const exitRaw = pick(src, ["exit_code", "exitCode", "code"]) ?? (run && pick(run, ["code", "exit_code"]));
    const exitCode = exitRaw === undefined || exitRaw === "" || isNaN(Number(exitRaw)) ? null : Number(exitRaw);
    const timeRaw = pick(src, ["time", "cpu_time", "execution_time", "executionTime", "duration"]);
    const memRaw = pick(src, ["memory", "memory_used", "memoryUsed"]);
    const signal = asText(pick(src, ["signal"]) ?? (run && pick(run, ["signal"])));

    const allErr = [compileOut, stderr].filter(Boolean).join("\n");
    const isCompileError =
      /Main\.java:\d+:\s*error:/.test(allErr) ||
      /error: compilation failed/i.test(allErr) ||
      /\d+ errors?\s*$/m.test(compileOut) ||
      /compil/.test(status) && /(error|fail)/.test(status);

    const isTimeout = /time ?limit|timed? ?out|timeout/i.test(status + " " + allErr) || signal === "SIGKILL";
    const isRuntimeError =
      !isCompileError &&
      (/Exception in thread|Exception:|Error:|at \S+\(.*\.java:\d+\)/.test(stderr) ||
        (exitCode !== null && exitCode !== 0) ||
        /runtime|error|fail/.test(status));

    stderr = cleanTrace(stderr, launcher);
    const compileText = isCompileError ? cleanTrace(allErr, launcher) : "";

    let kind = "success";
    if (isCompileError) kind = "compile";
    else if (isTimeout) kind = "timeout";
    else if (isRuntimeError) kind = "runtime";

    return {
      kind,
      stdout,
      stderr: isCompileError ? "" : stderr,
      compileErrors: compileText,
      exitCode,
      status,
      time: formatTime(timeRaw),
      memory: formatMemory(memRaw),
    };
  }

  function formatTime(t) {
    if (t === undefined || t === null || t === "") return "";
    const n = Number(t);
    if (isNaN(n)) return String(t);
    // API values are usually seconds (e.g. "0.12"); treat large numbers as ms.
    if (n > 50) return `${Math.round(n)} ms`;
    return n < 1 ? `${Math.round(n * 1000)} ms` : `${n.toFixed(2)} s`;
  }
  function formatMemory(m) {
    if (m === undefined || m === null || m === "") return "";
    const n = Number(m);
    if (isNaN(n)) return String(m);
    if (n > 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
    if (n > 1024) return `${(n / 1024).toFixed(1)} MB`; // value in KB
    return `${n} KB`;
  }

  /** Extract { line, message } from javac errors and stack traces. */
  function errorLines(text) {
    const out = [];
    if (!text) return out;
    const re = /Main\.java:(\d+):\s*(?:error:\s*)?(.*)/g;
    let m;
    while ((m = re.exec(text))) out.push({ line: Number(m[1]), message: m[2].trim() || "Error" });
    if (!out.length) {
      const st = /\(Main\.java:(\d+)\)/.exec(text);
      if (st) out.push({ line: Number(st[1]), message: "Runtime error here" });
    }
    return out;
  }

  return { normalize, errorLines, cleanTrace };
})();

/* ---------- Node test hook (ignored in browser) ---------- */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { JavaPrep, ResultParser, TEMPLATES, THEMES };
}

/* ---------- 6 & 7. Browser app ---------- */
if (typeof document !== "undefined") {
  (function App() {
    "use strict";

    /* ---------- helpers ---------- */
    const $ = (sel, root = document) => root.querySelector(sel);
    const el = (tag, attrs = {}, ...children) => {
      const node = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "class") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
        else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? "" : v);
      }
      for (const c of children.flat()) {
        if (c === null || c === undefined || c === false) continue;
        node.append(c instanceof Node ? c : document.createTextNode(String(c)));
      }
      return node;
    };
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const debounce = (fn, ms) => {
      let t;
      const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
      d.cancel = () => clearTimeout(t);
      return d;
    };
    const relTime = (ts) => {
      const s = Math.round((Date.now() - ts) / 1000);
      if (s < 10) return "just now";
      if (s < 60) return `${s}s ago`;
      const m = Math.round(s / 60);
      if (m < 60) return `${m} min ago`;
      const h = Math.round(m / 60);
      if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
      const d = Math.round(h / 24);
      if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
      return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    };

    /* ---------- Storage ---------- */
    const Store = {
      read(key, fallback) {
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch {
          return fallback;
        }
      },
      write(key, value) {
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (e) {
          toast("Could not save — browser storage is full or blocked.", "error");
          return false;
        }
      },
    };

    let programs = Store.read(STORAGE_KEYS.programs, []);
    if (!Array.isArray(programs)) programs = [];
    programs = programs.filter((p) => p && p.id).map(normalizeProgram);

    let settings = { ...DEFAULT_SETTINGS, ...Store.read(STORAGE_KEYS.settings, {}) };
    if (!THEMES[settings.theme]) settings.theme = DEFAULT_SETTINGS.theme;
    let runs = Store.read(STORAGE_KEYS.runs, []);
    if (!Array.isArray(runs)) runs = [];

    function normalizeProgram(p) {
      const now = Date.now();
      return {
        id: String(p.id),
        name: String(p.name || "Untitled").slice(0, 60),
        code: typeof p.code === "string" ? p.code : "",
        input: typeof p.input === "string" ? p.input : "",
        createdAt: Number(p.createdAt) || Number(p.lastModified) || now,
        updatedAt: Number(p.updatedAt) || Number(p.lastModified) || now,
        lastRun: p.lastRun && typeof p.lastRun === "object" ? p.lastRun : null,
      };
    }
    const savePrograms = () => Store.write(STORAGE_KEYS.programs, programs);
    const saveSettings = () => Store.write(STORAGE_KEYS.settings, settings);
    const getProgram = (id) => programs.find((p) => p.id === id);

    function apiKey() {
      let cfg = (window.JAVAFORGE_CONFIG && window.JAVAFORGE_CONFIG.apiKey) || "";
      if (/PASTE-YOUR/i.test(cfg)) cfg = ""; // untouched config.example.js
      return (settings.apiKey || cfg || "").trim();
    }

    function recordRun(ok) {
      const weekAgo = Date.now() - 30 * 24 * 3600 * 1000;
      runs = runs.filter((r) => r.t > weekAgo);
      runs.push({ t: Date.now(), ok });
      Store.write(STORAGE_KEYS.runs, runs);
    }

    function uniqueName(base) {
      const names = new Set(programs.map((p) => p.name.toLowerCase()));
      if (!names.has(base.toLowerCase())) return base;
      let i = 2;
      while (names.has(`${base} ${i}`.toLowerCase())) i++;
      return `${base} ${i}`;
    }

    function createProgram({ name = "Untitled", code = STARTER_CODE, input = "" } = {}) {
      const now = Date.now();
      const p = { id: uid(), name: uniqueName(name), code, input, createdAt: now, updatedAt: now, lastRun: null };
      programs.unshift(p);
      savePrograms();
      return p;
    }

    /* ---------- Toasts ---------- */
    function toast(message, type = "info", ms = 2600) {
      const t = el("div", { class: `toast ${type}`, role: "status" }, message);
      $("#toasts").append(t);
      setTimeout(() => {
        t.classList.add("leaving");
        t.addEventListener("animationend", () => t.remove(), { once: true });
      }, ms);
    }

    /* ---------- Dialogs ---------- */
    function promptDialog({ title, message = "", value = "", ok = "Save" }) {
      return new Promise((resolve) => {
        const dlg = $("#promptDialog");
        $("#promptTitle").textContent = title;
        $("#promptMessage").textContent = message;
        $("#promptMessage").hidden = !message;
        $("#promptOk").textContent = ok;
        const input = $("#promptInput");
        input.value = value;
        dlg.returnValue = "";
        dlg.showModal();
        input.focus();
        input.select();
        dlg.addEventListener(
          "close",
          () => resolve(dlg.returnValue === "ok" ? input.value.trim() : null),
          { once: true }
        );
      });
    }
    function confirmDialog({ title, message, ok = "Delete" }) {
      return new Promise((resolve) => {
        const dlg = $("#confirmDialog");
        $("#confirmTitle").textContent = title;
        $("#confirmMessage").textContent = message;
        $("#confirmOk").textContent = ok;
        dlg.returnValue = "";
        dlg.showModal();
        $("#confirmOk").focus();
        dlg.addEventListener("close", () => resolve(dlg.returnValue === "ok"), { once: true });
      });
    }
    // Close dialogs when clicking the backdrop
    document.querySelectorAll("dialog.modal").forEach((d) =>
      d.addEventListener("click", (e) => {
        if (e.target === d) d.close("cancel");
      })
    );

    /* ---------- Theme ---------- */
    let monacoRef = null;
    let editor = null;

    function applyTheme(name, animate = true) {
      const theme = THEMES[name] || THEMES[DEFAULT_SETTINGS.theme];
      if (animate) {
        document.body.classList.add("theme-anim");
        clearTimeout(applyTheme._t);
        applyTheme._t = setTimeout(() => document.body.classList.remove("theme-anim"), 450);
      }
      document.documentElement.dataset.theme = name;
      document.documentElement.dataset.mode = theme.mode;
      settings.theme = name;
      if (theme.mode === "dark") settings.lastDarkTheme = name;
      else settings.lastLightTheme = name;
      saveSettings();
      $("#themeSelect").value = name;
      if (monacoRef) monacoRef.editor.setTheme("jf-" + name);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = theme.colors.bg;
    }

    function toggleMode() {
      const current = THEMES[settings.theme];
      const next = current.mode === "dark" ? settings.lastLightTheme : settings.lastDarkTheme;
      const fallback = current.mode === "dark" ? "clean-light" : "one-dark";
      applyTheme(THEMES[next] && THEMES[next].mode !== current.mode ? next : fallback);
    }

    /* ---------- Dashboard ---------- */
    let searchQuery = "";

    function renderTemplates() {
      const grid = $("#templateGrid");
      grid.replaceChildren(
        ...TEMPLATES.map((t) =>
          el(
            "button",
            { class: `template-card${t.icse ? " icse" : ""}`, type: "button", title: `Create “${t.name}” from template`, onclick: () => newFromTemplate(t) },
            el("span", { class: "template-icon" }, t.icon),
            el(
              "span",
              {},
              el("div", { class: "template-title" }, t.title, t.icse ? el("span", { class: "tag" }, "ICSE") : null),
              el("div", { class: "template-desc" }, t.desc)
            )
          )
        )
      );
    }

    const ICONS = {
      rename: '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 20h4L19 9l-4-4L4 16z M14 6l4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      copy: '<svg viewBox="0 0 24 24" width="15" height="15"><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
      dup: '<svg viewBox="0 0 24 24" width="15" height="15"><rect x="4" y="4" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h10a2 2 0 0 0 2-2V8M10 10h0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      del: '<svg viewBox="0 0 24 24" width="15" height="15"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    };

    function previewNode(code) {
      const pre = el("pre", { class: "card-preview", "aria-hidden": "true" });
      const lines = code.split("\n").filter((l, i, arr) => l.trim() !== "" || (i > 0 && arr[i - 1].trim() !== "")).slice(0, 9);
      const text = lines.join("\n") || "// empty program";
      // light keyword highlighting
      const kw = /\b(public|private|protected|class|static|void|int|double|float|char|boolean|long|String|import|new|return|if|else|for|while|do|switch|case|break)\b/g;
      let last = 0;
      let m;
      while ((m = kw.exec(text))) {
        pre.append(document.createTextNode(text.slice(last, m.index)));
        pre.append(el("span", { class: "kw" }, m[0]));
        last = m.index + m[0].length;
      }
      pre.append(document.createTextNode(text.slice(last)));
      return pre;
    }

    function runBadge(p) {
      if (!p.lastRun) return el("span", { class: "badge" }, "Not run yet");
      const map = {
        success: ["ok", "✓ Last run OK"],
        compile: ["err", "✕ Compile error"],
        runtime: ["err", "✕ Runtime error"],
        timeout: ["warn", "⏱ Timed out"],
      };
      const [cls, label] = map[p.lastRun.kind] || ["warn", "! Run failed"];
      return el("span", { class: `badge ${cls}`, title: `Last run ${relTime(p.lastRun.at)}` }, label);
    }

    function renderDashboard() {
      // stats
      const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
      const weekRuns = runs.filter((r) => r.t > weekAgo);
      $("#statPrograms").textContent = programs.length;
      $("#statRuns").textContent = weekRuns.length;
      $("#statSuccess").textContent = weekRuns.filter((r) => r.ok).length;
      $("#statPrograms").nextElementSibling.textContent = programs.length === 1 ? "program saved" : "programs saved";
      $("#statRuns").nextElementSibling.textContent = weekRuns.length === 1 ? "run this week" : "runs this week";

      const q = searchQuery.trim().toLowerCase();
      let list = programs.filter((p) => !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
      const sort = settings.sort;
      list.sort((a, b) =>
        sort === "name" ? a.name.localeCompare(b.name, undefined, { numeric: true }) : sort === "created" ? b.createdAt - a.createdAt : b.updatedAt - a.updatedAt
      );

      const grid = $("#programGrid");
      $("#emptyState").hidden = programs.length > 0;
      $("#noResults").hidden = !(programs.length > 0 && list.length === 0);
      $("#noResultsQuery").textContent = searchQuery;
      grid.hidden = list.length === 0;

      grid.replaceChildren(
        ...list.map((p, i) => {
          const action = (icon, title, fn, extra = "") =>
            el("button", {
              class: `card-action ${extra}`,
              type: "button",
              title,
              "aria-label": title,
              html: ICONS[icon],
              onclick: (e) => {
                e.stopPropagation();
                fn();
              },
            });
          const card = el(
            "article",
            {
              class: "program-card",
              tabindex: "0",
              style: `animation-delay:${Math.min(i, 12) * 30}ms`,
              "aria-label": `Open ${p.name}`,
              onclick: () => openProgram(p.id),
              onkeydown: (e) => {
                if ((e.key === "Enter" || e.key === " ") && e.target === card) {
                  e.preventDefault();
                  openProgram(p.id);
                }
              },
            },
            previewNode(p.code),
            el(
              "div",
              { class: "card-body" },
              el(
                "div",
                { class: "card-info" },
                el("div", { class: "card-name", title: p.name }, p.name),
                el("div", { class: "card-meta" }, el("span", { title: new Date(p.updatedAt).toLocaleString() }, relTime(p.updatedAt)), runBadge(p))
              ),
              el(
                "div",
                { class: "card-actions" },
                action("rename", "Rename", () => renameProgram(p.id)),
                action("copy", "Copy code", () => copyText(p.code)),
                action("dup", "Duplicate", () => duplicateProgram(p.id)),
                action("del", "Delete", () => deleteProgram(p.id), "danger")
              )
            )
          );
          return card;
        })
      );
    }

    async function renameProgram(id) {
      const p = getProgram(id);
      if (!p) return;
      const name = await promptDialog({ title: "Rename program", value: p.name, ok: "Rename" });
      if (name === null) return;
      if (!name) return toast("Name can't be empty", "error");
      p.name = name.slice(0, 60);
      p.updatedAt = Date.now();
      savePrograms();
      if (currentId === id) $("#programName").value = p.name;
      renderDashboard();
      toast("Renamed", "success");
    }

    async function deleteProgram(id) {
      const p = getProgram(id);
      if (!p) return;
      const ok = await confirmDialog({ title: "Delete program?", message: `“${p.name}” will be permanently deleted from this browser.` });
      if (!ok) return;
      programs = programs.filter((x) => x.id !== id);
      savePrograms();
      const model = models.get(id);
      if (model) {
        if (editor && editor.getModel() === model) editor.setModel(null);
        model.dispose();
        models.delete(id);
      }
      if (currentId === id) {
        currentId = null;
        location.hash = "#/";
      }
      renderDashboard();
      toast("Program deleted");
    }

    function duplicateProgram(id) {
      const p = getProgram(id);
      if (!p) return;
      flushSave();
      createProgram({ name: `${p.name} copy`, code: p.code, input: p.input });
      renderDashboard();
      toast("Duplicated", "success");
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = el("textarea", { style: "position:fixed;opacity:0" });
        ta.value = text;
        document.body.append(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast("Code copied to clipboard", "success");
    }

    function newProgram() {
      flushSave();
      const p = createProgram();
      openProgram(p.id);
    }
    function newFromTemplate(t) {
      flushSave();
      const p = createProgram({ name: t.name, code: t.code, input: t.input });
      openProgram(p.id);
    }

    function exportPrograms() {
      flushSave();
      const data = { app: "JavaForge", version: 1, exportedAt: new Date().toISOString(), programs };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = el("a", { href: URL.createObjectURL(blob), download: `javaforge-backup-${new Date().toISOString().slice(0, 10)}.json` });
      document.body.append(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(a.href);
        a.remove();
      }, 1000);
      toast(`Exported ${programs.length} program${programs.length === 1 ? "" : "s"}`, "success");
    }

    async function importPrograms(file) {
      try {
        const data = JSON.parse(await file.text());
        const list = Array.isArray(data) ? data : data && Array.isArray(data.programs) ? data.programs : null;
        if (!list) throw new Error("not a JavaForge backup");
        let added = 0;
        let updated = 0;
        for (const raw of list) {
          if (!raw || typeof raw.code !== "string") continue;
          const p = normalizeProgram({ ...raw, id: raw.id || uid() });
          const existing = getProgram(p.id);
          if (!existing) {
            programs.push(p);
            added++;
          } else if (p.updatedAt > existing.updatedAt) {
            Object.assign(existing, p);
            const model = models.get(p.id);
            if (model) model.setValue(p.code);
            updated++;
          }
        }
        savePrograms();
        renderDashboard();
        toast(`Imported: ${added} new, ${updated} updated`, "success", 3500);
      } catch (e) {
        toast("Import failed — please choose a JavaForge JSON backup file.", "error", 4000);
      }
    }

    /* ---------- Editor ---------- */
    const models = new Map(); // program id -> monaco model
    let currentId = null;
    let fallbackTextarea = null;
    let monacoReady = null; // promise
    let errorDecorations = null;
    let isRunning = false;

    function loadMonaco() {
      if (monacoReady) return monacoReady;
      monacoReady = new Promise((resolve, reject) => {
        if (typeof window.require === "undefined" || !window.require.config) {
          reject(new Error("Monaco loader not available"));
          return;
        }
        window.MonacoEnvironment = {
          getWorkerUrl() {
            // Load the worker cross-origin via a data: URL proxy
            return (
              "data:text/javascript;charset=utf-8," +
              encodeURIComponent(`self.MonacoEnvironment={baseUrl:'${MONACO_BASE}/'};importScripts('${MONACO_BASE}/vs/base/worker/workerMain.js');`)
            );
          },
        };
        window.require.config({ paths: { vs: `${MONACO_BASE}/vs` } });
        const timer = setTimeout(() => reject(new Error("Monaco load timed out")), 20000);
        window.require(
          ["vs/editor/editor.main"],
          (monaco) => {
            clearTimeout(timer);
            resolve(monaco || window.monaco);
          },
          (err) => {
            clearTimeout(timer);
            reject(err);
          }
        );
      }).then(setupMonaco);
      return monacoReady;
    }

    function setupMonaco(monaco) {
      monacoRef = monaco;
      for (const [name, theme] of Object.entries(THEMES)) monaco.editor.defineTheme("jf-" + name, monacoThemeData(theme));

      editor = monaco.editor.create($("#editor"), {
        model: null,
        theme: "jf-" + settings.theme,
        fontFamily: '"JetBrains Mono", "Cascadia Code", Consolas, monospace',
        fontLigatures: true,
        fontSize: settings.fontSize,
        lineHeight: Math.round(settings.fontSize * 1.6),
        automaticLayout: true,
        minimap: { enabled: settings.minimap },
        wordWrap: settings.wordWrap ? "on" : "off",
        tabSize: 4,
        insertSpaces: true,
        autoIndent: "full",
        formatOnType: true,
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        matchBrackets: "always",
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: "active", indentation: true },
        folding: true,
        showFoldingControls: "mouseover",
        lineNumbers: "on",
        glyphMargin: true,
        renderLineHighlight: "all",
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        scrollBeyondLastLine: false,
        padding: { top: 12, bottom: 12 },
        stickyScroll: { enabled: false },
        fixedOverflowWidgets: true,
      });
      errorDecorations = editor.createDecorationsCollection([]);

      const { KeyMod, KeyCode } = monaco;
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => runCode());
      editor.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => saveNow(true));
      editor.addCommand(KeyMod.Alt | KeyCode.KeyZ, () => setWordWrap(!settings.wordWrap));

      editor.onDidChangeCursorPosition((e) => {
        $("#cursorPos").textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
      });

      registerJavaSnippets(monaco);
      $("#editorLoading").classList.add("done");
      return monaco;
    }

    function registerJavaSnippets(monaco) {
      const S = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
      const K = monaco.languages.CompletionItemKind.Snippet;
      const snippets = [
        ["sout", "System.out.println(${1});", "Print a line"],
        ["souf", 'System.out.printf("${1}%n"${2});', "Formatted print"],
        ["psvm", "public static void main(String[] args) {\n\t${0}\n}", "main method"],
        ["fori", "for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${0}\n}", "for loop"],
        ["foreach", "for (${1:int} ${2:x} : ${3:array}) {\n\t${0}\n}", "for-each loop"],
        ["while", "while (${1:condition}) {\n\t${0}\n}", "while loop"],
        ["ifelse", "if (${1:condition}) {\n\t${2}\n} else {\n\t${0}\n}", "if / else"],
        ["switch", "switch (${1:value}) {\n\tcase ${2:1}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${0}\n}", "switch statement"],
        ["scanner", "Scanner ${1:sc} = new Scanner(System.in);", "Create a Scanner"],
        ["trycatch", "try {\n\t${1}\n} catch (${2:Exception} e) {\n\t${0:e.printStackTrace();}\n}", "try / catch"],
      ];
      monaco.languages.registerCompletionItemProvider("java", {
        provideCompletionItems(model, position) {
          const word = model.getWordUntilPosition(position);
          const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
          return {
            suggestions: snippets.map(([label, insertText, documentation]) => ({ label, kind: K, insertText, insertTextRules: S, documentation, detail: documentation, range })),
          };
        },
      });
    }

    function useFallbackEditor(reason) {
      if (fallbackTextarea) return;
      console.warn("JavaForge: Monaco failed to load, using a plain editor.", reason);
      fallbackTextarea = el("textarea", { class: "fallback-editor", spellcheck: "false", "aria-label": "Code editor" });
      $("#editor").append(fallbackTextarea);
      $("#editorLoading").classList.add("done");
      fallbackTextarea.addEventListener("input", onCodeChange);
      fallbackTextarea.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const s = fallbackTextarea.selectionStart;
          fallbackTextarea.setRangeText("    ", s, fallbackTextarea.selectionEnd, "end");
          onCodeChange();
        }
      });
      fallbackTextarea.style.fontSize = settings.fontSize + "px";
      fallbackTextarea.style.whiteSpace = settings.wordWrap ? "pre-wrap" : "pre";
      toast("Couldn't load the advanced editor (offline?). Using a simple editor.", "error", 5000);
    }

    function getCode() {
      if (editor && editor.getModel()) return editor.getValue();
      if (fallbackTextarea) return fallbackTextarea.value;
      const p = getProgram(currentId);
      return p ? p.code : "";
    }

    function getModelFor(p) {
      let model = models.get(p.id);
      if (!model) {
        model = monacoRef.editor.createModel(p.code, "java");
        model.onDidChangeContent(onCodeChange);
        models.set(p.id, model);
      }
      return model;
    }

    async function openProgram(id) {
      if (location.hash !== `#/edit/${id}`) {
        location.hash = `#/edit/${id}`; // route() will call back here
        return;
      }
      const p = getProgram(id);
      if (!p) {
        toast("That program no longer exists", "error");
        location.hash = "#/";
        return;
      }
      flushSave();
      currentId = id;
      showView("editor");
      setSidebarWidth(settings.sidebarWidth);
      $("#programName").value = p.name;
      $("#stdinInput").value = p.input || "";
      document.title = `${p.name} — JavaForge`;
      setSaveState("saved");
      resetConsole();
      updateFileTab(p.code);

      try {
        await loadMonaco();
        if (currentId !== id) return;
        const model = getModelFor(p);
        if (model.getValue() !== p.code) model.setValue(p.code);
        editor.setModel(model);
        clearErrorMarks();
        editor.focus();
        requestAnimationFrame(() => editor.layout());
      } catch (err) {
        useFallbackEditor(err);
        if (currentId !== id) return;
        fallbackTextarea.value = p.code;
        fallbackTextarea.focus();
      }
    }

    function updateFileTab(code) {
      const a = JavaPrep.analyze(code);
      const main = a.types.find((t) => t.hasMain) || a.types[0];
      $("#fileTabName").textContent = (main ? main.name : "Main") + ".java";
    }

    /* ---------- Saving ---------- */
    function setSaveState(state) {
      const ind = $("#saveIndicator");
      ind.dataset.state = state;
      $(".label", ind).textContent = state === "saved" ? "Saved" : state === "saving" ? "Saving…" : "Unsaved changes";
      if (state === "saved") {
        ind.classList.remove("flash");
        void ind.offsetWidth;
        ind.classList.add("flash");
      }
    }

    const autoSave = debounce(() => saveNow(false), 700);
    const updateTabDebounced = debounce((code) => updateFileTab(code), 400);

    function onCodeChange() {
      if (!currentId) return;
      setSaveState(settings.autosave ? "saving" : "dirty");
      clearErrorMarks();
      updateTabDebounced(getCode());
      if (settings.autosave) autoSave();
    }

    function saveNow(manual) {
      autoSave.cancel();
      const p = getProgram(currentId);
      if (!p) return;
      const code = getCode();
      const name = $("#programName").value.trim() || p.name;
      const input = $("#stdinInput").value;
      const changed = p.code !== code || p.name !== name || p.input !== input;
      if (changed) {
        p.code = code;
        p.name = name;
        p.input = input;
        p.updatedAt = Date.now();
        savePrograms();
      }
      setSaveState("saved");
      if (manual) toast("Saved", "success", 1400);
    }

    function flushSave() {
      if (currentId && getProgram(currentId) && $("#saveIndicator").dataset.state !== "saved") saveNow(false);
    }

    /* ---------- Console ---------- */
    function resetConsole() {
      $("#console").replaceChildren(
        el(
          "div",
          { class: "console-placeholder" },
          el("p", { html: "Press <kbd>Run</kbd> or <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to compile and run your program." }),
          el("p", { class: "muted" }, "Output, compile errors and runtime errors appear here.")
        )
      );
      $("#runStatus").hidden = true;
      $("#runTime").textContent = "";
    }

    function setRunStatus(kind, text) {
      const b = $("#runStatus");
      b.hidden = false;
      b.className = `badge ${kind}`;
      b.textContent = text;
    }

    function linkifyErrors(text) {
      // Turn "Main.java:12" into clickable links that jump to the line.
      const frag = document.createDocumentFragment();
      const re = /Main\.java:(\d+)/g;
      let last = 0;
      let m;
      while ((m = re.exec(text))) {
        frag.append(document.createTextNode(text.slice(last, m.index)));
        const line = Number(m[1]);
        frag.append(el("a", { class: "err-line-link", title: `Go to line ${line}`, onclick: () => goToLine(line) }, `line ${line}`));
        last = m.index + m[0].length;
      }
      frag.append(document.createTextNode(text.slice(last)));
      return frag;
    }

    function goToLine(line) {
      if (editor) {
        editor.revealLineInCenter(line);
        editor.setPosition({ lineNumber: line, column: 1 });
        editor.focus();
      } else if (fallbackTextarea) {
        const lines = fallbackTextarea.value.split("\n");
        const pos = lines.slice(0, line - 1).join("\n").length + (line > 1 ? 1 : 0);
        fallbackTextarea.focus();
        fallbackTextarea.setSelectionRange(pos, pos + (lines[line - 1] || "").length);
      }
    }

    function markErrors(list) {
      if (!editor || !monacoRef || !editor.getModel()) return;
      const model = editor.getModel();
      const max = model.getLineCount();
      const markers = list
        .filter((e) => e.line >= 1 && e.line <= max)
        .map((e) => ({
          severity: monacoRef.MarkerSeverity.Error,
          message: e.message,
          startLineNumber: e.line,
          endLineNumber: e.line,
          startColumn: model.getLineFirstNonWhitespaceColumn(e.line) || 1,
          endColumn: model.getLineMaxColumn(e.line),
        }));
      monacoRef.editor.setModelMarkers(model, "javaforge", markers);
      errorDecorations.set(
        markers.map((mk) => ({
          range: new monacoRef.Range(mk.startLineNumber, 1, mk.startLineNumber, 1),
          options: { isWholeLine: true, className: "jf-error-line", glyphMarginClassName: "jf-error-glyph", glyphMarginHoverMessage: { value: mk.message } },
        }))
      );
    }
    function clearErrorMarks() {
      if (editor && monacoRef && editor.getModel()) monacoRef.editor.setModelMarkers(editor.getModel(), "javaforge", []);
      if (errorDecorations) errorDecorations.clear();
    }

    function friendlyHint(text) {
      const hints = [
        [/cannot find symbol[\s\S]*symbol:\s+class Scanner/, "Add  import java.util.Scanner;  at the top of your program."],
        [/NoSuchElementException/, "Your program tried to read input that wasn't there. Type the values your program asks for in the Input box (one per line), then run again."],
        [/InputMismatchException/, "The input didn't match what Scanner expected (e.g. text where a number was needed). Check the Input box."],
        [/ArrayIndexOutOfBoundsException/, "An array index went past the end of the array. Check your loop conditions (use < length, not <= length)."],
        [/StringIndexOutOfBoundsException/, "A string index went past the end of the string. Check charAt()/substring() positions."],
        [/ArithmeticException: \/ by zero/, "Division by zero. Make sure the divisor isn't 0."],
        [/NullPointerException/, "Something was used before it was given a value (it's null). Check you created the object/array with new."],
        [/';' expected/, "A semicolon is missing at the end of a statement."],
        [/reached end of file while parsing/, "A closing brace } is missing."],
        [/incompatible types: possible lossy conversion/, "You're storing a bigger type in a smaller one (e.g. double into int). Use a cast like (int)."],
        [/missing return statement/, "A method that returns a value must return on every path."],
      ];
      for (const [re, msg] of hints) if (re.test(text)) return msg;
      return "";
    }

    /* ---------- Running code ---------- */
    async function runCode() {
      if (isRunning || !currentId) return;
      const code = getCode();
      if (!code.trim()) return toast("Write some code first", "error");
      saveNow(false);

      const key = apiKey();
      if (!key) {
        toast("Add your OnlineCompiler.io API key in Settings to run code.", "error", 4000);
        openSettings(true);
        return;
      }

      const p = getProgram(currentId);
      const prep = JavaPrep.prepare(code);
      const consoleEl = $("#console");
      if (settings.clearOnRun || consoleEl.querySelector(".console-placeholder")) consoleEl.replaceChildren();
      clearErrorMarks();

      if (prep.error) {
        const entry = el("div", { class: "console-entry" }, el("div", { class: "entry-head" }, el("span", { class: "badge err" }, "Can't run"), new Date().toLocaleTimeString()));
        entry.append(el("div", { class: "err-block" }, el("span", { class: "err-title" }, "Missing main method"), prep.error));
        consoleEl.append(entry);
        setRunStatus("err", "Can't run");
        return;
      }

      isRunning = true;
      const runBtn = $("#runBtn");
      runBtn.classList.add("running");
      runBtn.disabled = true;
      $(".run-label", runBtn).textContent = "Running…";
      setRunStatus("run", "Running");
      $("#runTime").textContent = "";

      const entry = el("div", { class: "console-entry" });
      const running = el("div", { class: "running-line" }, el("span", { class: "spinner" }), "Compiling & running ", el("strong", {}, (prep.mainClass || "Main") + ".java"), "…");
      entry.append(running);
      consoleEl.append(entry);
      consoleEl.scrollTop = consoleEl.scrollHeight;

      const started = performance.now();
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), RUN_TIMEOUT_MS);
      let result = null;
      let raw = null;
      let failure = null;

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { Authorization: key, "Content-Type": "application/json" },
          body: JSON.stringify({ compiler: COMPILER_ID, code: prep.code, input: $("#stdinInput").value }),
          signal: ctrl.signal,
        });
        const text = await res.text();
        try {
          raw = JSON.parse(text);
        } catch {
          raw = text;
        }
        if (!res.ok) {
          const detail = typeof raw === "object" && raw ? raw.detail || raw.error || raw.message || JSON.stringify(raw) : String(raw || "").slice(0, 300);
          if (res.status === 401 || res.status === 403) failure = { title: "API key rejected", msg: `The server said: ${detail}\n\nCheck your API key in Settings.` };
          else if (res.status === 429) failure = { title: "Rate limit reached", msg: `Too many runs right now or monthly limit reached.\n${detail}` };
          else failure = { title: `Server error (${res.status})`, msg: String(detail) };
        } else {
          result = ResultParser.normalize(raw, prep.launcher);
        }
      } catch (err) {
        if (err.name === "AbortError") failure = { title: "Timed out", msg: `No response from the compiler after ${RUN_TIMEOUT_MS / 1000} seconds. Your program may have an infinite loop, or the server is busy. Try again.` };
        else
          failure = {
            title: "Couldn't reach the compiler",
            msg:
              "The request to OnlineCompiler.io failed. Check your internet connection and try again.\n" +
              (location.protocol === "file:" ? "Tip: if it keeps failing, serve the folder with a local web server (see README) instead of opening the file directly.\n" : "") +
              `(${err.message})`,
          };
      } finally {
        clearTimeout(timer);
      }

      const elapsed = ((performance.now() - started) / 1000).toFixed(2);
      entry.replaceChildren();
      const head = el("div", { class: "entry-head" });
      entry.append(head);
      const stamp = new Date().toLocaleTimeString();

      if (failure) {
        head.append(el("span", { class: "badge err" }, failure.title), stamp);
        entry.append(el("div", { class: "err-block" }, failure.msg));
        setRunStatus("err", "Failed");
        $("#runTime").textContent = `${elapsed}s`;
      } else {
        const labels = {
          success: ["ok", "✓ Success"],
          compile: ["err", "✕ Compile error"],
          runtime: ["err", "✕ Runtime error"],
          timeout: ["warn", "⏱ Time limit exceeded"],
        };
        const [cls, label] = labels[result.kind];
        head.append(el("span", { class: `badge ${cls}` }, label), stamp);
        const metaBits = [];
        if (result.time) metaBits.push(`CPU ${result.time}`);
        if (result.memory) metaBits.push(result.memory);
        if (result.exitCode !== null && result.kind !== "success") metaBits.push(`exit code ${result.exitCode}`);
        if (metaBits.length) head.append(el("span", {}, "· " + metaBits.join(" · ")));

        if (result.kind === "compile") {
          const errs = ResultParser.errorLines(result.compileErrors);
          const count = errs.length;
          entry.append(
            el("div", { class: "err-block" }, el("span", { class: "err-title" }, `Compilation failed${count ? ` — ${count} error${count > 1 ? "s" : ""}` : ""}`), linkifyErrors(result.compileErrors.trim()))
          );
          markErrors(errs);
        } else {
          entry.append(el("pre", { class: `out${result.stdout ? "" : " empty"}` }, result.stdout || (result.kind === "success" ? "(no output)" : "")));
          if (result.stderr.trim()) {
            const isErr = result.kind !== "success";
            entry.append(
              el(
                "div",
                { class: `err-block${isErr ? "" : " warn"}` },
                el("span", { class: "err-title" }, result.kind === "runtime" ? "Runtime error" : result.kind === "timeout" ? "Time limit exceeded" : "stderr"),
                linkifyErrors(result.stderr.trim())
              )
            );
            if (result.kind === "runtime") markErrors(ResultParser.errorLines(result.stderr));
          } else if (result.kind === "timeout") {
            entry.append(el("div", { class: "err-block warn" }, "Your program took too long. Check for an infinite loop, or a Scanner waiting for input that isn't in the Input box."));
          }
        }
        const hint = friendlyHint(result.compileErrors + "\n" + result.stderr);
        if (hint) entry.append(el("div", { class: "hint" }, "💡 " + hint));
        entry.append(
          el("details", { class: "raw-details" }, el("summary", {}, "Raw response"), el("pre", {}, typeof raw === "string" ? raw : JSON.stringify(raw, null, 2)))
        );

        setRunStatus(cls, label);
        $("#runTime").textContent = `${elapsed}s total`;
        if (p) {
          p.lastRun = { kind: result.kind, at: Date.now() };
          savePrograms();
        }
        recordRun(result.kind === "success");
      }

      consoleEl.scrollTop = consoleEl.scrollHeight;
      isRunning = false;
      runBtn.classList.remove("running");
      runBtn.disabled = false;
      $(".run-label", runBtn).textContent = "Run";
    }

    /* ---------- Editor options ---------- */
    function setWordWrap(on) {
      settings.wordWrap = on;
      saveSettings();
      $("#wrapToggle").setAttribute("aria-pressed", String(on));
      if (editor) editor.updateOptions({ wordWrap: on ? "on" : "off" });
      if (fallbackTextarea) fallbackTextarea.style.whiteSpace = on ? "pre-wrap" : "pre";
    }
    function setMinimap(on) {
      settings.minimap = on;
      saveSettings();
      $("#minimapToggle").setAttribute("aria-pressed", String(on));
      if (editor) editor.updateOptions({ minimap: { enabled: on } });
    }
    function setFontSize(size) {
      size = Math.max(10, Math.min(28, size));
      settings.fontSize = size;
      saveSettings();
      $("#fontSizeLabel").textContent = size;
      if (editor) editor.updateOptions({ fontSize: size, lineHeight: Math.round(size * 1.6) });
      if (fallbackTextarea) fallbackTextarea.style.fontSize = size + "px";
    }

    /* ---------- Settings dialog ---------- */
    function openSettings(focusKey = false) {
      const dlg = $("#settingsDialog");
      const cfgKey = window.JAVAFORGE_CONFIG && window.JAVAFORGE_CONFIG.apiKey && !/PASTE-YOUR/i.test(window.JAVAFORGE_CONFIG.apiKey);
      $("#apiKeyInput").value = settings.apiKey || "";
      $("#apiKeyInput").placeholder = cfgKey ? "Using key from config.js (paste here to override)" : "Paste your API key";
      $("#apiKeyHint").textContent = cfgKey
        ? "A key is loaded from config.js. Anything you paste here overrides it and is stored only in this browser."
        : "The key is stored only in this browser (LocalStorage). Get one free at onlinecompiler.io.";
      $("#apiKeyInput").type = "password";
      $("#toggleKeyBtn").textContent = "Show";
      $("#setAutosave").checked = settings.autosave;
      $("#setMinimap").checked = settings.minimap;
      $("#setWrap").checked = settings.wordWrap;
      $("#setClearOnRun").checked = settings.clearOnRun;
      dlg.returnValue = "";
      dlg.showModal();
      if (focusKey) $("#apiKeyInput").focus();
    }
    $("#settingsDialog").addEventListener("close", () => {
      if ($("#settingsDialog").returnValue !== "ok") return;
      settings.apiKey = $("#apiKeyInput").value.trim();
      settings.autosave = $("#setAutosave").checked;
      settings.clearOnRun = $("#setClearOnRun").checked;
      saveSettings();
      setMinimap($("#setMinimap").checked);
      setWordWrap($("#setWrap").checked);
      toast("Settings saved", "success");
    });
    $("#toggleKeyBtn").addEventListener("click", () => {
      const inp = $("#apiKeyInput");
      inp.type = inp.type === "password" ? "text" : "password";
      $("#toggleKeyBtn").textContent = inp.type === "password" ? "Show" : "Hide";
    });

    /* ---------- Splitter (resize side panel) ---------- */
    function setSidebarWidth(w) {
      const ws = $("#workspace");
      const avail = ws.clientWidth;
      const max = avail ? Math.max(280, avail - 360) : 2000;
      w = Math.max(280, Math.min(max, w));
      ws.style.setProperty("--side-width", w + "px");
      return w;
    }
    (function initSplitter() {
      const sp = $("#splitter");
      let startX = 0;
      let startW = 0;
      const move = (e) => setSidebarWidth(startW - (e.clientX - startX));
      const up = () => {
        sp.classList.remove("dragging");
        document.body.classList.remove("resizing");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        const w = parseInt(getComputedStyle($("#workspace")).getPropertyValue("--side-width"), 10);
        if (w) {
          settings.sidebarWidth = w;
          saveSettings();
        }
      };
      sp.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        startX = e.clientX;
        startW = $(".side-pane").getBoundingClientRect().width;
        sp.classList.add("dragging");
        document.body.classList.add("resizing");
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      });
      sp.addEventListener("dblclick", () => {
        settings.sidebarWidth = setSidebarWidth(400);
        saveSettings();
      });
    })();

    /* ---------- Routing ---------- */
    function showView(name) {
      const editorView = name === "editor";
      $("#dashboardView").hidden = editorView;
      $("#editorView").hidden = !editorView;
      document.body.classList.toggle("in-editor", editorView);
      if (!editorView) document.title = "JavaForge";
    }

    function route() {
      const m = /^#\/edit\/([\w-]+)/.exec(location.hash);
      if (m) {
        openProgram(m[1]);
      } else {
        flushSave();
        currentId = null;
        showView("dashboard");
        renderDashboard();
      }
    }
    window.addEventListener("hashchange", route);

    /* ---------- Wire up UI ---------- */
    $("#themeSelect").addEventListener("change", (e) => applyTheme(e.target.value));
    $("#modeToggle").addEventListener("click", toggleMode);
    $("#settingsBtn").addEventListener("click", () => openSettings());
    $("#dashNewBtn").addEventListener("click", newProgram);
    $("#emptyNewBtn").addEventListener("click", newProgram);
    $("#newBtn").addEventListener("click", newProgram);
    $("#backBtn").addEventListener("click", () => (location.hash = "#/"));
    $("#saveBtn").addEventListener("click", () => saveNow(true));
    $("#runBtn").addEventListener("click", runCode);
    $("#clearConsoleBtn").addEventListener("click", () => {
      resetConsole();
      clearErrorMarks();
    });
    $("#clearInputBtn").addEventListener("click", () => {
      $("#stdinInput").value = "";
      onInputChange();
    });
    $("#wrapToggle").addEventListener("click", () => setWordWrap(!settings.wordWrap));
    $("#minimapToggle").addEventListener("click", () => setMinimap(!settings.minimap));
    $("#fontUp").addEventListener("click", () => setFontSize(settings.fontSize + 1));
    $("#fontDown").addEventListener("click", () => setFontSize(settings.fontSize - 1));
    $("#copyBtn").addEventListener("click", () => copyText(getCode()));
    $("#formatBtn").addEventListener("click", () => {
      if (editor) editor.getAction("editor.action.formatDocument")?.run();
      else toast("Formatting needs the advanced editor", "error");
    });
    $("#exportBtn").addEventListener("click", exportPrograms);
    $("#importBtn").addEventListener("click", () => $("#importFile").click());
    $("#importFile").addEventListener("change", (e) => {
      const f = e.target.files[0];
      if (f) importPrograms(f);
      e.target.value = "";
    });
    $("#searchInput").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderDashboard();
    });
    $("#sortSelect").addEventListener("change", (e) => {
      settings.sort = e.target.value;
      saveSettings();
      renderDashboard();
    });

    const nameSave = debounce(() => saveNow(false), 500);
    $("#programName").addEventListener("input", () => {
      setSaveState("saving");
      nameSave();
    });
    $("#programName").addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        if (e.key === "Escape") $("#programName").value = getProgram(currentId)?.name || "";
        e.target.blur();
      }
    });
    $("#programName").addEventListener("blur", () => {
      if (!$("#programName").value.trim()) $("#programName").value = getProgram(currentId)?.name || "Untitled";
      nameSave.cancel();
      saveNow(false);
      if (currentId) document.title = `${getProgram(currentId)?.name} — JavaForge`;
    });

    const inputSave = debounce(() => saveNow(false), 600);
    function onInputChange() {
      if (!currentId) return;
      setSaveState("saving");
      inputSave();
    }
    $("#stdinInput").addEventListener("input", onInputChange);

    // Global shortcuts (when focus is outside Monaco)
    window.addEventListener("keydown", (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const inEditor = document.body.classList.contains("in-editor");
      if (e.key === "s" || e.key === "S") {
        e.preventDefault(); // never show the browser's "Save page" dialog
        if (inEditor) saveNow(true);
      } else if (e.key === "Enter" && inEditor) {
        e.preventDefault();
        runCode();
      }
    });
    window.addEventListener("beforeunload", flushSave);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushSave();
      else if (!currentId) renderDashboard();
    });
    // Keep "x min ago" fresh
    setInterval(() => {
      if (!currentId) renderDashboard();
    }, 60000);
    // Other tabs editing the same storage
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEYS.programs && !currentId) {
        programs = (Store.read(STORAGE_KEYS.programs, []) || []).map(normalizeProgram);
        renderDashboard();
      }
    });

    /* ---------- Init ---------- */
    applyTheme(settings.theme, false);
    $("#sortSelect").value = settings.sort;
    $("#fontSizeLabel").textContent = settings.fontSize;
    $("#wrapToggle").setAttribute("aria-pressed", String(settings.wordWrap));
    $("#minimapToggle").setAttribute("aria-pressed", String(settings.minimap));
    setSidebarWidth(settings.sidebarWidth);
    window.addEventListener("resize", debounce(() => setSidebarWidth(settings.sidebarWidth), 150));
    renderTemplates();
    route();
    // Start loading Monaco in the background so the editor opens instantly.
    loadMonaco().catch(() => {});
  })();
}
