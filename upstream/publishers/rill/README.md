# Rilldata Agent Skills

Installable, modular skills for AI agents working with Rill.

## Installation

### Using npx skills

```bash
npx skills add rilldata/agent-skills
```

### As a Claude Code plugin

```bash
/plugin marketplace add rilldata/agent-skills
/plugin install rill@rilldata
```

> **Note:** The MCP tools require a running Rill Developer server (`rill start`) on `localhost:9009`.

## Contents

- `AGENTS.md`: short instruction file directing agents to load the Rill skills
- `skills/rill-development`: high-level instructions for developing a Rill project
- `skills/rill-canvas`: detailed instructions and syntax reference for Rill canvas dashboards
- `skills/rill-connector`: detailed instructions and syntax reference for Rill connectors
- `skills/rill-explore`: detailed instructions and syntax reference for Rill explore dashboards
- `skills/rill-metrics-view`: detailed instructions and syntax reference for Rill metrics views
- `skills/rill-model`: detailed instructions and syntax reference for Rill models
- `skills/rill-rillyaml`: detailed instructions and syntax reference for the `rill.yaml` project file
- `skills/rill-theme`: detailed instructions and syntax reference for Rill themes

## How it works

This repository is synced from the output of `rill init --agent agentsmd`. These are the same instructions that power the first-party coding assistant included in Rill.
