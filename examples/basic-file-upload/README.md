# Basic File Upload

A minimal Next.js example that uploads files to Lens Chain storage (Grove) with Lens account ACL.

## Quick Start

```bash
bun install
bun dev
```

## How It Works

1. Enter your Lens account address (0x...)
2. Drag & drop a file or click to select one
3. Click Upload

The file is uploaded to Grove (Lens Chain storage) with an ACL scoped to the provided Lens account address. The response includes a `lens://` URI, a gateway URL, and a storage key.

## Upload API

**Endpoint:** `POST /api/storage/upload`

**Request:** `multipart/form-data` with:
- `file` - The file to upload
- `account` - Lens account address (0x...)

**Response:**
```json
{
  "message": "File uploaded",
  "uri": "lens://...",
  "gatewayUrl": "https://...",
  "storageKey": "..."
}
```

## Supported File Types

Images (JPEG, PNG, GIF, WebP, SVG, AVIF, HEIC, BMP, TIFF), video (MP4, WebM, QuickTime, MPEG, OGG), and audio (MP3, WAV, OGG, MP4, WebM, FLAC). Max 100 MB.
