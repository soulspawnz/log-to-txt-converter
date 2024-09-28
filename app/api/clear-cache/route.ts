// /api/clear-cache/route.ts
// Clears the cache by deleting all files in the "converted" directory

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST() {
  try {
    const convertedDir = path.join(process.cwd(), "public", "converted");
    const files = await fs.readdir(convertedDir);

    for (const file of files) {
      await fs.unlink(path.join(convertedDir, file));
    }

    console.log("Cache cleared successfully");
    return NextResponse.json({ message: "Cache cleared successfully" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return NextResponse.json(
      { error: "Failed to clear cache" },
      { status: 500 }
    );
  }
}
