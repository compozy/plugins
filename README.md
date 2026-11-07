# Compozy plugins

A generated Claude-format marketplace named `compozy-plugins`. CompozyOS consumes this
repository as an ordinary plugin source. No upstream registry is queried at runtime.

## Regenerate

Requires Bun 1.4+, Git, curl and tar. No dependencies to install.

```sh
bun run generate            # reproduce from sources.lock.json (downloads pinned upstream archives)
bun run generate --refresh  # resolve current upstream commits and refresh MCP Registry records
bun run check
bun test scripts/check.test.ts
```

Review the marketplace and lock-file diff before committing. The generator fails on mutable
repository refs, invalid categories, duplicate names, dangling supersedes or more than 1,000
entries. It prints category counts, featured names and supersede totals. `.cache/` is disposable
and ignored. The lock records upstream commits, each external plugin commit, and content hashes
plus versions and exact URLs for generated remote wrappers. Relative sources are pinned by the
catalog repository commit; select that commit when requiring an immutable catalog snapshot.

## Sources and policy

- `anthropics/knowledge-work-plugins` and `anthropics/claude-plugins-official`: Apache-2.0
  marketplace metadata, with original LICENSE and available NOTICE files under `upstream/`.
  Relative plugin directories are copied without modification. External publisher plugins
  retain their immutable SHA and original repository/subdirectory; their code is not copied.
- Official MCP Registry: active latest servers in verified DNS namespaces with HTTPS
  streamable-HTTP endpoints. One wrapper per namespace and endpoint, excluding names or
  endpoints already present in the upstreams. `sources.lock.json` retains the selected records;
  generated wrappers contain only minimal plugin metadata and MCP connection configuration.
  Verification establishes namespace control, not an endorsement or security audit.
- Candidate sources in `candidates.json` are review inputs only. No OpenAI or Cursor catalog
  content is redistributed. Admission from these lists requires publisher-owned public source,
  a redistributable license and an immutable commit, reviewed before adding to this generator.

Duplicate repository/subdirectory identities and names collapse; publisher repositories inherited
from the upstream catalogs take precedence over remote wrappers. A curated row that overlaps the
Claude official catalog supersedes its original row. Categories use ADR-001's 12 IDs; unknown
source categories are classified by app descriptions and otherwise fall back to `more`.
Featured is an explicit small selection in the generator.

Unsupported upstream source kinds (currently Xcode's `command` source) are reported and excluded.
The desired count is approximately 450–500, bounded by eligible upstream records rather than
padding with duplicates. URLs are frozen connection strings, not a guarantee that the hosted
service's behavior is immutable. Registry schema/version changes require regeneration review.

## Refresh cost

In-repository sources share a single catalog checkout. External entries retain publisher SHAs
and can require individual repository fetches; the daemon keeps its ten-minute deadline and four
resolvers. Its per-refresh entry ceiling is 1,000. First-refresh network latency remains subject
to that deadline; generated counts do not prove cold-network completion. Cached packages avoid
repeat downloads. Compozy reports budget exhaustion through its existing source diagnostics.

## License

Catalog code and Compozy-authored metadata: Apache-2.0, see LICENSE and NOTICE.
Upstream files retain their original notices. Referenced publisher code and remote services
retain their own licenses and terms. This repository does not relicense those services.
