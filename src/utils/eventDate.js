function parseTime(time) {
  if (typeof time !== 'string') {
    return { hours: 0, minutes: 0 };
  }

  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) {
    return { hours: 0, minutes: 0 };
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours <= 23 && minutes <= 59 ? { hours, minutes } : null;
}

export function parseEventDate(date, time) {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  const parsedTime = parseTime(time);
  if (!parsedTime) return null;

  parsed.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return parsed;
}

export function isUpcomingEvent(event, now = new Date()) {
  const eventDate = parseEventDate(event?.date, event?.time);
  return Boolean(eventDate && eventDate >= now);
}

export function sortEventsByDate(events) {
  return [...events].sort((first, second) => {
    const firstDate = parseEventDate(first.date, first.time)?.getTime() || Number.MAX_SAFE_INTEGER;
    const secondDate = parseEventDate(second.date, second.time)?.getTime() || Number.MAX_SAFE_INTEGER;
    return firstDate - secondDate;
  });
}
