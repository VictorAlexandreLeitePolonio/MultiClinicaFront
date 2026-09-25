# Professional Appointment Scheduling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let clinic staff choose the responsible professional and a free time, with a daily schedule panel and server-side conflict protection.

**Architecture:** The back owns professional eligibility, clinic-local time conversion, slot generation, and conflict protection. The front uses one authenticated daily-schedule endpoint for the side panel and sends clinic-local date/time on create and edit. Existing UTC API input remains valid.

**Tech Stack:** .NET/EF Core/Npgsql/xUnit; Next.js 16.2.7, React 19, TypeScript, React Hook Form, Zod, TanStack Query, Vitest.

**Spec:** [2026-09-25-professional-appointment-scheduling-design.md](../specs/2026-09-25-professional-appointment-scheduling-design.md)

## Global Constraints

- Work in both repositories with clean, task-specific branches. Back is currently on `codex/issue-31-patient-import`; inspect its merge base before making the new branch. Preserve unrelated work.
- A manual booking does **not** validate professional journey or clinic business hours. Both are explicitly deferred in the spec because users have not configured them.
- The panel proposes slots from 07:00 through 20:00 in the clinic time zone. A typed time outside that range remains allowed if it has no conflict.
- A free slot means only “no conflicting Scheduled appointment.” Pending patient requests have no professional assignment.
- Keep `CreatedByUserId` as actor and `UserId` as responsible professional. Only active `Profissional` and `Administrador` users of the authenticated clinic qualify; `Recepcao` does not.
- Preserve existing UTC `appointmentDate` API callers. Use clinic-local input explicitly for the new form. Existing appointments retain their stored duration when moved.
- Read `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md` and the relevant local Next forms guide before front edits. Keep the interactive form a Client Component.
- Do not install dependencies or change package, lock, or csproj files. Before claiming completion, run the `software-quality-gate` skill outside each target repository and compare `git status` before and after.

## Review Focus

1. A reception user loading professionals must get the active eligible list, while a reception user ID cannot be booked.
2. A clinic-local day around a UTC date boundary must show the right appointments regardless of browser time zone.
3. A 10:30 booking must be blocked by a 10:00–11:00 appointment; an 11:00 booking must be allowed.
4. Two concurrent create/accept/update paths must not both commit overlapping Scheduled intervals.
5. A failed or stale schedule request must not show the previous professional's slots, erase form values, or claim a conflicting time is free.

---

## File map

**Back:** `Services/AppointmentService.cs` owns creation, update, day schedule; `Services/AppointmentRequestService.cs` uses the common booking guard when accepting; `Services/AppointmentBookingGuard.cs` owns the shared atomic overlap check; `Controllers/AppointmentsController.cs` exposes day schedule and eligible professionals; `DTOs/Appointment/*` defines input/output; `Repositories/AppointmentRepository.cs` keeps existing paging. Add `tests/MultiClinica.Tests/AppointmentSchedulingTests.cs` for API behavior. Keep the public patient-availability service unchanged.

**Front:** `agenda/services/appointments.service.ts` owns typed HTTP calls; `agenda/schemas/agenda.schema.ts` separates create/edit validation; `agenda/hooks/insert/index.ts` and `hooks/update/index.ts` pass typed payloads; `agenda/components/AgendaRegister.tsx` owns form state and responsive placement; new `agenda/components/ProfessionalDaySchedule.tsx` renders the panel; `agenda/components/AgendaDetails.tsx` shows update errors; `src/lib/queryKeys.ts` keys the day query; `src/types/index.ts` adds clinic timezone metadata to appointment detail. Add a focused `AgendaRegister.test.tsx` for the new interaction. Use existing UI components, tokens, and input classes.

### Task 1: Back booking invariant and clinic-local input

**Files:**
- Create: `MultiClinicaBack/Services/AppointmentBookingGuard.cs`
- Modify: `MultiClinicaBack/Services/AppointmentService.cs`, `Services/AppointmentRequestService.cs`, `Program.cs`, `Common/ErrorCodes.cs`
- Modify: `MultiClinicaBack/DTOs/Appointment/CreateAppointmentDto.cs`, `UpdateAppointmentDto.cs`, `Controllers/AppointmentsController.cs`, `Controllers/AppointmentRequestsController.cs`
- Test: `MultiClinicaBack/tests/MultiClinica.Tests/AppointmentSchedulingTests.cs`

**Interfaces:**
- `IAppointmentBookingGuard.RunAsync<T>(int clinicId, int professionalId, DateTime startUtc, int durationMinutes, int? excludeAppointmentId, Func<Task<T>> save): Task<Result<T>>`.
- New request property `string? AppointmentLocalDateTime` in create/update DTOs; `AppointmentDate` retains its existing UTC behavior.
- New error code `AppointmentConflict` maps to HTTP 409 with `{ code, message }`.

- [ ] **Step 1: Add failing API tests.** Seed clinic, active professional, receptionist, patient, and a future appointment in `AppointmentSchedulingTests.cs`. Assert create with a professional other than the logged-in admin returns 201 and persists `UserId=professional.Id`, `CreatedByUserId=admin.Id`; create with receptionist/inactive/cross-clinic ID fails; overlap returns 409 `AppointmentConflict`; adjacent booking succeeds; update excludes itself and rejects a new overlap. Seed no journey or business-hour rows and assert manual booking still succeeds.

  ```csharp
  var localDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3));
  var response = await admin.PostAsJsonAsync("/api/appointments", new {
      professionalId = professional.Id, patientId = patient.Id,
      appointmentLocalDateTime = $"{localDate:yyyy-MM-dd}T10:30"
  });
  Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  await app.SeedAsync(async db => {
      var saved = await db.Appointments.SingleAsync();
      Assert.Equal(professional.Id, saved.UserId);
      Assert.Equal(adminId, saved.CreatedByUserId);
  });
  ```
- [ ] **Step 2: Run the focused test.** `dotnet test tests/MultiClinica.Tests/MultiClinica.Tests.csproj --filter FullyQualifiedName~AppointmentSchedulingTests`; expect the new assertions to fail.
- [ ] **Step 3: Implement eligibility and local-time parsing.** Resolve clinic from `usuario.ClinicaId`; accept `AppointmentLocalDateTime` as exact `yyyy-MM-ddTHH:mm` when present; convert with `TimeZoneInfo.FindSystemTimeZoneById(clinic.TimeZoneId)` and `TimeZoneInfo.ConvertTimeToUtc`; reject invalid/ambiguous local times with `InvalidDate`. Legacy `AppointmentDate` follows the current UTC path. Validate future UTC time, active patient, and active professional/admin in this clinic. Set new appointment `DurationMinutes = clinic.AppointmentSlotDurationMinutes`; preserve duration on update.

  ```csharp
  var eligible = user is { IsActive: true, IsDeleted: false }
      && (user.Role is UserRole.Profissional or UserRole.Administrador);
  if (!DateTime.TryParseExact(dto.AppointmentLocalDateTime,
      "yyyy-MM-ddTHH:mm", CultureInfo.InvariantCulture,
      DateTimeStyles.None, out var local))
      return Result<AppointmentResponseDto>.Fail(ErrorCodes.InvalidDate, "Data e hora inválidas.");
  if (timeZone.IsInvalidTime(local) || timeZone.IsAmbiguousTime(local))
      return Result<AppointmentResponseDto>.Fail(ErrorCodes.InvalidDate, "Horário inválido no fuso da clínica.");
  var startUtc = TimeZoneInfo.ConvertTimeToUtc(
      DateTime.SpecifyKind(local, DateTimeKind.Unspecified), timeZone);
  ```
- [ ] **Step 4: Implement one atomic guard shared by write paths.** Inside a database transaction, take a PostgreSQL transaction advisory lock keyed by clinic and professional before checking `startUtc < existing.AppointmentDate.AddMinutes(existing.DurationMinutes) && endUtc > existing.AppointmentDate`, scoped to `Scheduled`, non-deleted rows and excluding the appointment being edited. Call `save` and commit only after the check. The guard must also work with the EF InMemory test provider for ordinary sequential tests; run a real-PostgreSQL concurrent test when the existing test environment supports one. Route request acceptance through the guard without removing its current professional-availability checks. Do not silently claim the InMemory provider proves cross-process atomicity.

  ```csharp
  // On Npgsql: begin transaction, execute
  // SELECT pg_advisory_xact_lock(@clinicId, @professionalId)
  // on that same connection/transaction, then check and save before commit.
  // InMemory tests only execute the check and save path.
  var endUtc = startUtc.AddMinutes(durationMinutes);
  var conflict = await db.Appointments.AnyAsync(a =>
      a.ClinicaId == clinicId && a.UserId == professionalId
      && a.Status == AppointmentStatus.Scheduled && !a.IsDeleted
      && a.Id != excludeAppointmentId
      && startUtc < a.AppointmentDate.AddMinutes(a.DurationMinutes)
      && endUtc > a.AppointmentDate);
  if (conflict)
      return Result<T>.Fail(ErrorCodes.AppointmentConflict, "Este horário já está ocupado.");
  ```

  Real PostgreSQL verification: run two requests concurrently with `Task.WhenAll`; assert exactly one 201 and one 409, and one stored Scheduled appointment. Also exercise one request-accept path against a simultaneous direct booking. Provision or use an existing test PostgreSQL instance; record clearly if this check could not run.
- [ ] **Step 5: Return errors and rerun tests.** Add `AppointmentConflict` to `ErrorCodes` and map it to 409 in both controllers. Run the focused test again; expect all assertions to pass. Commit only this backend unit after checking the diff.

### Task 2: Back professional list and daily schedule

**Files:**
- Create: `MultiClinicaBack/DTOs/Appointment/ProfessionalDayScheduleDto.cs`
- Modify: `MultiClinicaBack/DTOs/Appointment/AppointmentResponseDto.cs`
- Modify: `MultiClinicaBack/Services/Interfaces/IAppointmentService.cs`, `Services/AppointmentService.cs`, `Controllers/AppointmentsController.cs`
- Test: `MultiClinicaBack/tests/MultiClinica.Tests/AppointmentSchedulingTests.cs`

**Interfaces:**
- `GET /api/appointments/professionals` returns `[{ id, name }]`.
- `GET /api/appointments/day-schedule?professionalId=7&date=2026-09-28` returns `{ date, timeZoneId, durationMinutes, appointments: [{ id, patientName, start, end }], slots: [{ start, end, available }] }`; `start/end` carry the clinic offset.
- `GET /api/appointments/{id}` also returns `timeZoneId` so the edit form can render its UTC `appointmentDate` in clinic-local time without using the browser zone.

- [ ] **Step 1: Add failing API tests.** Log in as receptionist and assert the professional list includes all active eligible clinic users, including beyond the first 100, and excludes receptionist, inactive, deleted, and other-clinic users. Seed appointments spanning a clinic-local midnight and a partial slot; assert the day endpoint returns only this professional and day, correctly marks overlapping slots, and includes an appointment outside 07:00–20:00 in `appointments`. Assert appointment detail includes the clinic's `timeZoneId`.

  ```csharp
  var response = await reception.GetAsync(
      $"/api/appointments/day-schedule?professionalId={professional.Id}&date=2026-09-28");
  Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  var schedule = await response.Content.ReadFromJsonAsync<ProfessionalDayScheduleDto>();
  Assert.Equal("America/Sao_Paulo", schedule!.TimeZoneId);
  Assert.Contains(schedule.Slots, slot => !slot.Available);
  ```
- [ ] **Step 2: Run the focused test.** `dotnet test tests/MultiClinica.Tests/MultiClinica.Tests.csproj --filter FullyQualifiedName~AppointmentSchedulingTests`; expect the new endpoint assertions to fail.
- [ ] **Step 3: Implement the two reads.** Query professionals by authenticated `ClinicaId`, active/not deleted, role admin/professional; order by name and project ID/name. For the day query, convert local midnight and next midnight to UTC; select Scheduled/non-deleted appointments intersecting that range; generate proposed intervals between 07:00 and 20:00 using `AppointmentSlotDurationMinutes`; mark a slot unavailable on any overlap. Use `DateTimeOffset` for response times in the clinic zone. Add clinic `TimeZoneId` to appointment detail response. Return 404 for an ineligible professional and 400 for invalid date/time zone.

  ```csharp
  var dayStartUtc = TimeZoneInfo.ConvertTimeToUtc(
      date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), timeZone);
  var dayEndUtc = TimeZoneInfo.ConvertTimeToUtc(
      date.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified), timeZone);
  var appointments = await db.Appointments
      .Where(a => a.ClinicaId == usuario.ClinicaId && a.UserId == professionalId
          && a.Status == AppointmentStatus.Scheduled && !a.IsDeleted
          && a.AppointmentDate < dayEndUtc
          && a.AppointmentDate.AddMinutes(a.DurationMinutes) > dayStartUtc)
      .ToListAsync();
  ```
- [ ] **Step 4: Re-run focused tests and commit.** Verify the new endpoint tests pass and existing `AppointmentRequestTests` and `AvailabilityTests` remain green. Commit the backend API unit.

### Task 3: Front typed data flow

**Files:**
- Modify: `MultiClinicaFront/src/app/(authenticated)/app/agenda/services/appointments.service.ts`, `schemas/agenda.schema.ts`, `hooks/insert/index.ts`, `hooks/update/index.ts`, `src/lib/queryKeys.ts`, `src/types/index.ts`
- Test: `MultiClinicaFront/src/app/(authenticated)/app/agenda/services/appointments.service.test.ts`

**Interfaces:**
- `getAppointmentProfessionals(): Promise<{ id: number; name: string }[]>`.
- `getProfessionalDaySchedule(professionalId: number, date: string): Promise<ProfessionalDaySchedule>`.
- Create/update payloads send `appointmentLocalDateTime: string` and selected `professionalId` on create; retain legacy read DTOs. `AgendaCreateSchema` requires professional; `AgendaEditSchema` does not.

- [ ] **Step 1: Add failing service tests.** Mock the shared `api` module and assert the exact routes and query params; assert the create payload carries the selected professional and unshifted clinic-local value `2026-09-28T10:30`. Include a rejected HTTP response to show errors propagate to the existing mutation hook.

  ```typescript
  await getProfessionalDaySchedule(7, "2026-09-28");
  expect(api.get).toHaveBeenCalledWith("/api/appointments/day-schedule", {
    params: { professionalId: 7, date: "2026-09-28" },
  });
  await createAppointment({ patientId: 3, professionalId: 7,
    appointmentLocalDateTime: "2026-09-28T10:30" });
  expect(api.post).toHaveBeenCalledWith("/api/appointments", {
    patientId: 3, professionalId: 7, appointmentLocalDateTime: "2026-09-28T10:30",
  });
  ```
- [ ] **Step 2: Run the focused test.** `npx vitest run 'src/app/(authenticated)/app/agenda/services/appointments.service.test.ts'`; expect missing functions/types to fail.
- [ ] **Step 3: Add minimal types and service functions.** Define `ProfessionalDaySchedule` and slot/appointment interfaces beside the service, add `queryKeys.appointments.day(professionalId, date)`, and make `professionalId` required in the create schema. Keep the request inside the service, never in a component. Update the create mutation payload type separately from the edit payload so the edit form does not require a new professional.

  ```typescript
  export const AgendaEditSchema = z.object({
    patientId: z.number().min(1),
    appointmentDate: z.string().min(1),
    status: z.enum(["Scheduled", "Completed", "Cancelled"]).optional(),
  });
  export const AgendaCreateSchema = AgendaEditSchema.extend({
    professionalId: z.number().min(1, "Profissional é obrigatório"),
  });
  // POST body: { patientId, professionalId, appointmentLocalDateTime }
  // PUT body: { appointmentLocalDateTime, status }
  ```
- [ ] **Step 4: Re-run the focused test and commit.** Verify the service contract test passes and `npx tsc --noEmit` succeeds after the contract change. Commit the front data-flow unit.

### Task 4: Front registration panel

**Files:**
- Modify: `MultiClinicaFront/src/app/(authenticated)/app/agenda/components/AgendaRegister.tsx`
- Create: `MultiClinicaFront/src/app/(authenticated)/app/agenda/components/ProfessionalDaySchedule.tsx`
- Test: `MultiClinicaFront/src/app/(authenticated)/app/agenda/components/AgendaRegister.test.tsx`

**Interfaces:** `ProfessionalDaySchedule` receives `professionalId: number`, `date: string`, `selectedLocalDateTime: string`, and `onSelect(localDateTime: string): void`. It uses the typed service and query key from Task 3.

- [ ] **Step 1: Add failing interaction tests.** Mock professionals, the day endpoint, and create mutation. Select a professional and date; assert the matching patient's occupied time appears and free slot click sets `datetime-local` to the slot's clinic-local time. Change professional/date and assert stale slots are not shown. Reject save with `AppointmentConflict` and assert the field values remain and the error is visible beside date/time.

  ```tsx
  await user.selectOptions(screen.getByLabelText(/Profissional/), "7");
  fireEvent.change(screen.getByLabelText(/Data e Hora/), {
    target: { value: "2026-09-28T10:30" },
  });
  expect(await screen.findByText("Paciente ocupado")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /11:00.*livre/i }));
  expect(screen.getByLabelText(/Data e Hora/)).toHaveValue("2026-09-28T11:00");
  ```
- [ ] **Step 2: Run the focused test.** `npx vitest run 'src/app/(authenticated)/app/agenda/components/AgendaRegister.test.tsx'`; expect failure for missing selector/panel behavior.
- [ ] **Step 3: Implement the responsive form and panel.** Query eligible professionals. Keep the `datetime-local` value as the exact local string; remove the browser-`Date` round trip in the register form. Render a two-column layout on desktop and one column on mobile using existing form/card tokens. The panel appears only after professional and date exist; show loading, retryable error, empty appointments, suggested free slots, occupied items, and the deferred-rules explanation. Format API offsets using the returned `timeZoneId`, not the browser zone. A slot click calls `setValue('appointmentDate', localValue, { shouldValidate: true })`. Keep focus labels and reduced-motion behavior.

  ```tsx
  const professionalId = watch("professionalId");
  const appointmentDate = watch("appointmentDate");
  const day = appointmentDate.slice(0, 10);
  // Panel query: enabled only when professionalId > 0 and day is YYYY-MM-DD.
  <input type="datetime-local" value={appointmentDate}
    onChange={(event) => setValue("appointmentDate", event.target.value, { shouldValidate: true })} />
  <ProfessionalDaySchedule professionalId={professionalId} date={day}
    selectedLocalDateTime={appointmentDate}
    onSelect={(value) => setValue("appointmentDate", value, { shouldValidate: true })} />
  ```
- [ ] **Step 4: Re-run test and inspect UI.** Run the focused Vitest file, `npx tsc --noEmit`, and `npx eslint` on changed front files. Inspect one desktop and one mobile render together; fix concrete visual or accessibility defects in one pass. Run Impeccable's detector once on the changed UI targets and recheck once if fixes were needed. Commit the panel unit.

### Task 5: Edit error handling and integrated verification

**Files:**
- Modify: `MultiClinicaFront/src/app/(authenticated)/app/agenda/components/AgendaDetails.tsx`
- Test: `MultiClinicaFront/src/app/(authenticated)/app/agenda/components/AgendaDetails.test.tsx`

**Interfaces:** The edit form sends `appointmentLocalDateTime` for the existing professional and reads `AppointmentConflict` / `InvalidDate` without clearing the form.

- [ ] **Step 1: Add failing edit test.** Load a Scheduled appointment whose UTC date differs from its clinic-local date, assert the input shows the clinic-local value from `timeZoneId`, change its date, reject the update with `AppointmentConflict`, and assert the selected date remains visible with the returned message beside the field. Assert no professional selector appears.

  ```tsx
  expect(await screen.findByLabelText(/Data e Hora/)).toHaveValue("2026-09-28T23:30");
  await user.click(screen.getByRole("button", { name: /Salvar/i }));
  expect(await screen.findByText("Este horário já está ocupado.")).toBeInTheDocument();
  expect(screen.getByLabelText(/Data e Hora/)).toHaveValue("2026-09-28T23:30");
  ```
- [ ] **Step 2: Run the focused test.** `npx vitest run 'src/app/(authenticated)/app/agenda/components/AgendaDetails.test.tsx'`; expect the error-state assertion to fail.
- [ ] **Step 3: Implement the small edit change.** Format the fetched UTC `appointmentDate` in its returned `timeZoneId`; remove the injected logged-in `professionalId`, send the clinic-local date/time field, and display the server message by date/time. Do not alter patient or professional linkage on edit.

  ```tsx
  await updateAgenda(id, {
    appointmentLocalDateTime: formData.appointmentDate,
    status: formData.status ?? "Scheduled",
  });
  // On a 409/InvalidDate response, show getApiErrorMessage(error, fallback)
  // beside the date input and retain formData.appointmentDate.
  ```
- [ ] **Step 4: Verify both repositories.** Run focused backend appointment/availability tests, focused front tests, `dotnet build`, `npx tsc --noEmit`, and `npx eslint` for changed files. Check the manual booking path with no configured journey/business hours and both browser/clinic time zones. Inspect `git diff --check` and `git status --short` in both repos. Execute `software-quality-gate` using tools outside the repositories, then check both statuses again. Commit the final front unit; report any real PostgreSQL concurrency test limitation explicitly.
