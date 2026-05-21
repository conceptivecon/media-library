import type { ReactNode } from "react";
import type { MediaLibraryClient } from "./client/MediaLibraryClient";

export type MediaAssetType = "image" | "video" | "external" | "360video";

export type MediaContext =
  | "products"
  | "variants"
  | "categories"
  | "collections"
  | "cms"
  | "campaigns"
  | "testimonials"
  | "shared"
  | (string & {});

export interface MediaAsset {
  id: string;
  filename: string;
  type: MediaAssetType;
  url: string;
  storageKey?: string;
  thumbnail?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  context?: MediaContext;
  contextId?: string;
  externalPlatform?: string;
  altText?: string;
  tags?: string[];
  uploadedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PickedMedia {
  id: string;
  assetId: string;
  url: string;
  type: "IMAGE" | "VIDEO" | "EXTERNAL";
  filename: string;
  thumbnail?: string;
  altText?: string;
}

export interface MediaListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: MediaAssetType;
  context?: MediaContext;
  contextId?: string;
  sort?: "newest" | "oldest" | "name-asc" | "name-desc" | "size-desc";
}

export interface MediaListResponse {
  assets: MediaAsset[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface PresignUploadRequest {
  filename: string;
  contentType: string;
  context: MediaContext;
  contextId?: string;
}

export interface PresignUploadResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface CreateMediaAssetRequest {
  filename: string;
  type?: MediaAssetType;
  url: string;
  storageKey?: string;
  thumbnail?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  context?: MediaContext;
  contextId?: string;
  externalPlatform?: string;
  altText?: string;
  tags?: string[];
}

export interface MediaLibraryPickerProps {
  client: MediaLibraryClient;
  label?: string;
  context?: MediaContext;
  contextId?: string;
  multiple?: boolean;
  imagesOnly?: boolean;
  allowedTypes?: MediaAssetType[];
  maxFileSizeMb?: number;
  onPick(items: PickedMedia[]): void;
  renderTrigger?(open: () => void): ReactNode;
  className?: string;
}
