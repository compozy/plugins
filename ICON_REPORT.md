# Curated catalog brand icon report

292 of 333 entries carry reviewed official brand assets, up from 244/333 (+48).
All 48 previously unsourced product entries now have an asset. The remaining 41
omissions are generic role/workflow/development utilities, listed in `icons/omitted.json`.
Asana is featured and now displays its official three-dot mark.

The marketplace is 1,932,518 bytes (limit: 2,097,152). 58 entries use
immutable HTTPS references to checked-in assets; the others retain inline data URLs.
Every remote reference matches the exact asset bytes at its named catalog commit.
The asset commits must be pushed with this change before those HTTPS URLs can resolve
publicly; this pass intentionally commits locally only.

## Newly covered entries

`42crunch-api-security-testing`, `activecampaign`, `ai-firstify`, `amazon-selling-partner`, `asana`, `atomic-agents`, `build-with-wordpress`, `convex`, `crowdsec`, `csharp-lsp`, `gc-ai`, `gitkraken`, `govtribe`, `hostinger`, `idmp-plugin`, `imessage`, `intercom`, `intuit-quickbooks`, `jdtls-lsp`, `legalzoom`, `lusha`, `mcp-apps`, `mlflow`, `netsuite-ai-companion`, `netsuite-finance-analyst`, `netsuite-suitecloud`, `nvidia-skills`, `oracle-ai-data-platform-workbench-databricks-migrator`, `oracle-ai-data-platform-workbench-engineer-agent`, `oracle-ai-data-platform-workbench-spark-connectors`, `oracledb`, `php-lsp`, `pinecone`, `pyright-lsp`, `qt-development-skills`, `quarkus-agent`, `remember`, `ruby-lsp`, `save-to-spotify`, `searchfit-seo`, `serena`, `servicenow-sdk`, `sp-global`, `spotify-ads-api`, `superpowers`, `swift-lsp`, `unreal-engine-skills-for-claude-code`, `zoominfo`.

Official publisher organization avatars are used when a suitable product asset is
unavailable, as allowed by this pass. Examples include Intuit for QuickBooks, Eclipse
for JDT, Oracle for Oracle DB/Workbench, Epic Games for Unreal, and Kensho for S&P Global.
They represent the publisher rather than claiming a distinct product glyph.
NetSuite uses the publisher repository's app icon. AI Firstify uses `techwolf-ai`,
the exact publisher linked by its site; Convex uses the organization linked by its site.
GC AI uses the app domain's own icon. Default GitHub identicons, personal avatars,
and GitHub's site favicon were rejected.
Serena's official logo is an original UTF-16 SVG; its encoding and geometry are preserved.

## Contrast and aspect-ratio audit

Discord now uses the official Clyde app tile; Domino uses its official dark symbol
on the publisher avatar's light background. Both remain visible on light tiles.
MongoDB and MongoDB Atlas now use the official square leaf tile.

Every published asset was measured. Ten of the original eleven assets outside
0.625–1.6 width/height were replaced: BlackRock, Carbone, Catalyst by Zoho, Discord,
Domino, Liquid LSP, Liquid Skills, LSEG, MongoDB and MongoDB Atlas (ten entries;
Liquid shares the Shopify app asset). The original list contained eleven entries,
with Postiz retained. Serena introduces one additional wordmark.

Residuals: Postiz (3.062:1) and Serena (2.718:1) retain original official wordmarks.
No verified square project mark was obtained. Postiz's declared mobile logo remains
a wide wordmark, and its publisher organization avatar is a generic cat illustration,
so it was not substituted. Serena's README provides the original project wordmark.
No cropping, recoloring, redrawing or raster downscaling was applied to shipped assets.
JPEG avatars/app icons are decoded losslessly to PNG at their original dimensions;
other raster assets retain their downloaded bytes. Preview resizing is contact-sheet only.

## Verification

- Full locked `bun run generate`, metadata-only generation, `bun run check`.
- `bun test scripts/check.test.ts`: 20 passing, including immutable remote icon
  references and rejection of modified assets/mutable refs in the canonical suite.
- Real daemon `pluginsource.DecodeDocument`: 333 entries, zero diagnostics;
  `marketplace.ValidateIcon`: all 292 icons pass. Throwaway program in the bound
  daemon worktree, removed after execution; no daemon code is committed.
- All non-icon catalog fields, source pins, and package bytes remain unchanged.
- `git diff --check`; snapshot quota stays within the existing limits.
- Contact sheet: `/tmp/mpc-shots/icons/contact-sheet-2.png`, reviewed with SVG
  previews rendered by librsvg. Final image includes the corrected publisher identities.

## Impact

Catalog presentation only: existing icon field and HTTPS/data-URL contract.
No native-tool, hook/config, workspace-isolation, official skill, or Web component changes.
No source/lock/package or quota-policy changes. Marks retain publisher ownership;
exact sources, hashes, dimensions-preserving conversions and catalog commit refs are
recorded in `icons/sources.json`, with reviewed associations in `icons.json`.
