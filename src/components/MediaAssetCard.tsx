import clsx from "clsx";
import type { MediaAsset } from "../types";

interface MediaAssetCardProps {
  asset: MediaAsset;
  selected: boolean;
  onToggle: (asset: MediaAsset) => void;
  onPreview?: (asset: MediaAsset) => void;
  disabled?: boolean;
}

export function MediaAssetCard({
  asset,
  selected,
  onToggle,
  onPreview,
  disabled
}: MediaAssetCardProps) {
  return (
    <div className={clsx("ml-card", selected && "is-selected")}>
      <button
        type="button"
        className="ml-card-select"
        onClick={() => onToggle(asset)}
        disabled={disabled}
      >
        <div className="ml-card-media">
          {asset.type === "image" ? (
            <img src={asset.thumbnail ?? asset.url} alt={asset.altText ?? asset.filename} />
          ) : (
            <div className="ml-card-fallback">{asset.type.toUpperCase()}</div>
          )}
        </div>
        <div className="ml-card-meta">
          <strong title={asset.filename}>{asset.filename}</strong>
        </div>
      </button>
      <div className="ml-card-actions">
        <button type="button" className="ml-btn ml-btn-secondary" onClick={() => onPreview?.(asset)}>
          Preview
        </button>
      </div>
    </div>
  );
}
