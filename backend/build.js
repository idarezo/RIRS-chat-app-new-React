const fs = require("fs");
const path = require("path");

const buildDir = path.join(__dirname, "build");

const filesToCopy = ["server.js", "package.json", "package-lock.json"];

const foldersToCopy = [
  "routes",
  "controllers",
  "models",
  "middleware",
  "config",
];

fs.mkdirSync(buildDir, { recursive: true });

// copy files
for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(buildDir, file));
  }
}

// copy folders
for (const folder of foldersToCopy) {
  if (fs.existsSync(folder)) {
    fs.cpSync(folder, path.join(buildDir, folder), { recursive: true });
  }
}

console.log("✅ Backend build created in /build");
