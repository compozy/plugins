# Leadfeeder MCP Plugin

Turn website visitor intelligence into pipeline. Six skills covering the full B2B prospecting loop — from identifying your hottest accounts to finding the right buyer and adding them to your list.

---

## 💬 Try Asking

- "What should I work on today?"
- "Who should I reach out to at Acme Corp?"
- "Prep me for a call with TÜV NORD"
- "Tag Acme as Hot Lead and add it to my DACH Enterprise list"

---

## ✅ Skills

| Skill | Trigger | What it does |
|---|---|---|
| `a-getting-started` | "Set up my Leadfeeder brief" | Checks account, ICP, and tracker, then fires a sample brief |
| `daily-visitor-brief` | "Daily brief", "Show me today's visitors" | Ranked brief of today's most actionable visitor companies |
| `visitor-company-brief` | "Brief me on Acme" | Firmographics, engagement, contacts, and signals for a single company |
| `outreach-companion` | "Prep me for outreach to Acme" | 2–4 talking points grounded in visit and firmographic data |
| `find-my-buyer` | "Who should I reach out to at Acme?" | 1–5 contacts ranked by Buyer Persona fit |
| `add-to-pipeline` | "Tag Acme as Hot Lead" | Tag and list writes with a mandatory confirmation step |

---

## 🔌 MCP Server

Registered automatically on install. No manual setup required.

```json
{
  "mcpServers": {
    "Leadfeeder": {
      "type": "http",
      "url": "https://mcp.leadfeeder.com/mcp"
    }
  }
}
```

---

## ⚠️ Credits & Safety

Most skills are read-only and consume no credits. Where credits apply, the plugin never acts automatically — a Cost Guard estimate is always shown before any job runs, and explicit confirmation is required to proceed.

---

## 🛟 Support

Need help? Reach the Leadfeeder team via the [Help Center](https://help.leadfeeder.com/en/) or the [contact page](https://www.leadfeeder.com/contact/).

---

## 🔒 Privacy

This plugin talks to the Leadfeeder MCP server on your behalf. See the [Leadfeeder Privacy Policy](https://www.leadfeeder.com/privacy/) for how your data is handled.

---

## License

Licensed under the [Apache License 2.0](LICENSE). See [`NOTICE`](NOTICE) for trademark and attribution terms.
