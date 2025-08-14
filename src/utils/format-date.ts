export function formatDate(dateString: string) {
  // Handle both ISO date strings (YYYY-MM-DD) and full ISO datetime strings (YYYY-MM-DDTHH:MM:SSZ)
  const date = dateString.includes('T')
    ? new Date(dateString)
    : new Date(`${dateString}T00:00:00Z`);

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
