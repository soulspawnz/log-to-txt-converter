// /api/merge-txt/route.ts
// This file is used to merge multiple TXT files into a single TXT file.

"use server";

import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();
    console.log("Received files for merging:", files);

    let mergedContent = "";

    for (const fileName of files) {
      const filePath = join(process.cwd(), "public", "converted", fileName);
      const content = await readFile(filePath, "utf-8");
      mergedContent += content + "\n";
    }

    const mergedFileName = "merged.txt";
    const mergedFilePath = join(
      process.cwd(),
      "public",
      "converted",
      mergedFileName
    );
    await writeFile(mergedFilePath, mergedContent);

    console.log("TXT files merged successfully");
    return NextResponse.json({ mergedFileName });
  } catch (error) {
    console.error("Error in merge-txt route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
