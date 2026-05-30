# PRD - MultiClinica Frontend

## Problem Statement

O frontend atual nasceu como `ProjetoLPFront`, com identidade visual e fluxos focados em uma unica clinica. Ele ainda carrega marca da Dra. Laiza, rotas sem separacao multi-clinica, roles antigas (`Admin` e `Fisio`), modulo de WhatsApp Logs, campos de lembrete e autenticacao hidratada por cookie client-side `auth_user`.

O novo produto precisa virar um frontend SaaS multi-clinica, com repositorio proprio, identidade visual neutra, painel SuperAdmin global, app operacional por clinica, permissao por role, nova base visual com shadcn/ui, tema claro/escuro e contrato alinhado ao novo backend `MultiClinica.API`.

## Solution

Criar o novo frontend `MultiClinicaFront` em repositorio privado com historico limpo, mantendo Next.js/App Router e reestruturando a aplicacao em duas areas autenticadas: `/superadmin` para gestao global do produto e `/app` para operacao interna da clinica.

A primeira fase foca no app interno, painel SuperAdmin, novo design system SaaS/admin, auth baseada em `/api/auth/me`, permissoes por role, remocao de WhatsApp/lembretes e services tipados por dominio. A landing page publica completa fica para a segunda etapa.

## User Stories

1. As a SuperAdmin, I want to log in and be redirected to the global admin panel, so that I can operate the product.
2. As a clinic user, I want to log in and be redirected to the clinic dashboard, so that I can start daily work quickly.
3. As a user, I want explicit login errors for inactive user, inactive clinic or billing block, so that I know why access failed.
4. As a user, I want invalid credentials to show a generic message, so that security is preserved.
5. As a user, I want my session to be restored from the backend, so that stale client-side user data is not trusted.
6. As a user, I want a clear access denied page, so that I understand when I cannot access a route.
7. As a SuperAdmin, I want a separate layout and sidebar, so that global product operations do not mix with clinic operations.
8. As a clinic user, I want a separate clinic layout and sidebar, so that I always know I am operating inside a clinic.
9. As a clinic user, I want the sidebar/topbar to show clinic name, my name and my role, so that the current context is always visible.
10. As a SuperAdmin, I want a global dashboard with commercial metrics, so that I can monitor the customer base.
11. As a SuperAdmin, I want to see total clinics, active clinics, inactive clinics and blocked clinics, so that I can assess product health.
12. As a SuperAdmin, I want to see overdue charges and monthly received/pending revenue, so that I can manage billing.
13. As a SuperAdmin, I want to list clinics with status badges, so that I can quickly identify active, inactive, billing-enabled and billing-blocked clinics.
14. As a SuperAdmin, I want quick actions in the clinics table, so that I can view, edit, configure billing, register payment, manage users and inspect history.
15. As a SuperAdmin, I want to create a clinic through a wizard, so that the long setup flow is guided and validated step by step.
16. As a SuperAdmin, I want the clinic creation wizard to include the first Administrator, so that a clinic can start operating after setup.
17. As a SuperAdmin, I want to skip Administrator creation only with explicit warning, so that incomplete setup is intentional.
18. As a SuperAdmin, I want clinic details organized in tabs, so that data, billing, users and history stay readable.
19. As a SuperAdmin, I want to register clinic payments in a dialog or sheet, so that commercial updates are quick.
20. As a SuperAdmin, I want to unblock billing with a required reason, so that exceptions are documented.
21. As a SuperAdmin, I want to see a commercial history timeline, so that I can understand what happened with each clinic.
22. As an Administrator, I want access to all clinic modules, so that I can manage clinic operations.
23. As a Professional, I want access to patients, agenda and medical records, so that I can perform clinical work.
24. As a Recepcao user, I want access to patients, agenda and payments, so that I can handle front-desk operations.
25. As a Recepcao user, I do not want access to general finance, plans or users, so that sensitive administration stays restricted.
26. As a clinic user, I want `/app` to be an operational dashboard, so that it gives useful daily information instead of a simple welcome page.
27. As an Administrator, I want the clinic dashboard to show broader operational metrics, so that I can manage the clinic.
28. As a Professional, I want the dashboard to prioritize agenda, patients and records, so that I can focus on care.
29. As a Recepcao user, I want the dashboard to prioritize agenda, patients and payments, so that I can handle reception tasks.
30. As a user, I want light and dark themes, so that I can choose the most comfortable interface.
31. As a user, I want a theme toggle with loading/transition feedback, so that theme switching feels intentional.
32. As a user, I want my theme preference persisted locally, so that the app opens with my preferred theme.
33. As a user, I want breadcrumbs in internal pages, so that deep SuperAdmin routes remain understandable.
34. As a user, I want tables with loading, empty and error states, so that the interface never looks broken.
35. As a user, I want forms with grouped fields and clear validation, so that long workflows are easier to complete.
36. As a user, I want explicit error states with retry when data loading fails, so that I can recover without refreshing manually.
37. As a user, I want confirmation dialogs for critical actions, so that destructive or blocking operations are not accidental.
38. As a developer, I want shadcn/ui and Radix UI as the component base, so that the SaaS interface is consistent and accessible.
39. As a developer, I want TanStack Table as the DataTable foundation, so that pagination, filters, row actions and typed columns are scalable.
40. As a developer, I want services separated by domain, so that HTTP contracts are typed and not duplicated in hooks/components.
41. As a developer, I want centralized API error handling, so that explicit backend failures are shown correctly.
42. As a developer, I want query keys standardized by domain, so that React Query cache remains predictable.
43. As a developer, I want the WhatsApp Logs module removed, so that the frontend matches the simplified backend.
44. As a developer, I want reminder fields removed, so that dead backend fields do not leak into UI types.
45. As a developer, I want focused tests for auth, guards, DataTable states, wizard and theme, so that critical flows stay stable.

## Implementation Decisions

- Create a new private repository named `MultiClinicaFront` with clean history.
- Use the current frontend as the base, but remove the remote that points to `ProjetoLPFront`.
- Rename package/app identity from `projetolp-web` to `multiclinica` or equivalent product identity.
- Keep Next.js/App Router. Do not migrate to Vite.
- Keep React Query, React Hook Form and Zod.
- Use the same Next.js project for public routes, login, clinic app and SuperAdmin panel.
- The full public landing page is second phase. First phase keeps only the structure needed for future landing and focuses on authenticated product.
- Keep login public under the public route group.
- Keep protected routes under `src/app/(authenticated)`.
- Use visible URL prefixes `/app` for clinic operations and `/superadmin` for global product operations.
- Migrate current operational routes from `/pacientes`, `/agenda`, etc. to `/app/pacientes`, `/app/agenda`, etc.
- Redirect by role after login: `SuperAdmin` to `/superadmin`; `Administrador`, `Profissional` and `Recepcao` to `/app`.
- Create separate layouts/shells for SuperAdmin and Clinic areas.
- Use sidebar plus topbar in authenticated layouts.
- Sidebar handles primary navigation.
- Topbar handles context, breadcrumbs/theme/user actions.
- Add breadcrumbs to internal pages, especially deep SuperAdmin routes.
- Remove Dra. Laiza/ProjetoLP identity, logo and clinic-specific visual language.
- Create a neutral SaaS/admin identity for MultiClinica.
- Introduce shadcn/ui with Radix UI as the new design system base.
- Add `next-themes` and support light/dark themes.
- Persist theme preference locally in the client, not backend.
- Use system preference when no local preference exists.
- Add `ThemeToggle` with loading/transition state.
- Validate contrast and state styling in both themes.
- Use lucide-react for icons.
- Add TanStack Table through `@tanstack/react-table`.
- Build a reusable DataTable based on TanStack Table and shadcn/ui.
- DataTable must support server-side pagination, loading skeleton rows, empty state, error state with retry, row actions, status badges and external filters.
- Use wizard/stepper for clinic creation.
- Use tabs for clinic edit/detail views.
- Use dedicated pages for large flows such as clinic creation and clinic detail.
- Use dialogs/sheets for quick actions such as user creation, payment registration, billing configuration and unblock confirmation.
- Use popover filters on desktop and sheet filters on mobile when filters are long.
- Create required base components: `AppShell`, `SuperAdminShell`, `Sidebar`, `Topbar`, `PageHeader`, `MetricCard`, `DataTable`, `StatusBadge`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `FormSection`, `FormActions`, `Tabs` and `Stepper`.
- Every critical component must consider default, loading, empty and error states when applicable.
- Remove the `whatsapp-logs` route, hooks, types and sidebar item.
- Remove reminder fields such as `paymentReminderSent` from frontend types, UI and forms.
- Add role types: `SuperAdmin`, `Administrador`, `Profissional`, `Recepcao`.
- Remove old role assumptions `Admin` and `Fisio`.
- Use `/api/auth/me` as the canonical authenticated user source. This requires backend support.
- Remove `auth_user` cookie and `js-cookie` session persistence.
- Keep the real session in the backend httpOnly auth cookie.
- AuthContext initializes by calling `/api/auth/me`.
- If `/me` returns 401, redirect to login.
- If route role is invalid, show access denied page with button to the correct dashboard.
- Do not implement Next.js middleware for auth in the first phase.
- Backend remains the source of truth for authorization.
- Create centralized API error handling by backend `errorCode` and message.
- 401 means session expired/unauthenticated and redirects to login.
- 403 shows access denied or contextual permission message.
- 404 in detail screens shows not found state.
- Mutation errors preserve filled form values.
- Create typed services by domain and make hooks consume services.
- Domain services include auth, SuperAdmin clinics, SuperAdmin users, SuperAdmin billing, SuperAdmin history, patients, appointments, medical records, payments, financial, plans, users and attachments.
- Components must not call `api` directly.
- Query keys should be predictable and scoped by domain.
- SuperAdmin first phase modules: dashboard, clinics, clinic detail, clinic users, clinic billing/payments and commercial history.
- Do not add global patient/medical-record browsing to SuperAdmin in the first phase.
- Clinic app modules remain patients, agenda, medical records, patient payments, financial, users and plans.
- Role menu visibility:
  - `Administrador`: all clinic modules.
  - `Profissional`: patients, agenda and medical records.
  - `Recepcao`: patients, agenda and payments.
  - `SuperAdmin`: SuperAdmin area by default.
- Keep clinic payments and clinic financial modules separate: patient payments are operational; financial is expenses/balance.
- SuperAdmin commercial billing is separate from clinic internal finance.
- Clinic form sections: cadastral data, address, billing and status/internal notes.
- Clinic creation wizard includes first Administrator creation.
- Clinic detail tabs include overview, cadastral data, billing, users and commercial history.
- Dashboard SuperAdmin metrics include total clinics, active clinics, inactive clinics, billing-blocked clinics, billing-enabled clinics, overdue charges, monthly received revenue, monthly pending revenue and latest commercial activities.
- Clinic list actions include view, edit, activate/inactivate, configure billing, register payment, unblock billing, manage users and view commercial history.
- Clinic dashboard should be operational and adapted by role.

## Testing Decisions

- Add Vitest and React Testing Library in the first phase.
- Do not require Playwright/E2E in the first phase.
- Tests should validate user-visible behavior and routing outcomes, not implementation details.
- Test auth initialization through `/me`.
- Test login redirect by role.
- Test `/app` guard.
- Test `/superadmin` guard.
- Test access denied state for invalid role access.
- Test sidebar/menu visibility by role.
- Test API error handling for 401, 403 and 404.
- Test clinic creation wizard step validation and review flow.
- Test DataTable default, loading, empty and error states.
- Test ThemeToggle behavior and local persistence.
- Test that `auth_user` cookie/session persistence is not required.

## Out of Scope

- Full public landing page implementation in the first phase.
- Landing page SEO/copy/conversion work in the first phase.
- Backend implementation.
- Payment gateway UI.
- Public clinic signup.
- Trial onboarding.
- Global patient/prontuario browsing in SuperAdmin.
- WhatsApp Logs.
- Automatic reminder notification UI.
- Playwright/E2E test suite in the first phase.
- User preference persistence for theme in backend.
- Next.js middleware-based session validation.

## Further Notes

- The landing page should be planned as phase two after the internal app and SuperAdmin panel stabilize.
- The frontend PRD depends on backend decisions from `docs/prd-multiclinica-backend.md`, especially roles, `/api/auth/me`, explicit errors, billing block and SuperAdmin routes.
- The current UI should be treated as functional reference, not visual target.
- The redesign should prioritize admin productivity: readable tables, clear filters, explicit statuses, robust forms and recoverable errors.
- Avoid a marketing-heavy dashboard style inside the product. The app should feel like a SaaS operations tool.
