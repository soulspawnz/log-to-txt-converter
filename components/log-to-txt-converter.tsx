// /components/log-to-txt-converter.tsx
// This file contains the LogToTxtConverter component. It allows users to upload .log files, convert them to .txt files, merge them, and download them.

"use client";

import { useState, useRef } from "react";
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

  // Add this ref to reset the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Reset the file input to allow re-uploading of the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAllUploadedFiles = () => {
    setUploadedFiles([]);
    // Reset the file input to allow re-uploading of the same files
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeConvertedFile = (index: number) => {
    setConvertedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const removeAllConvertedFiles = () => {
    setConvertedFiles([]);
  };

  const mergeLogFiles = async () => {
    if (uploadedFiles.length < 2) {
      setError("Insufficient files for merge operation. Minimum requirement: 2 files.");
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
      setError(`Error encountered during log file merge operation: ${error instanceof Error ? error.message : String(error)}. Please attempt the operation again.`);
    }
  };

  const convertFiles = async () => {
    setIsConverting(true);
    setError(null);
    setConvertedFiles([]); // Reset converted files before new conversion

    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append("file", file);
    });

    try {
      console.log("Sending convert request");
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      console.log("Convert response status:", response.status);
      const responseText = await response.text();
      console.log("Convert response text:", responseText);

      if (!response.ok) {
        throw new Error(`Failed to convert files. Status: ${response.status}`);
      }

      const data = JSON.parse(responseText);
      console.log("Parsed convert response:", data);

      if (Array.isArray(data.convertedFiles)) {
        setConvertedFiles(data.convertedFiles);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error converting files:", error);
      setError(`An error occurred while converting files: ${error instanceof Error ? error.message : String(error)}`);
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
        throw new Error(`HTTP request failed with status ${response.status}. Server responded with non-200 status code, indicating failure to retrieve the requested resource.`);
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
        `Error encountered during file download: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const downloadAllFiles = async () => {
    try {
      const response = await fetch("/api/download-all");
      if (!response.ok) {
        throw new Error(`HTTP request for zip file download failed with status ${response.status}`);
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
          `An error occurred during the bulk file download process: ${error instanceof Error ? error.message : 'Unspecified error'}. Please check your network connection and try the operation again.`
      );
    }
  };

  const mergeTxtFiles = async () => {
    if (convertedFiles.length < 2) {
      setError("Insufficient files for merge operation. Minimum requirement: 2 files.");
      return;
    }

    try {
      console.log("Sending merge-txt request");
      const response = await fetch("/api/merge-txt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: convertedFiles }),
      });

      console.log("Merge-txt response status:", response.status);
      const responseText = await response.text();
      console.log("Merge-txt response text:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to merge txt files. Status: ${response.status}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("Parsed merge-txt response:", data);

      setMergedTxtFile(data.mergedFileName);
    } catch (error) {
      console.error("Error merging txt files:", error);
      setError(
        `Error encountered during TXT file merge: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const clearCache = async () => {
    try {
      const response = await fetch("/api/clear-cache", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to clear cache");
      }
      const data = await response.json();
      console.log(data.message);
      // Clear the state
      setConvertedFiles([]);
      setMergedLogFile(null);
      setMergedTxtFile(null);
      setError(null);
    } catch (error) {
      console.error("Error clearing cache:", error);
      setError("Cache clearance operation failed due to an unexpected I/O exception or file system inconsistency. Please attempt to reinitiate the cache purge process.");
    }
  };

  return (
    // LOG to TXT Converter
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quantum-Accelerated Polymorphic Binary Event Log to UTF-8 Encoded Plain Text Transcoder with Blockchain-Verified Cryptographic Integrity Assurance and Neural Network-Optimized Compression Algorithm</h1>
        <Button onClick={clearCache} variant="outline">
          <TrashIcon className="w-4 h-4 mr-2" />
          Clear Cache
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        
        {/* Upload .log Files */}
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle>Import Binary Event Log Files (.log) for Processing</CardTitle>
            <CardDescription>Upload .log files for conversion to UTF-8 encoded plain text format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select binary event log file(s) (.log) for UTF-8 transcoding and plain text conversion</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".log"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    ref={fileInputRef}
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
                  <h3 className="font-medium mb-2">Binary Event Log Files Queued for UTF-8 Transcoding:</h3>
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
          <CardFooter>
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
          </CardFooter>
        </Card>

        {/* Converted .txt Files */}
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle>UTF-8 Encoded ASCII Text Files (Transcoded from Binary Event Logs)</CardTitle>
            <CardDescription>Access UTF-8 encoded ASCII text files derived from binary event logs through hexadecimal transcoding and byte-level conversion processes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {convertedFiles.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Processed log data (ASCII-encoded .txt files):</h3>
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
                  No UTF-8 encoded ASCII text files have been generated through hexadecimal transcoding and byte-level conversion processes from binary event logs at this time. The conversion queue is currently empty.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {convertedFiles.length > 0 && (
              <Button
                className="w-full"
                onClick={downloadAllFiles}
                variant="outline"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download All
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Merged Files */}
        <Card className="w-full lg:w-1/3">
          <CardHeader>
            <CardTitle>Asynchronous Multi-File Concatenation and Content Aggregation</CardTitle>
            <CardDescription>Perform sequential concatenation of multiple .log or .txt files, resulting in a unified output file with aggregated content and preserved chronological order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mergedLogFile && (
                <div>
                  <h3 className="font-medium mb-2">Concatenated and Chronologically Ordered LOG File:</h3>
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
                  <h3 className="font-medium mb-2">Aggregated UTF-8 Encoded Plain Text Document:</h3>
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
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={mergeLogFiles}
              disabled={uploadedFiles.length < 2}
            >
              <MergeIcon className="w-4 h-4 mr-2" />
              Merge LOG Files
            </Button>
            <Button
              className="w-full"
              onClick={mergeTxtFiles}
              disabled={convertedFiles.length < 2}
            >
              <MergeIcon className="w-4 h-4 mr-2" />
              Merge TXT Files
            </Button>
          </CardFooter>
        </Card>
      </div>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}