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

export class MediaLibraryRequestError extends Error {
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
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function resolveHeaders(
  getHeaders?: () => HeadersInit | Promise<HeadersInit>,
  base?: HeadersInit
): Promise<HeadersInit> {
  const dynamicHeaders = getHeaders ? await getHeaders() : undefined;
  return {
    ...(base ?? {}),
    ...(dynamicHeaders ?? {})
  };
}

export function createFetchMediaLibraryClient(
  options: FetchMediaLibraryClientOptions = {}
): MediaLibraryClient {
  const baseUrl = options.baseUrl?.replace(/\/$/, "") ?? "";

  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const isJsonBody = init.body !== undefined && init.body !== null;
    const headers = await resolveHeaders(options.getHeaders, {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {})
    });

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...headers,
        ...(init.headers ?? {})
      }
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      const detail =
        typeof payload === "object" && payload && "message" in payload
          ? String((payload as Record<string, unknown>).message)
          : undefined;
      throw new MediaLibraryRequestError(response.status, response.statusText, payload, detail);
    }

    return payload as T;
  };

  return {
    listAssets: (params) =>
      request<MediaListResponse>(`/api/admin/media${toQueryString(params)}`, {
        method: "GET"
      }),
    presignUpload: (input: PresignUploadRequest) =>
      request<PresignUploadResponse>("/api/admin/uploads/presign", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    createAsset: (input: CreateMediaAssetRequest) =>
      request<MediaAsset>("/api/admin/media", {
        method: "POST",
        body: JSON.stringify(input)
      }),
    updateAsset: (id: string, input: Partial<CreateMediaAssetRequest>) =>
      request<MediaAsset>(`/api/admin/media/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      }),
    deleteAsset: async (id: string) => {
      await request<void>(`/api/admin/media/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
    }
  };
}
