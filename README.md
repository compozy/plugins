# Compozy plugins

A generated Claude-format marketplace named `compozy-plugins`. CompozyOS consumes this
repository as an ordinary plugin source. No upstream registry is queried at runtime.

## Regenerate

Requires Bun 1.4+, Git, curl and tar. No dependencies to install.

```sh
bun run generate            # reproduce from sources.lock.json (downloads pinned upstream archives)
bun run generate --refresh  # resolve current upstream commits and refresh MCP Registry records
bun run generate --metadata-only # apply reviewed category/candidate edits without network or package changes
bun run check
bun test scripts/check.test.ts
```

Review the marketplace and lock-file diff before committing. The generator fails on mutable
repository refs, missing reviewed categories, invalid categories, duplicate names, dangling supersedes or more than 1,000
entries. It prints category counts, featured names and supersede totals. `.cache/` is disposable
and ignored. The lock records upstream commits, each external plugin commit, and content hashes
plus versions and exact URLs for generated remote wrappers. Relative sources are pinned by the
catalog repository commit; select that commit when requiring an immutable catalog snapshot.

## Sources and policy

- `anthropics/knowledge-work-plugins` and `anthropics/claude-plugins-official`: Apache-2.0
  marketplace metadata, with original LICENSE and available NOTICE files under `upstream/`.
  Relative plugin directories are copied without modification. Additional publisher packages
  with recognizable Apache-2.0, MIT or BSD license texts are copied at their original SHA,
  preserving root LICENSE/NOTICE and an explicit `PUBLISHER-LICENSE`. Vendoring is bounded by
  package and aggregate file/byte allowances so the source fits the daemon snapshot limits.
  Other publishers retain their SHA as external references. Whole-repository entries use
  immutable GitHub archive URLs supported by the daemon, avoiding per-entry API ref resolution.
  `vendoring.json` records every decision, including missing licenses, symlinks and quota limits.
- Official MCP Registry: generation follows every `nextCursor` to completion, with no entry-count
  cutoff. Only active latest records matching an exact namespace, server identity and HTTPS endpoint
  in `curation.json` may be wrapped. That file also owns each wrapper's category and every featured
  app's category. Namespace verification establishes publisher control, not a security audit.
  Raw traversal pages and unselected records remain under gitignored `.cache/`. Only exact
  recognizable-publisher candidates selected in `curation.json.registryReview` enter the small
  `candidates.json` review queue; they never become plugin directories.
  Locked regeneration reuses the completed scan's selected records; `--refresh-registry` performs
  a new full traversal without changing the pinned Anthropic revisions.
- Candidate sources in `candidates.json` are review inputs only. No OpenAI or Cursor catalog
  content is redistributed. Admission from these lists requires publisher-owned public source,
  a redistributable license and an immutable commit, reviewed before adding to this generator.

Duplicate repository/subdirectory identities and names collapse; publisher repositories inherited
from the upstream catalogs take precedence over remote wrappers. A curated row that overlaps the
Claude official catalog supersedes its original row. Every entry has a reviewed assignment in `categories.json` using ADR-001's 12 IDs; generation
fails when an entry is missing. See `CATEGORY_REPORT.md` for all 352 assignments and counts.
No upstream label or description supplies a fallback. Featured is an explicit
small selection in `curation.json`. See `CURATION.md` for the per-app review.

Unsupported upstream source kinds (currently Xcode's `command` source) are reported and excluded.
The desired count is approximately 450–500, bounded by eligible upstream records rather than
padding with duplicates. URLs are frozen connection strings, not a guarantee that the hosted
service's behavior is immutable. Registry schema/version changes require regeneration review.

## Refresh cost

In-repository sources share a single catalog checkout. External entries retain publisher SHAs
and can require individual repository fetches; the daemon keeps its ten-minute deadline and four
resolvers. Its per-refresh entry ceiling is 1,000. The current catalog has 179 relative packages, 146
SHA archive references and 27 external git-subdirectories. First-refresh network latency remains subject
to that deadline; generated counts do not prove cold-network completion. Package digests cache installation bytes; source refresh still opens a fresh checkout per external
entry, including entries sharing a repository and SHA. There is no repository snapshot cache
across entries or sources. Compozy reports budget exhaustion through its existing source diagnostics.

## License

Catalog code and Compozy-authored metadata: Apache-2.0, see LICENSE and NOTICE.
Upstream files retain their original notices. Referenced publisher code and remote services
retain their own licenses and terms. This repository does not relicense those services.
