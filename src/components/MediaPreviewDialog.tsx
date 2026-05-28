import type { MediaAsset } from "../types";

interface MediaPreviewDialogProps {
  asset: MediaAsset | null;
  onClose: () => void;
}

export function MediaPreviewDialog({ asset, onClose }: MediaPreviewDialogProps) {
  if (!asset) return null;

  return (
    <div className="ml-preview-backdrop" onClick={onClose}>
      <div className="ml-preview" onClick={(e) => e.stopPropagation()}>
        <button className="ml-btn ml-btn-secondary" onClick={onClose} type="button">Close</button>
        {asset.type === "image" ? (
          <img src={asset.url} alt={asset.altText ?? asset.filename} />
        ) : asset.type === "video" || asset.type === "360video" ? (
          <video src={asset.url} controls />
        ) : asset.type === "document" ? (
          <div className="ml-document-preview">
            <div>
              <strong>{asset.filename}</strong>
              <p className="ml-muted">Document preview is handled by the browser or host app.</p>
            </div>
            <a className="ml-btn" href={asset.url} target="_blank" rel="noreferrer">
              Open document
            </a>
          </div>
        ) : (
          <a href={asset.url} target="_blank" rel="noreferrer">Open external media</a>
        )}
      </div>
    </div>
  );
}
