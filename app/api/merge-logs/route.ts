import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];

  let mergedContent = "";

  for (const file of files) {
    const content = await file.text();
    mergedContent += content + "\n";
  }

  const mergedFileName = "merged.log";
  const mergedFilePath = join(
    process.cwd(),
    "public",
    "converted",
    mergedFileName
  );
  await writeFile(mergedFilePath, mergedContent);

  return NextResponse.json({ mergedFileName, mergedContent });
}
