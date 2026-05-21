import clsx from "clsx";
import type { MediaAsset } from "../types";

interface MediaAssetCardProps {
  asset: MediaAsset;
  selected: boolean;
  onToggle: (asset: MediaAsset) => void;
  disabled?: boolean;
}

export function MediaAssetCard({ asset, selected, onToggle, disabled }: MediaAssetCardProps) {
  return (
    <button
      type="button"
      className={clsx("ml-card", selected && "is-selected")}
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
        <strong>{asset.filename}</strong>
      </div>
    </button>
  );
}
