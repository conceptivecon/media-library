import { useState } from "react";
import type { MediaLibraryClient } from "../client/MediaLibraryClient";
import type { MediaAsset, MediaAssetType, MediaContext } from "../types";

export interface UploadFilesOptions {
  context: MediaContext;
  contextId?: string;
  inferType?: (file: File) => MediaAssetType;
}

function defaultInferType(file: File): MediaAssetType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (
    file.type === "application/pdf" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".pdf") ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    return "document";
  }
  return "external";
}

export function useMediaUpload(client: MediaLibraryClient) {
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState("");

  const uploadFiles = async (
    files: File[],
    options: UploadFilesOptions
  ): Promise<MediaAsset[]> => {
    if (!files.length) return [];

    setUploading(true);
    setProgressText("Preparing upload...");

    const createdAssets: MediaAsset[] = [];

    try {
      for (const [index, file] of files.entries()) {
        setProgressText(`Uploading ${index + 1}/${files.length}: ${file.name}`);

        const presignInput = {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          context: options.context,
          ...(options.contextId ? { contextId: options.contextId } : {})
        };

        const presigned = await client.presignUpload(presignInput);

        const uploadResponse = await fetch(presigned.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream"
          }
        });

        if (!uploadResponse.ok) {
          throw new Error(
            `Upload failed for ${file.name}: ${uploadResponse.status} ${uploadResponse.statusText}`
          );
        }

        const createInput = {
          filename: file.name,
          type: (options.inferType ?? defaultInferType)(file),
          url: presigned.publicUrl,
          storageKey: presigned.key,
          sizeBytes: file.size,
          context: options.context,
          ...(file.type ? { mimeType: file.type } : {}),
          ...(options.contextId ? { contextId: options.contextId } : {})
        };

        const created = await client.createAsset(createInput);

        createdAssets.push(created);
      }

      setProgressText(`Uploaded ${createdAssets.length} file(s).`);
      return createdAssets;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, progressText, uploadFiles };
}
