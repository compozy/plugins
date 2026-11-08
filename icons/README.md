# Reviewed brand icons

`../icons.json` is the deliberate per-entry vendor map, with publisher evidence from the catalog.
`sources.json` records each published asset, source page, exact download URL, SHA-256, byte count,
media type and any extraction. Assets retain original pixels and geometry. Embedded PNG frames
may be extracted from ICO containers without resizing or recoloring. Website CDN URLs are used
only when referenced by the vendor page. Publisher repository assets are pinned to a commit.
Marks remain the property of their respective owners; the catalog license does not relicense them.

The generator publishes every icon as an inline data URL in every generation mode,
including `--metadata-only`. HTTPS icon references are rejected by validation because
CompozyOS does not fetch feed icons from the browser. Refreshing package metadata does
not fetch or replace icons. To update a mark, review its vendor mapping, download an
official PNG, SVG or WebP, record its provenance, then run `bun run generate
--metadata-only`, `bun run check` and `bun test scripts/check.test.ts`.

Generation and validation require ImageMagick (`magick`, with WebP support) and
librsvg (`rsvg-convert`). Encoded originals above 8 KiB are converted to lossless WebP
with a maximum 128-pixel edge, preserving aspect ratio and transparency. SVGs render
through librsvg first. A derivative is selected only if smaller; the original bytes
and source hashes remain intact. The generator writes selected derivatives under
`derived/`; validation independently recomputes them and compares the published bytes.
The same input and tool versions produce identical data URLs. No source edits,
cropping or recoloring are performed.

Publisher organization avatars may supply the official publisher mark when no suitable vendor
app icon exists. JPEG decoding to PNG preserves dimensions and pixels without resizing.

The full encoded reference must fit 64 KiB and the complete
marketplace must fit the daemon's 2 MiB document limit. Prefer smaller official assets instead
of altering logos. Use the vendor's tile/app icon for monochrome marks when available.

Do not select arbitrary logo images from a website: they may identify customers or partners.
Use declared favicon/app icons or a specifically verified vendor mark. Inspect a contact sheet
after changes. GitHub, Notion and Vercel use vendor tile variants for contrast on both themes.
`omitted.json` lists every intentionally omitted generic entry and every unsourced brand separately.

Impact: catalog presentation only. Native tools, hooks/config, workspace data isolation and the
official Compozy skill have no contract changes. Web renders the existing `icon` field; no daemon,
UI component, package source, version or lock change is required.
