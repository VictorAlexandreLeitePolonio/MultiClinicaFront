export function clinicDateTimeToIso(localDateTime: string, timeZoneId: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localDateTime);
  if (!match) throw new Error("Data e hora inválidas.");
  const [, year, month, day, hour, minute] = match.map(Number);
  const expected = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZoneId, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const parts = (instant: number) => {
    const values = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));
    return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute));
  };
  let instant = expected;
  for (let attempt = 0; attempt < 3; attempt++) instant += expected - parts(instant);
  if (parts(instant) !== expected) throw new Error("Horário inválido no fuso da clínica.");
  for (const minutes of [-120, -90, -60, -30, 30, 60, 90, 120]) {
    if (parts(instant + minutes * 60_000) === expected)
      throw new Error("Horário ambíguo no fuso da clínica.");
  }
  return new Date(instant).toISOString();
}
