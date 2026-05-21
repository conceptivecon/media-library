# @conceptive/media-library

Reusable media-library package for Conceptive applications. It provides UI components, headless hooks, shared types, and a pluggable API client contract.

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
- Storage provider integration (S3/R2/GCS/etc.)
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
- Prisma belongs to the host app; snippets in `prisma/` are examples only.
- Attachment and domain rules remain in each host application.
