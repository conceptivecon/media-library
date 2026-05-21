import type {
  CreateMediaAssetRequest,
  MediaAsset,
  MediaListParams,
  MediaListResponse,
  PresignUploadRequest,
  PresignUploadResponse
} from "../types";
import type { MediaLibraryClient } from "./MediaLibraryClient";

export interface FetchMediaLibraryClientOptions {
  baseUrl?: string;
  getHeaders?: () => HeadersInit | Promise<HeadersInit>;
}

class MediaLibraryRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly payload: unknown,
    message?: string
  ) {
    super(message ?? `Media library request failed: ${status} ${statusText}`);
    this.name = "MediaLibraryRequestError";
  }
}

function toQueryString(params: MediaListParams): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function createFetchMediaLibraryClient(
  options: FetchMediaLibraryClientOptions = {}
): MediaLibraryClient {
  const baseUrl = options.baseUrl?.replace(/\/$/, "") ?? "";

  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const headers = await options.getHeaders?.();
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...headers,
        ...init?.headers
      }
    });

    const payload = await parseJsonResponse(response);

    if (!response.ok) {
      const detail =
        typeof payload === "object" && payload !== null && "message" in payload
          ? String((payload as Record<string, unknown>).message)
          : undefined;

      throw new MediaLibraryRequestError(
        response.status,
        response.statusText,
        payload,
        detail
      );
    }

    return payload as T;
  };

  return {
    listAssets: (params) =>
      request<MediaListResponse>(`/api/admin/media${toQueryString(params)}`, {
        method: "GET"
      }),
    presignUpload: (input) =>
      request<PresignUploadResponse>("/api/admin/uploads/presign", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    createAsset: (input) =>
      request<MediaAsset>("/api/admin/media", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    updateAsset: (id, input) =>
      request<MediaAsset>(`/api/admin/media/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      }),
    deleteAsset: async (id) => {
      await request<unknown>(`/api/admin/media/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    }
  };
}

export { MediaLibraryRequestError };
