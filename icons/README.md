# Reviewed brand icons

`../icons.json` is the deliberate per-entry vendor map, with publisher evidence from the catalog.
`sources.json` records each published asset, source page, exact download URL, SHA-256, byte count,
media type and any extraction. Assets retain original pixels and geometry. Embedded PNG frames
may be extracted from ICO containers without resizing or recoloring. Website CDN URLs are used
only when referenced by the vendor page. Publisher repository assets are pinned to a commit.
Marks remain the property of their respective owners; the catalog license does not relicense them.

The generator embeds the checked-in bytes as data URLs in every generation mode, including
`--metadata-only`. Refreshing package metadata does not fetch or replace icons. To update a mark,
review its vendor mapping, download an official PNG (at least 64 by 64), SVG or WebP, record its
provenance, then run `bun run generate --metadata-only`, `bun run check` and
`bun test scripts/check.test.ts`. The full encoded reference must fit 64 KiB and the complete
marketplace must fit the daemon's 2 MiB document limit. Prefer smaller official assets instead
of altering logos. Use the vendor's tile/app icon for monochrome marks when available.

Do not select arbitrary logo images from a website: they may identify customers or partners.
Use declared favicon/app icons or a specifically verified vendor mark. Inspect a contact sheet
after changes. GitHub, Notion and Vercel use vendor tile variants for contrast on both themes.
`omitted.json` lists every intentionally omitted generic entry and every unsourced brand separately.

Impact: catalog presentation only. Native tools, hooks/config, workspace data isolation and the
official Compozy skill have no contract changes. Web renders the existing `icon` field; no daemon,
UI component, package source, version or lock change is required.
