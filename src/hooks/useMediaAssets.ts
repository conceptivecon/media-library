import { useCallback, useEffect, useMemo, useState } from "react";
import type { MediaLibraryClient } from "../client/MediaLibraryClient";
import type { MediaAsset, MediaListParams, MediaListResponse } from "../types";

const EMPTY_PAGINATION: MediaListResponse["pagination"] = {
  total: 0,
  page: 1,
  limit: 20,
  pages: 0
};

export function useMediaAssets(client: MediaLibraryClient, params: MediaListParams) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await client.listAssets(params);
      setAssets(response.assets);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media assets.");
    } finally {
      setLoading(false);
    }
  }, [client, params]);

  useEffect(() => {
    void reload();
  }, [reload, paramsKey]);

  return { assets, pagination, loading, error, reload };
}
