// /app/api/merge-logs/route.ts
// This file contains the API route for merging log files.

import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
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

    console.log("Merge completed successfully");
    return NextResponse.json({ mergedFileName, mergedContent });
  } catch (error) {
    console.error("Error in merge-logs route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
