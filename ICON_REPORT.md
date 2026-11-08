# Curated catalog brand icon report

292 of 333 entries carry reviewed official brand assets, up from 244/333 (+48).
All 48 previously unsourced product entries now have an asset. The remaining 41
omissions are generic role/workflow/development utilities, listed in `icons/omitted.json`.
Asana is featured and now displays its official three-dot mark.

All **292 of 333** icons are inline `data:` URLs; **zero HTTPS icon values** remain.
The marketplace is **1,607,972 bytes** (limit: 2,097,152). The longest data URL is
**17,471 bytes** (limit: 65,536). Coverage and all non-icon entry fields are unchanged.
No asset publication or browser network request is needed to display these icons.

## Derived assets

The generator checks source SHA-256 and byte counts before encoding. Originals under
`icons/` remain unchanged, including Serena's UTF-16 SVG. For encoded originals above
8 KiB it derives a lossless WebP with a maximum 128-pixel edge, preserving the full
mark, aspect ratio and transparency, and chooses it only when smaller. SVGs render
with librsvg before WebP encoding; other assets use ImageMagick. Selected derivatives
are checked in under `icons/derived/`. Tool versions for this run: ImageMagick
7.1.2-34 and librsvg 2.63.4.

108 entries use optimized derivatives (some share source files):

- `42crunch-api-security-testing`
- `activecampaign`
- `adspirer-ads-agent`
- `ai-firstify`
- `alloydb`
- `alloydb-omni`
- `amazon-selling-partner`
- `amplitude`
- `apollo`
- `atomic-agents`
- `bigquery-data-analytics`
- `boltz`
- `box`
- `browser-use`
- `build-with-wordpress`
- `carbone-skill`
- `catalyst-by-zoho`
- `chrome-devtools-mcp`
- `circleback`
- `clay`
- `cloud-sql-mysql`
- `cloud-sql-postgresql`
- `cloud-sql-sqlserver`
- `coderabbit`
- `confidence`
- `convex`
- `crowdsec`
- `dash0`
- `data-agent-kit`
- `datadog`
- `dataproc`
- `deepeval`
- `desktop-commander`
- `discord`
- `dominodatalab`
- `firestore-native`
- `gc-ai`
- `github`
- `gitkraken`
- `gitlab`
- `google-cloud-storage`
- `gopls-lsp`
- `govtribe`
- `greptile`
- `idmp-plugin`
- `imessage`
- `incident-io`
- `intercom`
- `jdtls-lsp`
- `jotform`
- `knowledge-catalog`
- `laravel-boost`
- `legalzoom`
- `logfire`
- `looker`
- `lovable`
- `lseg`
- `make`
- `mlflow`
- `modern-web-guidance`
- `mongodb`
- `mongodb-atlas`
- `netsuite-ai-companion`
- `netsuite-finance-analyst`
- `netsuite-suitecloud`
- `newrelic`
- `nimble`
- `noibu`
- `notion`
- `nvidia-skills`
- `oracle-ai-data-platform-workbench-databricks-migrator`
- `oracle-ai-data-platform-workbench-engineer-agent`
- `oracle-ai-data-platform-workbench-spark-connectors`
- `oracledb`
- `php-lsp`
- `playwright`
- `postiz`
- `postman`
- `pyright-lsp`
- `qodo`
- `qodo-standards`
- `qt-development-skills`
- `remember`
- `ruby-lsp`
- `save-to-spotify`
- `searchfit-seo`
- `serena`
- `servicenow-sdk`
- `shippo`
- `slack`
- `slack-by-salesforce`
- `sp-global`
- `spanner`
- `spotify-ads-api`
- `stackhawk-api`
- `stackhawk-hawkscan`
- `streaming-skills-plugin`
- `superpowers`
- `swift-lsp`
- `synthflow`
- `tinyfish`
- `twilio-developer-kit`
- `unreal-engine-skills-for-claude-code`
- `vanta-mcp-plugin`
- `webflow`
- `wingspan`
- `workos`
- `zyte-web-data`

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
Original downloaded assets are preserved. No cropping, recoloring or redrawing is
applied. Published derivatives resize the complete mark as described above.

## Verification

- Full locked `bun run generate`, `bun run generate --metadata-only`, `bun run check`.
- `bun run test`: 21 passing in the canonical suite, including rejection of HTTPS,
  malformed/oversized data URLs, source tampering, and reproducible oversized conversion.
- Independent decode check: all 292 allowed prefixes, strict base64 decoding, nonempty
  payloads and complete data-URL sizes <=65,536; all original source hashes verified.
- `compozy-catalog validate` targets a published v3 directory and packaged extension
  archives, not this upstream `.claude-plugin/marketplace.json` format. The brief's
  independent decode-check alternative was used; no daemon files were changed.
- All non-icon catalog fields, source pins and package bytes remain unchanged.
- `git diff --check`; snapshot quota stays within existing limits.
- Contact sheet: `/tmp/mpc-shots/icons/contact-sheet-3.png`, rendered from all 292
  published inline URLs, using librsvg for SVG decoding.

## Impact

Catalog presentation only, through the existing icon field. No native-tool, hook/config,
workspace-isolation, official skill, Web component, source/lock/package or quota-policy
changes. The generator enforces inline-only icons; the daemon's broader HTTPS acceptance
is unchanged. Marks retain publisher ownership. Exact original URLs, hashes and conversion
provenance remain in `icons/sources.json`, with reviewed associations in `icons.json`.
