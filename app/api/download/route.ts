// app/api/download/route.ts

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("filename");
  const downloadFolder = searchParams.get("folder") || "converted";

  if (!fileName) {
    return NextResponse.json(
      { error: "Filename is required." },
      { status: 400 }
    );
  }

  // Prevent directory traversal attacks
  const sanitizedFileName = path.basename(fileName);
  const sanitizedDownloadFolder = path
    .normalize(downloadFolder)
    .replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(
    process.cwd(),
    "public",
    sanitizedDownloadFolder,
    sanitizedFileName
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const fileStream = fs.createReadStream(filePath);
  const headers = new Headers();
  headers.set("Content-Type", "text/plain");
  headers.set(
    "Content-Disposition",
    `attachment; filename="${sanitizedFileName}"`
  );

  return new NextResponse(Readable.toWeb(fileStream) as ReadableStream, {
    headers,
  });
}
