export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day}\n${time}`;
}

export function formatDateShort(dateInput) {
  if (!dateInput) return '—';
  return new Date(dateInput).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
