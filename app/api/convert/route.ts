// /app/api/convert/route.ts
// This file contains the API route for converting log files to text files.

import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import os from "os";
import path from "path";
import {
  ensureConvertedDirExists,
  emptyConvertedDir,
} from "../../../utils/fileUtils";
import { existsSync, mkdirSync } from "fs";

// New configuration approach
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Directory to save converted files
const CONVERTED_DIR = path.join(process.cwd(), "public", "converted");

// Ensure the directory exists
if (!existsSync(CONVERTED_DIR)) {
  mkdirSync(CONVERTED_DIR, { recursive: true });
}

// Call this function where needed
ensureConvertedDirExists();

export async function POST(request: NextRequest) {
  console.log("Convert API route hit");
  try {
    await ensureConvertedDirExists();
    await emptyConvertedDir();

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    console.log(`Received ${files.length} files for conversion`);

    const convertedFiles: string[] = [];

    for (const file of files) {
      console.log(`Processing file: ${file.name}`);
      const buffer = Buffer.from(await file.arrayBuffer());
      const tempDir = os.tmpdir();
      const tempFilePath = join(tempDir, file.name);
      await writeFile(tempFilePath, buffer);

      const content = await readFile(tempFilePath, "utf-8");
      const convertedContent = content.replace(/\r\n/g, "\n");

      const convertedFileName = path.basename(file.name, ".log") + ".txt";
      const convertedFilePath = join(CONVERTED_DIR, convertedFileName);
      await writeFile(convertedFilePath, convertedContent);

      convertedFiles.push(convertedFileName);
      console.log(`Converted ${file.name} to ${convertedFileName}`);
    }

    console.log("Conversion completed successfully");
    return NextResponse.json({ convertedFiles });
  } catch (error) {
    console.error("Error in convert route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
