# Curated catalog brand icon report

244 of 333 entries carry official assets embedded as data URLs. The marketplace is
2,032,696 bytes (limit: 2,097,152). Every icon passes the real daemon's `ValidateIcon`;
`pluginsource.DecodeDocument` accepts all 333 entries with zero diagnostics.
The check used a throwaway Go program; no daemon code is shipped.

Validation: full locked `bun run generate`, metadata-only regeneration, `bun run check`,
`bun test scripts/check.test.ts` (19 passing), and `git diff --check`. The final full generation
preserves every source pin, package byte and non-icon entry field.
Icon files consume the existing authoring reserve during package materialization; the final
snapshot check counts every asset, without increasing any quota.

Contact sheet: `/tmp/mpc-shots/icons/contact-sheet.png`. SVG previews use librsvg for accurate
gradients and masks. No vendor geometry or pixels are edited. Some publishers only exposed
light monochrome wordmarks within the constraints; the sheet shows their contrast limitations.

## Generic entries intentionally left without icons

No distinct product mark is assigned to these role/workflow/development utilities:

`bio-research`, `brand-voice`, `champion-kit`, `code-modernization`, `code-review`, `code-simplifier`, `commit-commands`, `cowork-plugin-management`, `customer-support`, `design`, `engineering`, `enterprise-search`, `explanatory-output-style`, `fakechat`, `feature-dev`, `finance`, `frontend-design`, `hookify`, `human-resources`, `learning-output-style`, `legal`, `marketing`, `math-olympiad`, `math-proof`, `mcp-server-dev`, `mcp-tunnels`, `operations`, `pdf-viewer`, `playground`, `plugin-dev`, `pr-review-toolkit`, `product-management`, `productivity`, `project-artifact`, `ralph-loop`, `receipts`, `sales`, `security-guidance`, `session-report`, `skill-creator`, `small-business`.

## Products without a sourced conforming asset

No verified asset satisfying identity, inline size and minimum raster resolution was obtained
from the reviewed vendor page/repository for these entries. Access failures, small bitmap ICO
files and oversized originals were not replaced with third-party or invented marks:

`42crunch-api-security-testing`, `activecampaign`, `ai-firstify`, `amazon-selling-partner`, `asana`, `atomic-agents`, `build-with-wordpress`, `convex`, `crowdsec`, `csharp-lsp`, `gc-ai`, `gitkraken`, `govtribe`, `hostinger`, `idmp-plugin`, `imessage`, `intercom`, `intuit-quickbooks`, `jdtls-lsp`, `legalzoom`, `lusha`, `mcp-apps`, `mlflow`, `netsuite-ai-companion`, `netsuite-finance-analyst`, `netsuite-suitecloud`, `nvidia-skills`, `oracle-ai-data-platform-workbench-databricks-migrator`, `oracle-ai-data-platform-workbench-engineer-agent`, `oracle-ai-data-platform-workbench-spark-connectors`, `oracledb`, `php-lsp`, `pinecone`, `pyright-lsp`, `qt-development-skills`, `quarkus-agent`, `remember`, `ruby-lsp`, `save-to-spotify`, `searchfit-seo`, `serena`, `servicenow-sdk`, `sp-global`, `spotify-ads-api`, `superpowers`, `swift-lsp`, `unreal-engine-skills-for-claude-code`, `zoominfo`.

See `icons.json` for publisher evidence, `icons/omitted.json` for per-entry reasons and
`icons/sources.json` for download URLs, original hashes, bytes, media types and extractions.
