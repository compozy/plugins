# Chronograph GP — Claude plugin

Bring your trusted private capital portfolio data on Chronograph into Claude. This plugin adds
purpose-built skills for GPs (fund managers) that work directly against your permissioned
Chronograph data.

> **Who this is for:** Chronograph GP clients with an active account. The skills read your
> private Chronograph data through a secure OAuth connection, so a Chronograph login with
> GP-client access is required. If you're an LP client, use the
> [Chronograph LP plugin](https://github.com/chronograph-pe/chronograph-lp-claude-plugin) instead.

## Before you install: add the Chronograph connector

**This plugin does not connect to Chronograph on its own, and the skills will not work until
the connector is in place.** The plugin ships skills and sub-agents only; the connector is what
grants access to your data.

Connect it from Claude's connectors directory:

1. Open **Settings → Connectors** in Claude.
2. Find **Chronograph** in the list and click **Connect**.
3. Log in to your Chronograph account in the tab that opens.

## What's inside

| Skill | What it does |
|---|---|
| `chronograph-budget-vs-actuals-variance` | Compare portfolio company operating actuals against budget/plan, compute variances, flag off-plan companies, and roll up to the fund, using Chronograph company metrics. |
| `chronograph-fund-quarterly-review-pack` | Generate a consolidated quarterly review pack for a single fund — a fund-level summary plus a one-pager section for every portfolio company in the fund — using Chronograph data. |
| `chronograph-markup-markdown-brief` | Identify which portfolio companies were marked up or down this period, quantify each change, surface the stated basis, and rank by impact on fund NAV — using Chronograph investment metrics. |
| `chronograph-portfolio-company-one-pager` | Generate one-pagers and investor reports for private equity portfolio companies. Handles live data fetching via the Chronograph MCP OR an uploaded Excel model, metric formatting, AI-generated or model-sourced commentary, and rendering a fully styled HTML one-pager. |
| `chronograph-tvpi-attribution-by-company` | Decompose a fund's total value / TVPI into per-company contributions, split realized vs. unrealized, and rank top contributors and detractors — using Chronograph investment metrics. |

Each skill ships with a matching sub-agent of the same name for running the task end-to-end,
plus a **chronograph-gp-analyst** orchestrator that chains the skills together for a full
fund and portfolio workup.

## Requirements

- A **Chronograph account** connected as a **GP client**, with the **Chronograph connector**
  added in Claude (see above).
- A **paid Claude plan** (Pro, Max, Team, or Enterprise) — plugins aren't available on the free plan.
- **Claude Code** or **Cowork**. Plugins run in those two surfaces; they aren't available in
  standard claude.ai chat.

## Getting started

### Claude Code

```bash
# Add the Chronograph GP marketplace
claude plugin marketplace add chronograph-pe/chronograph-gp-claude-plugin

# Install the plugin
claude plugin install chronograph-gp@chronograph-gp
```

### Cowork

1. Open **Customize** in the left sidebar and select the **Plugins** tab.
2. Add the Chronograph GP marketplace, then click **Install** on the Chronograph GP plugin.

## Using the skills

- Type `/` and pick a Chronograph skill, or just describe what you need.
- The skill resolves the relevant funds or companies from your Chronograph data, applies the
  appropriate model or template, and returns the analysis or a finished artifact.
- Skills never fabricate figures: unavailable values are shown as `—`, and every result is
  labeled with its source, currency, and as-of date.

## Privacy

This plugin ships skills and sub-agents only. It bundles no server, no hooks, and no
telemetry, and it makes no network calls of its own. It collects, stores, and retains
nothing itself.

Your Chronograph data reaches Claude through the **Chronograph connector**, which you add
and authorize separately over OAuth. Skills read only the data your Chronograph login is
already permissioned to see.

One exception worth naming: one-pagers rendered by `chronograph-portfolio-company-one-pager`
load the Ubuntu and Open Sans webfonts from Google Fonts, so opening a rendered one-pager
issues a request to Google. No portfolio data is included in that request.

- Chronograph privacy policy: <https://www.chronograph.pe/legal/privacy-policy/> (contact details are in the policy)
- Google privacy policy: <https://policies.google.com/privacy>

## How it works

```
.claude-plugin/plugin.json        Plugin manifest
.claude-plugin/marketplace.json   Marketplace catalog (single plugin)
skills/                           The skills, each with on-demand reference files where needed
agents/                           A matching sub-agent per skill, plus the chronograph-gp-analyst orchestrator
```
