#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Initializing template into $TMP_DIR..."
rill init --agent agentsmd "$TMP_DIR" 2>&1 > /dev/null 

echo "Copying skills, AGENTS.md, and .mcp.json into repo..."
rm -rf "$REPO_DIR/skills"
cp -r "$TMP_DIR/.agents/skills" "$REPO_DIR/"
cp -f "$TMP_DIR/AGENTS.md" "$REPO_DIR/AGENTS.md"
cp -f "$TMP_DIR/.mcp.json" "$REPO_DIR/.mcp.json"

echo "Done."
