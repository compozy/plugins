# Setting up QuickBooks

Requires the QuickBooks connector. Connect it at https://claude.ai/customize/connectors before
using this plugin.

The user has installed the QuickBooks plugin. Its skills use the QuickBooks connector on the
user's Claude account. First check whether QuickBooks tools are already available in this session.
If they are, tell the user setup is complete and go to Step 3. Otherwise guide the user through
the steps below.

## Step 1: Connect QuickBooks in Claude

1. Go to https://claude.ai/customize/connectors (in Claude: select Customize in the sidebar, then
   Connectors).
2. Find QuickBooks and click Connect.
3. Log in with the Intuit account for your QuickBooks company, grant Claude the requested
   permissions, and return to Claude.

On Team and Enterprise plans, only admins can add connectors for the organization. If the user
cannot connect QuickBooks themselves, tell them to ask their Claude administrator to add it (on
Team plans the directory shows a Request button that sends the connector to the organization's
admins for review). After it is added, each person connects it from Customize, then Connectors.

## Step 2: Claude Code only

Skip this step on claude.ai and in Cowork.

1. Run /login and select the claude.ai account. (In the desktop app's Code tab, the app delivers
   the user's connected claude.ai connectors to Claude Code directly.)
2. Run /mcp. QuickBooks appears in the claude.ai section of the list; connectors never signed in
   to are collapsed behind a "Show unused connectors" row. If it needs authorization, complete
   Step 1: authentication is completed in claude.ai.

Connectors from claude.ai are fetched only when the active authentication method is a claude.ai
subscription login. They are not loaded when: ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN or
apiKeyHelper is active; a third-party provider such as Amazon Bedrock or Google Cloud's Agent
Platform is active; ANTHROPIC_PROFILE, the federation variables or an active Anthropic profile
supplies the credential; or CLAUDE_CODE_OAUTH_TOKEN holds a token from claude setup-token. If
/mcp does not list QuickBooks, ask the user to run /status, then /login to select their claude.ai
account.

This plugin relies on the QuickBooks connector and does not add a QuickBooks server of its own.
Do not add one with claude mcp add: a server added in Claude Code takes precedence over a
claude.ai connector that points at the same URL, and /mcp then lists the connector as hidden.
(Adding one manually will also fail to authenticate: Intuit's authorization server does not
permit the localhost redirect Claude Code's in-terminal OAuth uses.) If the user has such an
entry, tell them to remove it with claude mcp remove followed by the name they gave the server.

## Step 3: Verify

Ask the user to start a new Cowork session or restart Claude Code so the connector list loads
again, then test with one read-only request: for example "How is my business doing this month?"
(runs the business-health-check skill against the connected company).

## If something does not work

- QuickBooks shows as disconnected or asks to authorize again: go to Customize, then Connectors,
  and click Reconnect.
- /mcp shows QuickBooks as "connected · session token rejected": run /login to sign in again,
  then reconnect the connector from /mcp. Authorizing the connector again does not clear this.
- The organization does not list QuickBooks under Connectors: ask the Claude administrator to
  add it.
- Wrong company data: disconnect and reconnect the connector, choosing the correct QuickBooks
  company during Intuit sign-in.
