# Product Images on GitHub + jsDelivr

Astraya serves product images from GitHub through jsDelivr CDN. The backend
keeps the existing API shape and generates product image URLs from one CDN
configuration.

The GitHub repository that stores `images/products/` must be public. jsDelivr
cannot serve files from a private GitHub repository.

## Configuration

Set these values in `.env` or the deployment environment:

```bash
CDN_BASE_URL=https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products
CDN_GITHUB_USERNAME=iamutkarshgoyal
CDN_GITHUB_REPOSITORY=Astraya
CDN_GITHUB_BRANCH=main
CDN_IMAGE_EXTENSION=jpg
```

`CDN_BASE_URL` is optional. If it is empty, the backend builds the base URL from
the GitHub username, repository, and branch settings.

## Folder Structure

Store product images in the repository root:

```text
images/
  products/
    lavender-candle/
      1.jpg
      2.jpg
    astral-gift-box/
      1.jpg
      2.jpg
```

The folder name must match the product slug. The image numbers should start at
`1.jpg` and continue in display order.

## Upload Workflow

Add or replace files:

```bash
images/products/lavender-candle/1.jpg
images/products/lavender-candle/2.jpg
```

Commit the assets:

```bash
git add .
git commit -m "Add product images"
```

Push to the configured branch:

```bash
git push origin main
```

## CDN URL Format

Once pushed, jsDelivr serves files using this shape:

```text
https://cdn.jsdelivr.net/gh/iamutkarshgoyal/Astraya@main/images/products/lavender-candle/1.jpg
```

The backend helper returns product image arrays such as:

```text
[
  ".../lavender-candle/1.jpg",
  ".../lavender-candle/2.jpg"
]
```

If only one image is configured for a product, the API still returns an image
array with one URL.

## Cache Refreshing

jsDelivr caches GitHub files. If an image changes and the CDN still shows the
old file, use one of these approaches:

- Change the filename, for example `3.jpg` or `1-v2.jpg`.
- Serve from a version tag instead of `main`.
- Purge the affected URL from jsDelivr.

## Missing Images

If a CDN image is missing or fails to load, the frontend displays the local
Astraya placeholder image instead of crashing.

## Source Provenance

Keep the source page and license record for every third-party image. The current
catalog provenance and Astraya Instagram-to-product mapping are documented in
`docs/IMAGE_CREDITS.md`. Exact SKU replacements should retain the current
folder names so no product database migration is required.
