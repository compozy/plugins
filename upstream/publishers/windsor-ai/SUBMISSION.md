# Submission Reference

## What goes in the official marketplace (claude-plugins-official)

When Anthropic approves your submission, they'll add an entry like this to
`external_plugins/` in https://github.com/anthropics/claude-plugins-official

The entry in `.claude-plugin/marketplace.json` would look something like:

```json
{
  "name": "windsor-ai",
  "description": "Connect Claude Code to 350+ business data sources via Windsor.ai. Query marketing, sales, CRM, ecommerce, finance, and analytics data from Google Ads, Meta, HubSpot, Salesforce, Shopify, Stripe, and hundreds more.",
  "author": {
    "name": "Windsor.ai",
    "email": "support@windsor.ai"
  },
  "source": {
    "source": "github",
    "repo": "windsor-ai/claude-windsor-ai-plugin"
  }
}
```

## Submission Steps

1. Push this plugin to a public GitHub repo (e.g. github.com/windsorai/claude-code-plugin)
2. Fill out the submission form: https://clau.de/plugin-directory-submission
3. Anthropic reviews for quality and security
4. Once approved, it appears in `/plugin > Discover` inside Claude Code

## Pre-submission Checklist

- [ ] plugin.json has all required fields (name, version, description, author with name+email)
- [ ] .mcp.json points to your remote MCP server URL
- [ ] README.md documents installation, setup, and usage
- [ ] Plugin works when tested locally with `claude --plugin-dir ./windsor-ai-plugin`
- [ ] OAuth flow works correctly for new users connecting their Windsor.ai account
- [ ] All slash commands work end-to-end
- [ ] No secrets or API keys are hardcoded anywhere
