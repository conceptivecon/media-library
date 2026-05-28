# @conceptive/media-library

Reusable media-library package for Conceptive applications. It provides UI components, headless hooks, shared types, and a pluggable API client contract.

Supported media types are `image`, `video`, `360video`, `external`, and `document`. Document support currently targets PDF and DOCX uploads.

## What this package owns

- Reusable React media picker/modal/grid/upload/preview components
- Shared media types and picker contracts
- `MediaLibraryClient` interface
- Default `fetch` client implementation (`createFetchMediaLibraryClient`)
- Package CSS styles
- Optional Prisma snippets under `prisma/` (templates only)

## What the host app owns

- Authentication/authorization
- API route implementations
- Storage provider integration (S3/R2/GCS/etc.), including presigned upload URL generation
- Product/business-specific attach-unlink rules
- Prisma schema finalization, migrations, and generated Prisma client

## Install

```bash
npm install @conceptive/media-library
```

## Usage

```tsx
import { MediaLibraryPicker, createFetchMediaLibraryClient, type PickedMedia } from "@conceptive/media-library";

const client = createFetchMediaLibraryClient({
  baseUrl: "",
  getHeaders: async () => ({ Authorization: `Bearer ${token}` })
});

export function ProductImageField() {
  return (
    <MediaLibraryPicker
      client={client}
      context="products"
      contextId="prod_123"
      multiple
      imagesOnly
      onPick={(items: PickedMedia[]) => {
        console.log(items);
      }}
    />
  );
}
```

## Document example

```tsx
<MediaLibraryPicker
  client={client}
  context="cms"
  allowedTypes={["document"]}
  onPick={(items) => {
    // PDF/DOCX files are returned as PickedMedia items with type "DOCUMENT".
    console.log(items);
  }}
/>
```

## `createFetchMediaLibraryClient()`

```ts
import { createFetchMediaLibraryClient } from "@conceptive/media-library";

const client = createFetchMediaLibraryClient({
  baseUrl: "https://admin.example.com",
  getHeaders: () => ({ "x-org-id": "org_1" })
});
```

Expected host endpoints:

- `GET /api/admin/media`
- `POST /api/admin/media`
- `POST /api/admin/uploads/presign`
- `PATCH /api/admin/media/:id` (optional)
- `DELETE /api/admin/media/:id` (optional)

## Notes

- This package is UI/client/types only.
- Storage is configurable in the host app. The package uploads to whatever presigned URL the host API returns, so R2 and S3 both work without package-specific storage code.
- Prisma belongs to the host app; snippets in `prisma/` are examples only.
- Attachment and domain rules remain in each host application.
