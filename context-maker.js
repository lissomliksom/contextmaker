const fs = require("fs");
const path = require("path");

const baseDirectory = path.resolve(__dirname); // or specify your project's root directory
const outputFile = path.join(baseDirectory, "project-structure.md");

const excludeDirectories = [".git", "node_modules", ".next"];
const excludeExtensions = [".gitignore", ".env", ".env.local", ".ico", ".svg"];
const excludeFiles = [
  "context-maker.js",
  "project-structure.md",
  "README.md",
  "package-lock.json",
  "globals.css",
];

const systemPrompt = `Hello ChatGPT. I have a NextJS 14 project using React Server Components, and a Sanity v3 backend.

This is the problem I want to solve:
-- insert problem here --

This is my current directory-structure as of ${new Date().toLocaleString(
  "en-GB",
  {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
)}.

Please wait until you have the complete content of all files before suggesting one or more solutions to my problem. Please let me know if you have any questions or need any additional context to solve the problem.`;

function shouldExclude(file, stat) {
  if (stat.isDirectory() && excludeDirectories.includes(path.basename(file))) {
    return true;
  }

  if (!stat.isDirectory()) {
    if (excludeFiles.includes(path.basename(file))) {
      return true;
    }

    for (const ext of excludeExtensions) {
      if (path.basename(file).endsWith(ext)) {
        return true;
      }
    }
  }

  return false;
}

function formatDirectoryTree(
  dirPath,
  indent = "",
  structure = [],
  contents = []
) {
  const files = fs.readdirSync(dirPath);
  for (let file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    const relativePath = path.relative(baseDirectory, fullPath);
    if (!shouldExclude(fullPath, stat)) {
      if (stat.isDirectory()) {
        structure.push(`${indent}├─ ${file}/`);
        formatDirectoryTree(fullPath, indent + "   ", structure, contents);
      } else {
        structure.push(`${indent}├─ ${file}`);
        contents.push(
          `## File ${
            contents.length + 1
          }: ${relativePath}\n---\n${fs.readFileSync(fullPath, "utf8")}\n\n`
        );
      }
    }
  }
  return { structure, contents };
}

function generateDocumentation() {
  const { structure, contents } = formatDirectoryTree(baseDirectory);
  const writeStream = fs.createWriteStream(outputFile, { flags: "w" });
  writeStream.write(`${systemPrompt}\n\n# Project Directory Structure\n`);
  writeStream.write(structure.join("\n") + "\n\n");
  writeStream.write(
    `## Excluded directories:\n${excludeDirectories.join(", ")}\n`
  );
  writeStream.write(
    `## Excluded file-extensions:\n${excludeExtensions.join(", ")}\n`
  );
  writeStream.write(`## Excluded files:\n${excludeFiles.join(", ")}\n\n`);
  writeStream.write(`# File Contents (${contents.length} files)\n`);
  writeStream.write(contents.join(""));
  writeStream.end();
  console.log(`Documentation generated at: ${outputFile}`);
}

generateDocumentation();
