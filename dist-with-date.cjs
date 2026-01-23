const { spawn } = require("child_process");
const path = require("path");

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const releaseDate = formatDate(new Date());
const cliPath = path.join(__dirname, "node_modules", "electron-builder", "cli.js");
const args = [cliPath, ...process.argv.slice(2)];

const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env: { ...process.env, RELEASE_DATE: releaseDate },
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
