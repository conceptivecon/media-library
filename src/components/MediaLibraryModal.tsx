import { useMemo, useState } from "react";
import type { MediaLibraryClient } from "../client/MediaLibraryClient";
import { useMediaAssets } from "../hooks/useMediaAssets";
import { useMediaUpload } from "../hooks/useMediaUpload";
import type { MediaAsset, MediaAssetType, MediaContext, PickedMedia } from "../types";
import { MediaGrid } from "./MediaGrid";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { MediaUploadDropzone } from "./MediaUploadDropzone";

export interface MediaLibraryModalProps {
  open: boolean;
  onClose: () => void;
  client: MediaLibraryClient;
  context?: MediaContext;
  contextId?: string;
  multiple?: boolean;
  imagesOnly?: boolean;
  allowedTypes?: MediaAssetType[];
  maxFileSizeMb?: number;
  onPick: (items: PickedMedia[]) => void;
}

const mapPickedType = (type: MediaAssetType): PickedMedia["type"] => {
  if (type === "image") return "IMAGE";
  if (type === "video" || type === "360video") return "VIDEO";
  if (type === "document") return "DOCUMENT";
  return "EXTERNAL";
};

const buildUploadAccept = (
  imagesOnly: boolean,
  allowedTypes?: MediaAssetType[]
): string | undefined => {
  if (imagesOnly) return "image/*";

  const types = new Set(allowedTypes ?? ["image", "video", "external", "360video", "document"]);
  const accepted: string[] = [];

  if (types.has("image")) accepted.push("image/*");
  if (types.has("video") || types.has("360video")) accepted.push("video/*");
  if (types.has("document")) {
    accepted.push("application/pdf", ".pdf");
    accepted.push("application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx");
  }

  return accepted.length ? accepted.join(",") : undefined;
};

export function MediaLibraryModal({
  open,
  onClose,
  client,
  context = "shared",
  contextId,
  multiple = false,
  imagesOnly = false,
  allowedTypes,
  maxFileSizeMb = 25,
  onPick
}: MediaLibraryModalProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map());
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const filters = useMemo<MediaAssetType[] | undefined>(() => {
    if (allowedTypes && allowedTypes.length > 0) return allowedTypes;
    if (imagesOnly) return ["image"];
    return undefined;
  }, [allowedTypes, imagesOnly]);

  const listParams = {
    page,
    limit: 24,
    search,
    context,
    ...(contextId ? { contextId } : {})
  };

  const { assets, pagination, loading, error, reload } = useMediaAssets(client, listParams);
  const { uploading, progressText, uploadFiles } = useMediaUpload(client);
  const uploadAccept = buildUploadAccept(imagesOnly, allowedTypes);

  if (!open) return null;

  const filteredAssets = filters ? assets.filter((asset) => filters.includes(asset.type)) : assets;

  const handleToggle = (asset: MediaAsset) => {
    setSelected((prev) => {
      const next = multiple ? new Map(prev) : new Map<string, MediaAsset>();
      if (next.has(asset.id)) {
        next.delete(asset.id);
      } else {
        next.set(asset.id, asset);
      }
      return next;
    });
  };

  const handleUpload = async (files: File[]) => {
    const eligible = files.filter((file) => file.size <= maxFileSizeMb * 1024 * 1024);
    if (eligible.length === 0) return;
    await uploadFiles(eligible, {
      context,
      ...(contextId ? { contextId } : {})
    });
    await reload();
  };

  const handleConfirm = () => {
    const picked: PickedMedia[] = Array.from(selected.values()).map((asset) => ({
      id: asset.id,
      assetId: asset.id,
      url: asset.url,
      type: mapPickedType(asset.type),
      filename: asset.filename,
      thumbnail: asset.thumbnail,
      altText: asset.altText
    }));
    onPick(picked);
    onClose();
  };

  return (
    <div className="ml-overlay" onClick={onClose}>
      <div className="ml-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ml-header">
          <input
            className="ml-search"
            placeholder="Search media..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <button className="ml-btn ml-btn-secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <MediaUploadDropzone
          onFiles={handleUpload}
          disabled={uploading}
          {...(uploadAccept ? { accept: uploadAccept } : {})}
        />

        {progressText ? <p className="ml-muted">{progressText}</p> : null}
        {loading ? <p className="ml-muted">Loading...</p> : null}
        {error ? <p className="ml-error">{error}</p> : null}

        {!loading ? (
          <MediaGrid
            assets={filteredAssets}
            selectedIds={new Set(selected.keys())}
            onToggle={handleToggle}
            onPreview={setPreviewAsset}
          />
        ) : null}

        <div className="ml-pagination">
          <button
            type="button"
            className="ml-btn ml-btn-secondary"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <span className="ml-muted">
            Page {pagination.page} of {Math.max(1, pagination.pages)}
          </span>
          <button
            type="button"
            className="ml-btn ml-btn-secondary"
            onClick={() => setPage((current) => Math.min(Math.max(1, pagination.pages), current + 1))}
            disabled={page >= Math.max(1, pagination.pages) || loading}
          >
            Next
          </button>
        </div>

        <div className="ml-footer">
          <button
            className="ml-btn ml-btn-secondary"
            type="button"
            onClick={() => setSelected(new Map())}
          >
            Clear
          </button>
          <button className="ml-btn" type="button" onClick={handleConfirm} disabled={selected.size === 0}>
            Use selected ({selected.size})
          </button>
        </div>
      </div>
      <MediaPreviewDialog asset={previewAsset} onClose={() => setPreviewAsset(null)} />
    </div>
  );
}
