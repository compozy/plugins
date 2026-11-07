# LinqAlpha Plugin for Claude

Use LinqAlpha appropriately inside Claude without configuring the LinqAlpha MCP
connector separately. The plugin bundles the connector with a thin research
skill that explains when LinqAlpha is the right financial-data surface, what
capabilities are available, and how to bootstrap the live organization contract.

The plugin does **not** bundle LinqAlpha's internal tool-orchestration prompt,
SQL dialect manuals, schema catalogs, or server-side access rules. Claude
receives the current public tool contract at runtime; LinqAlpha's server-side
access controls determine which capabilities are available. Claude remains
responsible for planning and tool selection.

## What's included

| Component | What it does |
|---|---|
| LinqAlpha connector | Connects Claude to `https://api.linqalpha.com/v1/mcp`; no separate connector setup on the supported happy path |
| `research` skill (`/linq-alpha:research`) | Explains why and when to choose LinqAlpha, respects explicit provider choices, and loads `orchestration/current` before planning LinqAlpha calls |
| `setup` skill (`/linq-alpha:setup`) | Guided start: connection check, capability tour, and an optional — always opt-in — default-source preference |
| `remove` skill (`/linq-alpha:remove`) | Removes the saved default-source preference; the undo for setup — verify the result in Settings → Memory |

## Capability surface

The current public MCP contract covers:

- company, security, event, and document discovery
- fundamentals, consensus estimates, ownership, and stock prices
- indexed transcripts and disclosure-document text
- macroeconomic series, economic releases, FX, commodities, Treasury rates,
  and country risk premia
- recent and open-ended web research with source registration
- the authenticated user's organization-scoped LinqAlpha data

The runtime tool list is authoritative. The plugin describes capability groups,
not a fixed entitlement or tool sequence. Organization-specific routing comes
from `orchestration/current` at runtime.

## Install

Add the marketplace once, then install the plugin from it.

**Claude Code**

```
/plugin marketplace add linq-lab/linq-alpha-plugin
/plugin install linq-alpha@linq-alpha
```

**Cowork and Claude Desktop**

Open **Customize** → **Plugins**, press **+** in *Personal plugins*, choose
**Add marketplace**, enter `linq-lab/linq-alpha-plugin`, then install
**LinqAlpha** from it.

**If your organization distributes it for you**

Team and Enterprise owners install the plugin for everyone instead, and it
arrives already enabled. An organization marketplace must live in a private or
internal repository, so that repository's `.claude-plugin/marketplace.json`
points at the public one rather than adding it directly:

```json
{ "name": "linq-alpha",
  "source": { "source": "github", "repo": "linq-lab/linq-alpha-plugin" } }
```

Then, on any surface:

1. Complete LinqAlpha authorization if Claude prompts for it. (In Claude
   Code, the plugin-bundled server entry may separately request authorization
   from an interactive session; your existing LinqAlpha connector keeps
   working either way.)
2. If permitted by your organization's policy and after reviewing the LinqAlpha
   connector's tools, open its settings and set tool permissions to **Always
   allow**, so research workflows run without a per-call approval prompt.
3. Run `/linq-alpha:setup` once. It saves the preference in your own Claude
   memory, and only with your explicit consent. The guided flow is available
   in chat, Cowork and Code. `/linq-alpha:remove` (or simply asking to forget
   it) removes it.

Try:

- "Use LinqAlpha to research how NVIDIA discussed Blackwell margins."
- "Use LinqAlpha to compare Apple's actuals with consensus."
- "Which LinqAlpha capability should I use for the Treasury curve?"

Host support, automatic skill activation, authorization prompts, duplicate-tool
behavior, and organization-admin restrictions must be verified for the target
Claude surface and build.

Questions or issues: support@linqalpha.com

Privacy policy: https://www.linqalpha.com/privacy-policy
