// /utils/fileUtils.ts
// This file contains utility functions for file operations.

"use server";

import * as fs from "fs/promises";
import path from "path";

export async function ensureConvertedDirExists() {
  const convertedDir = path.join(process.cwd(), "public", "converted");
  try {
    await fs.access(convertedDir);
  } catch {
    await fs.mkdir(convertedDir, { recursive: true });
  }
}

export async function emptyConvertedDir() {
  const convertedDir = path.join(process.cwd(), "public", "converted");
  try {
    const files = await fs.readdir(convertedDir);
    for (const file of files) {
      if (file.endsWith(".txt")) {
        await fs.unlink(path.join(convertedDir, file));
      }
    }
  } catch (error) {
    console.error("Error emptying converted directory:", error);
  }
}
