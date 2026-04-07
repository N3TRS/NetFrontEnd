export const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
}

// Mapeo de nombres internos a IDs de Piston API
export const PISTON_LANGUAGE_MAP = {
    javascript: "javascript",
    typescript: "typescript",
    python: "python",
    java: "java",
}

// Extensiones de archivo para cada lenguaje
export const FILE_EXTENSIONS = {
    javascript: ".js",
    typescript: ".ts",
    python: ".py",
    java: ".java",
}

export const LANGUAGE_COLORS = {
    javascript: "#F7DF1E", // Amarillo oficial de JavaScript
    typescript: "#3178C6", // Azul oficial de TypeScript
    python: "#3776AB",     // Azul oficial de Python
    java: "#007396",       // Azul oficial de Java
}

export const CODE_SNIPPETS = {
    javascript: `// JavaScript Hello World
function greet(name) {
    console.log("Hello, " + name + "!");
}

greet("World");
`,
    typescript: `// TypeScript Hello World
function greet(name: string): void {
    console.log(\`Hello, \${name}!\`);
}

greet("World");
`,
    python: `# Python Hello World
def greet(name):
    print(f"Hello, {name}!")

greet("World")
`,
    java: `// Java Hello World
public class HelloWorld {
    public static void main(String[] args) {
        greet("World");
    }
    
    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }
}
`,
}