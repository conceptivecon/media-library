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
  return "external";
}

export function useMediaUpload(client: MediaLibraryClient) {
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState<string>("");

  const uploadFiles = async (files: File[], options: UploadFilesOptions): Promise<MediaAsset[]> => {
    if (!files.length) return [];
    setUploading(true);
    const createdAssets: MediaAsset[] = [];
    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        setProgressText(`Uploading ${i + 1}/${files.length}: ${file.name}`);

        const presigned = await client.presignUpload({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          context: options.context,
          contextId: options.contextId
        });

        const uploadResponse = await fetch(presigned.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream"
          }
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}: ${uploadResponse.statusText}`);
        }

        const asset = await client.createAsset({
          filename: file.name,
          url: presigned.publicUrl,
          storageKey: presigned.key,
          mimeType: file.type || undefined,
          sizeBytes: file.size,
          context: options.context,
          contextId: options.contextId,
          type: (options.inferType ?? defaultInferType)(file)
        });

        createdAssets.push(asset);
      }

      setProgressText(`Uploaded ${createdAssets.length} file(s).`);
      return createdAssets;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    progressText,
    uploadFiles
  };
}
