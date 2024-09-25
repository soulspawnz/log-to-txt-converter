import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import { mkdirSync } from "fs";
import { join } from "path";
import os from "os";
import path from "path";
import { existsSync } from "fs";
import { ensureConvertedDirExists, emptyConvertedDir } from "../../../utils/fileUtils";

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
  ensureConvertedDirExists();
  emptyConvertedDir(); // Add this line to empty the converted directory

  const formData = await request.formData();
  const files = formData.getAll("file") as File[];

  const convertedFiles: string[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, file.name);
    await writeFile(tempFilePath, buffer);

    const content = await readFile(tempFilePath, "utf-8");
    const convertedContent = content.replace(/\r\n/g, "\n");

    const convertedFileName = path.basename(file.name, ".log") + ".txt";
    const convertedFilePath = join(
      process.cwd(),
      "public",
      "converted",
      convertedFileName
    );
    await writeFile(convertedFilePath, convertedContent);

    convertedFiles.push(convertedFileName);
  }

  return NextResponse.json({ convertedFiles });
}
