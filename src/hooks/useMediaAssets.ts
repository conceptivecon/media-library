import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaLibraryClient } from "../client/MediaLibraryClient";
import type { MediaAsset, MediaListParams, MediaListResponse } from "../types";

const EMPTY_PAGINATION: MediaListResponse["pagination"] = {
  total: 0,
  page: 1,
  limit: 20,
  pages: 0
};

export interface UseMediaAssetsResult {
  assets: MediaAsset[];
  pagination: MediaListResponse["pagination"];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useMediaAssets(
  client: MediaLibraryClient,
  params: MediaListParams
): UseMediaAssetsResult {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.listAssets(paramsRef.current);
      setAssets(response.assets);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media assets.");
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void reload();
  }, [reload, params.page, params.limit, params.search, params.type, params.context, params.contextId, params.sort]);

  return { assets, pagination, loading, error, reload };
}
