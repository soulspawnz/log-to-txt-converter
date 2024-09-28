// start-dev.js
// This script starts the development server and opens the browser

const { spawn } = require("child_process");
const { openBrowser } = require("./utils/openBrowser");

// Open the browser
openBrowser();

// Start the Next.js dev server
const nextDev = spawn("npx", ["next", "dev"], { stdio: "inherit" });

nextDev.on("close", (code) => {
  console.log(`Next.js dev server exited with code ${code}`);
});
