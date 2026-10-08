# MSP CRM: instructions for Copilot

## What this project is
An internal service and operations CRM for an IT managed service provider (MSP). Users: 5 technicians, 3 salespeople, plus an ops/helpdesk manager and an admin. Technicians use company Android phones in the field, often offline. The office uses a desktop browser. It runs on a Linux VM with Docker Compose.

Phase 1 covers: clients and sites, the site data book, tickets with SLA timers and escalation, offline mobile jobcards (time, travel, parts, signature), and monthly contract support logs. After that: after-hours and standby rates, and a van stock ledger.

Out of scope for now: quoting, procurement, Sage integration, WhatsApp, email-to-ticket, multi-tenant SaaS features.

## Stack (proposed, change here if the decision changes)
- TypeScript for the API and the web app
- PostgreSQL
- REST API
- React installable web app (PWA) with offline storage and a sync queue
- Postgres-backed job queue for SLA timers and notifications
- Email through SMTP, push through Web Push

## Hard rules
1. **Tenant scoping.** Every table has `tenant_id`. All data access goes through one central scoping layer. Never write a query that skips the tenant filter. There is one tenant today and no SaaS features, but the data model must be ready.
2. **No secrets stored.** The CRM never stores passwords, keys or credentials. A site has only an optional "Vaultwarden folder" reference (URL or name). Configuration comes from environment variables. Never commit `.env` files.
3. **Roles are enforced in the API,** not just the screens. Roles: Tech, Sales, Ops Manager, Admin. Tech API responses must never include pricing, rates, quote values or margins. Admin can see and change everything, including settings.
4. **Tech-entered data is append-only.** Time entries, travel entries, parts and the signature are only ever added by the technician and are never overwritten by a sync. Office edits to scheduling, priority and notes merge field by field, last change wins. A correction to a tech entry is a separate adjustment entry shown on the jobcard.
5. **Offline sync.** Records created on the phone get client-generated UUIDs. The sync endpoint must be idempotent, so a retried upload never creates duplicates.
6. **SLA rules.**
   - Business hours are Monday to Friday, 08:00 to 16:30. Public holidays pause the clock.
   - Respond and resolve have separate timers, and priorities, targets, business hours and holidays are stored in the database and editable by Admin, never hard-coded.
   - A ticket stores a snapshot of its targets when created. Changing settings affects new tickets only.
   - Warn at 75% of a target and again on breach. An unacknowledged ticket notifies the assigned tech and the ops manager by email and push.
7. **Contract hours.**
   - Each month is a separate period and hours reset monthly.
   - Travel records the actual time and distance, but the charge and the contract-hours deduction are a flat one hour per site visit.
   - Project work is outside the contract and is shown separately.
   - Overage is billed hourly. Remote support is unlimited: it is listed but not counted against hours.
8. **Support logs** are generated as a PDF, then reviewed and sent manually. Never email a client automatically.
9. **Time.** Store timestamps in UTC. Business-hours calculations use a configurable timezone setting.

## How to work
- Work on one slice or feature at a time. Propose a short plan first, then implement.
- Write tests before the logic for the SLA calculation, contract hours and sync merging.
- Never edit a database migration that has already been applied. Add a new one.
- Ask before adding a new dependency. Prefer simple, readable code over clever code.
- Do not invent requirements. If a rule is unclear or missing, ask.
- Keep commits small, with clear messages.