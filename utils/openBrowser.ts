// /utils/openBrowser.ts
// This file contains the function to open the browser.

import { exec } from "child_process";

export function openBrowser(url: string = "http://localhost:3000") {
  const command =
    process.platform === "win32"
      ? `start ${url}`
      : process.platform === "darwin"
      ? `open ${url}`
      : `xdg-open ${url}`;

  console.log(`Attempting to open frontend at ${url}`);
  exec(command, (error) => {
    if (error) {
      console.error("Failed to open frontend:", error);
    } else {
      console.log("Frontend opened successfully");
    }
  });
}
