# Publisher and category review

`curation.json` is the admission authority. New publishers, identities, endpoints and categories
require an explicit reviewed edit. No name or description substring can admit a Registry record.
The complete latest-version traversal examined 58,175 server identities across 582 pages. Twenty-one
records matched reviewed publishers/endpoints; six were missing from the Anthropic catalog after
name/endpoint deduplication. Raw traversal records remain in the gitignored cache. The small checked-in review queue contains
only six explicitly selected, recognizable Microsoft apps not admitted to the catalog; records
already covered by an upstream app are not review candidates.

## Every generated Registry wrapper

| App / exact verified namespace | Category | Reviewed endpoint | Category rationale |
| --- | --- | --- | --- |
| DigitalOcean / `com.digitalocean` | `cloud` | `https://mcp.digitalocean.com/mcp` | Cloud infrastructure management |
| Jotform / `com.jotform` | `productivity` | `https://mcp.jotform.com/` | Forms and workflow productivity |
| LottieFiles / `com.lottiefiles` | `design` | `https://creator.mcp.lottiefiles.com/mcp` | Motion-design assets and creation |
| Make / `com.make` | `productivity` | `https://mcp.make.com/v2` | Workflow automation (ADR-001 automation alias) |
| Typeform / `com.typeform` | `productivity` | `https://api.typeform.com/mcp` | Forms and response workflows |
| Webflow / `com.webflow` | `design` | `https://mcp.webflow.com/mcp` | Website design and content creation |

Each generated `mcp.json` was checked: one streamable-HTTP endpoint, no embedded credentials,
no stdio command and no hidden extra servers. Authentication remains the daemon's existing
remote-MCP discovery/setup flow. All six wrappers also passed the real cold-refresh package inspector. This is not a live
OAuth authorization or functional service test.

## Every featured entry

| App | Category | Source reviewed | Category rationale |
| --- | --- | --- | --- |
| Asana | `productivity` | Apache-2.0 Anthropic local `external_plugins/asana` | Task/project management |
| Figma | `design` | Publisher `figma/mcp-server-guide` at locked SHA | Interface design |
| Linear | `productivity` | Apache-2.0 Anthropic local `external_plugins/linear` | Issue/project management |
| Notion | `productivity` | Publisher `makenotion/claude-code-notion-plugin` at locked SHA | Documents and knowledge |
| Slack | `communication` | Publisher `slackapi/slack-mcp-plugin` at locked SHA | Team messaging |
| Stripe | `finance` | Publisher `stripe/ai`, `providers/claude/plugin`, at locked SHA | Payments |

Every entry is now assigned explicitly in `categories.json`, including upstream entries, Registry
wrappers and featured apps. `CATEGORY_REPORT.md` lists all 352 assignments. Missing reviews fail
generation; no upstream category, description or fallback can supply one. Only the two output styles
and two mathematics plugins are reviewed as `more`. `bun run check` verifies the table, Registry
categories and featured overrides; pagination, admission and category boundaries have focused tests.

Runtime spot-check: the real refresh acquired the featured publisher packages. Notion is currently
blocked by the loader rejecting its uppercase manifest name; Slack is blocked by the loader rejecting
its publisher schema. These were retained as explicit integration findings, without editing publisher
manifests or weakening validation. See REFRESH.md for the full measurement and remaining blockers.
