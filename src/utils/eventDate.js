function parseTime(time) {
  if (typeof time !== 'string') {
    return null;
  }

  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(A\.?M\.?|P\.?M\.?)?$/i);
  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3]?.replace(/\./g, '').toUpperCase();

  if (period && (hours < 1 || hours > 12)) return null;
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours <= 23 && minutes <= 59 ? { hours, minutes } : null;
}

function createLocalDate(year, month, day) {
  const parsed = new Date(year, month, day);
  return parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day
    ? parsed
    : null;
}

export function parseEventDate(date, time) {
  if (!date) return null;

  let parsed;
  if (date instanceof Date) {
    parsed = new Date(date);
  } else if (typeof date === 'string') {
    const value = date.trim();
    const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
    const monthFirstMatch = value.match(/^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/);
    if (isoMatch) {
      parsed = createLocalDate(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    } else if (match || monthFirstMatch) {
      const day = Number(match?.[1] || monthFirstMatch[2]);
      const monthText = match?.[2] || monthFirstMatch[1];
      const year = Number(match?.[3] || monthFirstMatch[3]);
      const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
        .indexOf(monthText.slice(0, 3).toLowerCase());
      parsed = month >= 0 ? createLocalDate(year, month, day) : null;
    } else {
      const numericMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
      parsed = numericMatch
        ? createLocalDate(Number(numericMatch[3]), Number(numericMatch[2]) - 1, Number(numericMatch[1]))
        : new Date(value);
    }
  } else {
    parsed = new Date(date);
  }
  if (!parsed || Number.isNaN(parsed.getTime())) return null;

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
