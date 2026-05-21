import { useMemo, useState } from "react";
import type { MediaLibraryClient } from "../client/MediaLibraryClient";
import { useMediaAssets } from "../hooks/useMediaAssets";
import { useMediaUpload } from "../hooks/useMediaUpload";
import type { MediaAsset, MediaAssetType, MediaContext, PickedMedia } from "../types";
import { MediaGrid } from "./MediaGrid";
import { MediaPreviewDialog } from "./MediaPreviewDialog";
import { MediaUploadDropzone } from "./MediaUploadDropzone";

interface MediaLibraryModalProps {
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

const mapPickedType = (type: MediaAssetType): PickedMedia["type"] =>
  type === "image" ? "IMAGE" : type === "video" || type === "360video" ? "VIDEO" : "EXTERNAL";

export function MediaLibraryModal(props: MediaLibraryModalProps) {
  const { open, onClose, client, context = "shared", contextId, multiple, imagesOnly, allowedTypes, maxFileSizeMb = 25, onPick } = props;
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map());
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);

  const filters: MediaAssetType[] | undefined = useMemo(() => {
    if (allowedTypes?.length) return allowedTypes;
    if (imagesOnly) return ["image"];
    return undefined;
  }, [allowedTypes, imagesOnly]);

  const { assets, loading, error, reload } = useMediaAssets(client, {
    page: 1,
    limit: 50,
    search,
    context,
    contextId
  });
  const { uploading, progressText, uploadFiles } = useMediaUpload(client);

  if (!open) return null;

  const filteredAssets = filters ? assets.filter((a) => filters.includes(a.type)) : assets;

  const toggle = (asset: MediaAsset) => {
    setSelected((prev) => {
      const next = multiple ? new Map(prev) : new Map<string, MediaAsset>();
      if (next.has(asset.id)) next.delete(asset.id);
      else next.set(asset.id, asset);
      return next;
    });
  };

  const handleUpload = async (files: File[]) => {
    const eligible = files.filter((f) => f.size / 1024 / 1024 <= maxFileSizeMb);
    if (!eligible.length) return;
    await uploadFiles(eligible, { context, contextId });
    await reload();
  };

  const confirm = () => {
    const picked: PickedMedia[] = Array.from(selected.values()).map((asset) => ({
      id: asset.id,
      assetId: asset.id,
      url: asset.url,
      filename: asset.filename,
      thumbnail: asset.thumbnail,
      altText: asset.altText,
      type: mapPickedType(asset.type)
    }));
    onPick(picked);
    onClose();
  };

  return (
    <div className="ml-overlay" onClick={onClose}>
      <div className="ml-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ml-header">
          <input className="ml-search" placeholder="Search media..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="ml-btn ml-btn-secondary" type="button" onClick={onClose}>Close</button>
        </div>
        <MediaUploadDropzone onFiles={handleUpload} disabled={uploading} accept={imagesOnly ? "image/*" : undefined} />
        {progressText ? <p className="ml-muted">{progressText}</p> : null}
        {loading ? <p>Loading...</p> : <MediaGrid assets={filteredAssets} selectedIds={new Set(selected.keys())} onToggle={toggle} />}
        {error ? <p className="ml-error">{error}</p> : null}
        <div className="ml-footer">
          <button className="ml-btn ml-btn-secondary" type="button" onClick={() => setSelected(new Map())}>Clear</button>
          <button className="ml-btn" type="button" onClick={confirm} disabled={!selected.size}>Use selected ({selected.size})</button>
        </div>
      </div>
      <MediaPreviewDialog asset={previewAsset} onClose={() => setPreviewAsset(null)} />
    </div>
  );
}
