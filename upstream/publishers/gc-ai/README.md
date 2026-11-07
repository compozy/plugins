# GC AI plugin for Claude

Work in your [GC AI](https://gc.ai) legal knowledge base directly from Claude. This plugin bundles the GC AI connector with workflow skills, so an assistant can upload documents, run review playbooks, and answer questions grounded in your own files, all as you.

Requests run as the signed-in GC AI user and are scoped to what that user can access. Usage is billed to your organization, the same as the rest of GC AI.

## What it includes

- **The GC AI connector.** Installing the plugin wires up the remote MCP server at `https://app.gc.ai/api/mcp`. On first use, Claude opens a GC AI sign-in and stores the connection. No API key.
- **Skills** that encode the common multi-step workflows:
  - `/gc-ai:review-document` — run one or more documents through a review playbook and summarize the findings.
  - `/gc-ai:ask` — ask a legal question grounded in your files, playbooks, and skills.
  - `/gc-ai:organize-matter` — group documents into a project so later review and questions scope to that matter.
- **A `gc-ai-analyst` subagent** for delegating a full document-review or research workflow end to end, including in Cowork or background runs.

## Requirements

- A GC AI account.
- Your organization has the GC AI MCP server enabled (it is off by default). If sign-in works but no tools appear, ask your GC AI admin to turn it on, or contact support.

## Install

Add the community marketplace and install:

```
/plugin marketplace add anthropics/claude-plugins-community
/plugin install gc-ai@claude-community
```

To try it locally from a clone before it is published:

```
claude --plugin-dir ./gc-ai-claude-plugin
```

## Verify

Ask the assistant: "List my GC AI projects." That calls `get_projects` and confirms the connection is wired up and scoped to your account.

## Links

- [MCP server overview and tool reference](https://github.com/GC-AI-Inc/gc-ai-claude-plugin)
- [GC AI](https://gc.ai)

## Legal

This plugin is provided under the MIT License, with no warranty. It is not part of the "Services" under the Service Agreement. Any use of the GC AI Platform through the plugin remains governed by [gc.ai/service-agreement](https://gc.ai/service-agreement) or [gc.ai/terms](https://gc.ai/terms), as applicable, and/or the customer's Order Form.
