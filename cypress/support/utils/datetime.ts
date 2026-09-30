// Funções para calcular horários e datas no fuso de uma cidade (ex.: "Asia/Tokyo")

// Hora atual no fuso, em minutos desde a meia-noite (ex.: 15:30 → 930)
export function minutesNowIn(timeZone: string): number {
  const time = new Date().toLocaleTimeString('en-GB', { timeZone: timeZone, hour: '2-digit', minute: '2-digit' });
  const [hours, minutes] = time.split(':');
  return Number(hours) * 60 + Number(minutes);
}

// Converte "3:24 PM" em minutos desde a meia-noite
export function clockToMinutes(text: string): number {
  const [time, period] = text.split(' ');
  const [hours, minutes] = time.split(':');
  let hour = Number(hours) % 12;
  if (period === 'PM') {
    hour = hour + 12;
  }
  return hour * 60 + Number(minutes);
}

// Diferença em minutos entre dois horários, considerando a virada da meia-noite
export function minutesBetween(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 24 * 60 - diff);
}

// Data do calendário (dia) daqui a N dias, no fuso.
// Pega a data de hoje no fuso e soma dias no calendário, em vez de somar 24h ao horário atual:
// assim a troca de horário de verão não faz a conta cair no dia errado.
function calendarDateIn(timeZone: string, daysFromToday: number): Date {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: timeZone }); // "2026-09-29"
  const [year, month, day] = today.split('-');
  // Meio-dia em UTC: longe da meia-noite, a data não muda ao formatar
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + daysFromToday, 12));
}

// Dia da semana abreviado ("Wed") daqui a N dias, no fuso
export function weekdayIn(timeZone: string, daysFromToday: number): string {
  const date = calendarDateIn(timeZone, daysFromToday);
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' });
}

// Data como o site mostra ("Wed, Sep 30") daqui a N dias, no fuso
export function dateLabelIn(timeZone: string, daysFromToday: number): string {
  const date = calendarDateIn(timeZone, daysFromToday);
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' });
}
