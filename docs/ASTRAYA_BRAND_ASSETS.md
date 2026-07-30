# Astraya Brand Assets

## Folder Structure

```text
frontend/public/assets/astraya/
|-- README.md
|-- logo/
|   `-- astraya-logo.jpg
|-- products/
|   `-- README.md
|-- instagram/
|   |-- 01-daisy-pastel.avif
|   |-- 01-daisy-pastel.jpg
|   |-- ...
|   `-- 06-cosmos-candle.jpg
|-- backgrounds/
|   `-- README.md
`-- textures/
    `-- README.md
```

The JPEG files are source-compatible fallbacks. The AVIF files are compressed
delivery assets used by the homepage gallery and cinematic call to action.

## Replacing Assets

- Replace the logo at
  `frontend/public/assets/astraya/logo/astraya-logo.jpg`.
- Add clean campaign images to `backgrounds/`.
- Add exact SKU photography to `images/products/<product-slug>/` because the
  backend and jsDelivr URLs already point to that repository-root structure.
- Keep each current filename when replacing an image, or update the homepage
  gallery manifest in `frontend/src/pages/HomePage.tsx`.
- Do not add screenshots containing Instagram controls or captions.

Run `npm run build` from `frontend/` after replacing assets. If product images
are served through jsDelivr, commit and push them before testing the production
URLs.

Source URLs and the current product-image mapping are recorded in
`docs/IMAGE_CREDITS.md`.
