export function today() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function currentTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
}

export function isPastSlot(date: string, time: string) {
  return date < today() || (date === today() && time <= currentTime());
}

export function formatDate(date: string) {
  return date.split('-').reverse().join('/');
}

export function addDays(date: string, days: number) {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function normalize(value: string) {
  return value.trim().toLowerCase();
}
