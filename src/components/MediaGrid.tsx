import type { MediaAsset } from "../types";
import { MediaAssetCard } from "./MediaAssetCard";

interface MediaGridProps {
  assets: MediaAsset[];
  selectedIds: Set<string>;
  onToggle: (asset: MediaAsset) => void;
  emptyText?: string;
}

export function MediaGrid({ assets, selectedIds, onToggle, emptyText = "No assets found." }: MediaGridProps) {
  if (!assets.length) return <div className="ml-empty">{emptyText}</div>;

  return (
    <div className="ml-grid">
      {assets.map((asset) => (
        <MediaAssetCard
          key={asset.id}
          asset={asset}
          selected={selectedIds.has(asset.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
