import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { Readable } from "stream";

export async function GET(request: NextRequest) {
  const convertedDir = path.join(process.cwd(), "public", "converted");
  const zipFileName = "converted_files.zip";
  const zipFilePath = path.join(convertedDir, zipFileName);

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });

  const output = fs.createWriteStream(zipFilePath);

  archive.pipe(output);

  const files = fs.readdirSync(convertedDir);
  files.forEach((file) => {
    if (file.endsWith(".txt")) {
      const filePath = path.join(convertedDir, file);
      archive.file(filePath, { name: file });
    }
  });

  await archive.finalize();

  await new Promise((resolve) => {
    output.on("close", resolve);
  });

  const fileStream = fs.createReadStream(zipFilePath);
  const headers = new Headers();
  headers.set("Content-Type", "application/zip");
  headers.set("Content-Disposition", `attachment; filename="${zipFileName}"`);

  return new NextResponse(Readable.toWeb(fileStream) as ReadableStream, {
    headers,
  });
}
