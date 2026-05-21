import type {
  CreateMediaAssetRequest,
  MediaAsset,
  MediaListParams,
  MediaListResponse,
  PresignUploadRequest,
  PresignUploadResponse
} from "../types";

export interface MediaLibraryClient {
  listAssets(params: MediaListParams): Promise<MediaListResponse>;
  presignUpload(input: PresignUploadRequest): Promise<PresignUploadResponse>;
  createAsset(input: CreateMediaAssetRequest): Promise<MediaAsset>;
  updateAsset?(
    id: string,
    input: Partial<CreateMediaAssetRequest>
  ): Promise<MediaAsset>;
  deleteAsset?(id: string): Promise<void>;
}
