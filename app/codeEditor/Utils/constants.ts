export const LANGUAGE_VERSIONS = {
    javascript: "latest",
    typescript: "latest",
    python: "3.10",
    java: "17",
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