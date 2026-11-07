# S9 residual curation

No network measurement was repeated. Decisions use the existing S9 measurement and cached pinned publisher trees. Symlink materialization first validates the entire package and rejects escaping or cyclic links before copying bytes. The existing snapshot quota remains enforced.

| Entry | Decision | Reason / materialized links |
| --- | --- | --- |
| `amd-skills` | excluded | no manifest or supported default layout |
| `apollo-skills` | vendored | 2 |
| `astronomer-data-agents` | vendored | 2 |
| `atlan` | vendored | 1 |
| `base44` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `buildkite` | vendored | 9 |
| `canva` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `cds-mcp` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `codspeed` | excluded | Error: no recognized permissive publisher license |
| `data` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `datahub-skills` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `datarobot-agent-skills` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `growthbook` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `hyperframes` | excluded | Error: publisher archive unavailable within generator download limits |
| `learn-with-coursera` | excluded | no manifest or supported default layout |
| `mattpocock-skills` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `resend` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `salesforce-development` | excluded | publisher package exceeds daemon archive node quota |
| `sap-fiori-mcp-server` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `sap-mdk-server` | excluded | publisher package exceeds daemon package size quota |
| `supabase` | excluded | Error: no recognized permissive publisher license |
| `superdesign` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `teamcity-cli` | excluded | Error: materialized package exceeds catalog snapshot quota |
| `desktop-commander` | retained | S9 download truncation may be transient |
