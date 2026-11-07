# Windsor.ai Plugin for Claude Code

Connect Claude Code to 350+ business data sources. Query marketing, sales, CRM, finance, ecommerce, analytics, and more from Google Ads, Meta, TikTok, LinkedIn, GA4, HubSpot, Salesforce, Shopify, Stripe, QuickBooks, and hundreds more — directly from your terminal.

## What This Plugin Does

This plugin gives Claude Code access to your business data through [Windsor.ai](https://windsor.ai). Use it to:

- **Pull real data into your code** — seed dashboards, generate fixtures, build data pipelines
- **Explore your connected data sources** — see what platforms are connected and what fields are available
- **Generate types** — create TypeScript interfaces from your actual data schema
- **Get quick reports** — check performance metrics without leaving the terminal

## Installation

```bash
/plugin install windsor-ai@claude-plugin-directory
```

Or install from this repository:

```bash
claude plugin marketplace add https://github.com/windsor-ai/claude-windsor-ai-plugin
claude plugin install windsor-ai
```

## Setup

After installing, you'll be prompted to authenticate with your Windsor.ai account via OAuth. This connects Claude Code to the same data sources you've set up in Windsor.ai.

## Slash Commands

| Command | Description |
|---------|-------------|
| `/campaign-report` | Quick 30-day campaign performance summary |
| `/windsor-sources` | List all connected platforms and available fields |
| `/windsor-types` | Generate TypeScript type definitions for a connector |

## Agent

The **Business Data Analyst** agent handles complex multi-step workflows: cross-platform comparisons, ETL pipeline generation, dashboard data integration, and more.

## Supported Data Sources

350+ connectors across marketing, sales, CRM, ecommerce, finance, analytics, and more:

**Marketing & Ads:** Google Ads · Meta (Facebook & Instagram) · TikTok · LinkedIn · Google Search Console · YouTube · Google My Business · Pinterest · Snapchat · Twitter/X · and more

**CRM & Sales:** HubSpot · Salesforce · Pipedrive · Zoho CRM · and more

**Analytics & Data:** Google Analytics 4 · Google Sheets · BigQuery · Snowflake · and more

**Ecommerce & Payments:** Shopify · Stripe · WooCommerce · and more

**Finance & Operations:** QuickBooks · Xero · and more

[Browse all 350+ connectors →](https://windsor.ai/connectors/)

## Examples

```
> Pull last 7 days of Google Ads campaign data and write it to src/data/campaigns.json

> Generate TypeScript types for our Salesforce data

> Compare spend and ROAS across Google Ads and Meta for this month

> Create a Next.js API route that returns our top 10 campaigns by spend

> Pull our Shopify orders and Stripe payments for this quarter into a unified report

> Show me HubSpot deals closed this month alongside the ad spend that drove them
```

## Links

- [Windsor.ai](https://windsor.ai)
- [Windsor.ai Connector for Claude.ai](https://claude.com/connectors/windsor-ai)
- [MCP Server](https://mcp.windsor.ai)
- [Documentation](https://docs.windsor.ai)

## License

MIT
