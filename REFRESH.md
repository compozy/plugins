# Curated plugin catalog cold refresh

The S7 repair admits MCP Registry wrappers only through `curation.json`, which fixes the exact
publisher namespace, server ID, endpoint and category. A full traversal (582 pages, 58,175 identities)
matched 21 reviewed records; after upstream deduplication, six wrappers remain. Every entry now has an explicit reviewed category in `categories.json`; no fallback is permitted.
The complete assignments and current counts are in `CATEGORY_REPORT.md`.

## Real measurement (2026-11-07)

An isolated throwaway Go program constructed `pluginsource.Sources`, a new empty `PackageCache`,
`pluginsource.Resolver`, `NewPluginProjector(resolver, extensionpkg.InspectPluginPackage)` and
`NewPluginSource(...).Fetch(context.Background())`. It supplied the local unpublished catalog
path as the source and allowed real public network acquisitions for every external entry. There
were no mocks, installed resources, tokens or running MCP servers. Each run removed its own temp
cache/home and checkout root. The parent catalog checkout/download is excluded because the public
repository has intentionally not been created. Four resolvers and the 600-second deadline were unchanged.

| Measurement | Baseline curated catalog | After bounded vendoring / immutable archives |
| --- | ---: | ---: |
| Entries processed | 352 | 352 |
| Wall seconds | 122.080782250 | 37.836058167 |
| Packages acquired and inspection attempted | 120 | 307 |
| Installable entries | 115 | 277 |
| `refresh_budget_exhausted` | 0 | 0 |
| `source_unreachable` (GitHub API rate limit) | 221 | 27 |
| `load_failed` | 16 | 48 |

Every run used another empty cache; it was not a warm-cache comparison. It inherited the
public unauthenticated GitHub API quota exhausted by the first run. No token was added to evade that
limit. This establishes completion within the deadline, not universal installability or an unthrottled
cold-network benchmark. Different upstreams were acquired after optimization, exposing additional
loader incompatibilities; the `load_failed` counts do not measure a loader regression.

## Acquisition changes and limits

The generator copied 101 publisher packages at their original commits only when recognizable
Apache-2.0, MIT or BSD license text and a symlink-free bounded package tree permitted it. It retains
LICENSE/NOTICE and `PUBLISHER-LICENSE`, and records every decision in `vendoring.json`. Aggregate
and per-package allowances keep the shared catalog snapshot bounded. Another 146 whole-repository
entries use the daemon's existing HTTPS archive format with a full commit SHA in the URL, avoiding
GitHub API ref resolution and tarball API calls. No new runtime adapter was added.

The resulting catalog has 179 relative entries, 146 immutable archive URLs and 27 external
`git-subdir` entries. Its measured source snapshot contained 8,364 nodes (including directories) / 63,338,879 file bytes and
compressed to 20,991,311 bytes, below the current 10,000-node, 500-MiB decompressed and
50-MiB compressed acquisition limits. The 1,000-entry projection ceiling remains unchanged.

## Cache ownership

`Resolver.Resolve` calls `prepare` and `packageSnapshot`; every external entry opens its own
snapshot, which is closed after capture. `Sources.openPlugin` and `gitsrc.Client.Checkout` do not
retain or share repository+SHA checkouts across entries or sources. `PackageCache` stores canonical
package blobs by SHA-256 for inspection/install acquisition; it does not avoid external checkout
work during source refresh. Relative entries share their source snapshot. Generator downloads are
deduplicated by repository+SHA, independently of daemon runtime caches.

## Residuals for integration

Twenty-seven external subdirectories remain subject to GitHub's public API quota. Forty-eight entries
report loader/acquisition failures, including unsupported archive symlinks, missing manifests and
publisher manifest schema/name incompatibilities. In particular, the featured Notion publisher bundle
uses a rejected uppercase manifest name, and Slack's publisher schema is rejected by the current
loader. These are explicit S1–S3 integration findings; this catalog repair does not rewrite publisher
manifests or weaken runtime validation. The six Registry wrappers load through the real inspector.

Raw aggregate counts and catalog document hashes are in the catalog repository's
`refresh-measurement.json`. `CURATION.md` reviews every wrapper and featured entry. Public hosting,
CI, OAuth service validation and final integrated QA remain with the conductor/S8.

An intermediate optimization measured 56.329830459 seconds / 310 acquired / 280 installable / zero
budget exhaustion, but its directory-inclusive snapshot node count exceeded the source quota.
The final generation counts both directories and files and reserves quota before copying packages.
The intermediate sample remains in `refresh-measurement.json`; it was not discarded from the evidence.

## Metadata-only review follow-up

Round 3 reviewed all 352 categories and reduced `candidates.json` to six recognizable publisher
records plus the four ADR-002 discovery feeds. Raw traversal data stays in gitignored `.cache/`.
The package sources, versions, plugin bytes and source lock remain unchanged from the final
measurement. No network measurement was repeated for these editorial metadata changes. Historical
measurement hashes above identify the measured revision, not the recategorized document.

## S9 residual follow-up

S9 subsequently fixed publisher compatibility and API quota routing. Its one real measurement
acquired 330 of 352 packages, with 328 installable and 24 load failures; Notion and Slack loaded.
This catalog follow-up materialized four licensed contained-link packages, excluded nineteen
unloadable or unvendoreable packages into candidates, and retained desktop-commander's transient
truncation. See RESIDUAL_REVIEW.md. Historical measurements above describe their original inputs;
no new network measurement was run on the resulting 333-entry catalog.
