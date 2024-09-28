"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  UploadIcon,
  DownloadIcon,
  FileIcon,
  AlertCircle,
  XIcon,
  TrashIcon,
  MergeIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function LogToTxtConverter() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<string[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mergedLogFile, setMergedLogFile] = useState<File | null>(null);
  const [mergedTxtFile, setMergedTxtFile] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(event.target.files || []),
      ]);
      setError(null);
    }
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const removeAllUploadedFiles = () => {
    setUploadedFiles([]);
  };

  const removeConvertedFile = (index: number) => {
    setConvertedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const removeAllConvertedFiles = () => {
    setConvertedFiles([]);
  };

  const convertFiles = async () => {
    setIsConverting(true);
    setError(null);

    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("file", file);
    });

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to convert files.");
      }

      const data = await response.json();
      if (Array.isArray(data.convertedFiles)) {
        setConvertedFiles(data.convertedFiles);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error converting files:", error);
      setError("An error occurred while converting files. Please try again.");
      setConvertedFiles([]);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadFile = async (fileName: string) => {
    try {
      const response = await fetch(
        `/api/download?filename=${encodeURIComponent(fileName)}`
      );
      if (!response.ok) {
        throw new Error("Failed to download file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      setError(
        "An error occurred while downloading the file. Please try again."
      );
    }
  };

  const downloadAllFiles = async () => {
    try {
      const response = await fetch("/api/download-all");
      if (!response.ok) {
        throw new Error("Failed to download zip file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "converted_files.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading zip file:", error);
      setError(
        "An error occurred while downloading all files. Please try again."
      );
    }
  };

  const mergeLogFiles = async () => {
    if (uploadedFiles.length < 2) {
      setError("You need at least two files to merge.");
      return;
    }

    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      console.log("Sending merge request");
      const response = await fetch("/api/merge-logs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to merge log files. Status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Merge response:", data);
      setMergedLogFile(
        new File([data.mergedContent], "merged.log", { type: "text/plain" })
      );
    } catch (error) {
      console.error("Error merging log files:", error);
      setError("An error occurred while merging log files. Please try again.");
    }
  };

  const mergeTxtFiles = async () => {
    if (convertedFiles.length < 2) {
      setError("You need at least two files to merge.");
      return;
    }

    try {
      const response = await fetch("/api/merge-txt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: convertedFiles }),
      });

      if (!response.ok) {
        throw new Error("Failed to merge txt files.");
      }

      const data = await response.json();
      setMergedTxtFile(data.mergedFileName);
    } catch (error) {
      console.error("Error merging txt files:", error);
      setError("An error occurred while merging txt files. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LOG to TXT Converter</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle>Upload .log Files</CardTitle>
            <CardDescription>Select .log files to convert</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Choose .log files</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".log"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button asChild>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Choose Files
                    </label>
                  </Button>
                  {uploadedFiles.length > 0 && (
                    <Button variant="outline" onClick={removeAllUploadedFiles}>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Remove All
                    </Button>
                  )}
                </div>
              </div>
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Uploaded files:</h3>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <FileIcon className="w-4 h-4 mr-2" />
                          {file.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                        >
                          <XIcon className="w-4 h-4" />
                          <span className="sr-only">Remove {file.name}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={convertFiles}
              disabled={uploadedFiles.length === 0 || isConverting}
            >
              {isConverting ? (
                <>Converting...</>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Convert Files
                </>
              )}
            </Button>
            <Button
              className="w-full"
              onClick={mergeLogFiles}
              disabled={uploadedFiles.length < 2}
            >
              <MergeIcon className="w-4 h-4 mr-2" />
              Merge LOG Files
            </Button>
          </CardFooter>
        </Card>

        <Card className="w-full lg:w-1/2">
          <CardHeader>
            <CardTitle>Converted .txt Files</CardTitle>
            <CardDescription>Download your converted files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {convertedFiles.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Converted files:</h3>
                    <Button variant="outline" onClick={removeAllConvertedFiles}>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Remove All
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {convertedFiles.map((fileName, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <FileIcon className="w-4 h-4 mr-2" />
                          {fileName}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(fileName)}
                          >
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            <span className="sr-only">Download {fileName}</span>
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeConvertedFile(index)}
                          >
                            <XIcon className="w-4 h-4" />
                            <span className="sr-only">Remove {fileName}</span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  No converted files yet.
                </p>
              )}
              {mergedLogFile && (
                <div>
                  <h3 className="font-medium mb-2">Merged LOG file:</h3>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileIcon className="w-4 h-4 mr-2" />
                      {mergedLogFile.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(mergedLogFile.name)}
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              {mergedTxtFile && (
                <div>
                  <h3 className="font-medium mb-2">Merged TXT file:</h3>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <FileIcon className="w-4 h-4 mr-2" />
                      {mergedTxtFile}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(mergedTxtFile)}
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {convertedFiles.length > 0 && (
              <>
                <Button
                  className="w-full"
                  onClick={downloadAllFiles}
                  variant="outline"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <Button
                  className="w-full"
                  onClick={mergeTxtFiles}
                  disabled={convertedFiles.length < 2}
                >
                  <MergeIcon className="w-4 h-4 mr-2" />
                  Merge TXT Files
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
