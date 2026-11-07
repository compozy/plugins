# QuickBooks Plugin for Claude

Skills that turn your QuickBooks Online data into plain-language business insights.

> **Requires the QuickBooks connector.** Connect it at
> https://claude.ai/customize/connectors (sign in with your Intuit account). See
> [SETUP.md](./SETUP.md) for step-by-step instructions, including Claude Code.

## Skills

| Skill | What it does |
| --- | --- |
| `business-health-check` | A CFO-style briefing across Profit & Loss, Cash Flow, Balance Sheet, A/R Aging, and Sales reports: what's going well, what needs attention, and what changed. Read-only. |
| `industry-benchmark` | Compare your business — or any metric you provide — against regional and national industry peers by industry and location. Read-only. |
| `analyze-payroll-cost` | Explain why payroll spend changed, who was paid the most, and what's driving cost, with practical cost-control ideas. Read-only. |
| `chase-overdue-invoices` | Send tone-matched payment reminders for overdue invoices, with confirmation before sending. |
| `email-to-estimate-invoice` | Turn a customer email thread into a ready-to-send QuickBooks estimate or invoice. |
| `lending` | Explain QuickBooks Capital financing options (Term Loan, Line of Credit, Business Credit Card, Loan Marketplace) and help compare or shop them. |
| `payroll-employee-onboarding` | Onboard a new hire into QuickBooks Payroll from provided details or source files, with confirmation before write actions. |
| `payroll-help` | Answer read-only lookup and setup questions about your QuickBooks Payroll: employees, payroll runs, payslips, pay types, deductions, and time off. |
| `set-base-pay` | View or change an employee's base pay, pay frequency, or hours in QuickBooks Payroll, with confirmation before writing. |
| `setup` | Guides you through connecting QuickBooks and troubleshooting the connection. |

Try prompts like:

- "How is my business doing this quarter?"
- "What should I be worried about in my financials?"
- "How does my profit compare to other restaurants in Texas?"
- "Send a reminder for invoice 1042"
- "Why did payroll cost go up this month?"

## Connecting QuickBooks

The skills use the QuickBooks connector from your Claude account. Connect it at
https://claude.ai/customize/connectors by signing in with your Intuit account and authorizing
access to your QuickBooks company. In Claude Code, sign in with your claude.ai account (`/login`)
so the connector is available in your sessions.

## Notes

- Some skills only read your QuickBooks data; others can send reminders, create draft estimates
  or invoices, or make payroll changes — those skills always confirm with you before writing
  anything.
- Output is an operational read of your QuickBooks data — not tax, legal, investment, or lending
  advice.

