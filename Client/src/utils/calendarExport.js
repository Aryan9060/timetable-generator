/**
 * iCalendar (.ics) file generation utility
 */

const DAYS_MAP = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0
};

// Parse time slot format like "8:40 am to 9:40 am" or "11.50 am to 12.50 pm"
const parseTimeRange = (timeStr) => {
  try {
    const cleaned = timeStr.toLowerCase().replace(/[\s.]/g, ''); // e.g., "8:40amto9:40am"
    const parts = cleaned.split('to');
    if (parts.length !== 2) return null;

    const parsePart = (part) => {
      const isPm = part.includes('pm');
      const isAm = part.includes('am');
      let [hoursStr, minutesStr] = part.replace(/am|pm/g, '').split(':');
      if (!minutesStr && part.includes('.')) {
        [hoursStr, minutesStr] = part.replace(/am|pm/g, '').split('.');
      }
      let hours = parseInt(hoursStr) || 0;
      let minutes = parseInt(minutesStr) || 0;
      if (isPm && hours !== 12) hours += 12;
      if (isAm && hours === 12) hours = 0;
      return { hours, minutes };
    };

    return {
      start: parsePart(parts[0]),
      end: parsePart(parts[1])
    };
  } catch (error) {
    console.error("Failed to parse time range:", timeStr, error);
    return null;
  }
};

const formatICSDate = (date, hours = 0, minutes = 0) => {
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(hours);
  const min = pad(minutes);
  const ss = '00';
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}`;
};

export const exportToICS = (timetableData, timeSlots, collegeInfo) => {
  const effectiveDateStr = collegeInfo.effectiveDate || "";
  
  // Find semester start date
  let semStartDate = new Date();
  try {
    const parsed = Date.parse(effectiveDateStr);
    if (!isNaN(parsed)) {
      semStartDate = new Date(parsed);
    } else {
      // Fallback: use next Monday
      const day = semStartDate.getDay();
      const diff = semStartDate.getDate() - day + (day === 0 ? -6 : 1);
      semStartDate = new Date(semStartDate.setDate(diff));
    }
  } catch {
    const day = semStartDate.getDay();
    const diff = semStartDate.getDate() - day + (day === 0 ? -6 : 1);
    semStartDate = new Date(semStartDate.setDate(diff));
  }

  // Set semester end date: 5 months (20 weeks) from start
  const semEndDate = new Date(semStartDate.getTime());
  semEndDate.setMonth(semEndDate.getMonth() + 5);

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MIT MCA Timetable System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  const nowStr = formatICSDate(new Date());

  // Generate events for each weekday
  Object.keys(timetableData).forEach((dayKey) => {
    const targetDayIndex = DAYS_MAP[dayKey];
    if (targetDayIndex === undefined) return;

    // Calculate the first occurrence of this weekday on or after semStartDate
    const eventDate = new Date(semStartDate.getTime());
    const startDayIndex = semStartDate.getDay();
    let daysToAdd = targetDayIndex - startDayIndex;
    if (daysToAdd < 0) {
      daysToAdd += 7; // Go to next week
    }
    eventDate.setDate(eventDate.getDate() + daysToAdd);

    const dayEntries = timetableData[dayKey] || [];
    dayEntries.forEach((cell, idx) => {
      // Skip empty cells, breaks, or continued cells
      if (!cell || cell.isBreak || cell.isContinued) return;

      const slot = timeSlots[idx];
      if (!slot || slot.isBreak) return;

      const parsedTime = parseTimeRange(slot.time);
      if (!parsedTime) return;

      // Event time bounds
      const dtStart = formatICSDate(eventDate, parsedTime.start.hours, parsedTime.start.minutes);
      const dtEnd = formatICSDate(eventDate, parsedTime.end.hours, parsedTime.end.minutes);
      const untilDateStr = formatICSDate(semEndDate, 23, 59);

      const summary = cell.subject;
      const description = `Faculty: ${cell.faculty || 'Not Assigned'}\\nClass Group: ${collegeInfo.classInfo}\\nClass Teacher: ${collegeInfo.classTeacher || 'N/A'}`;
      const location = cell.room || collegeInfo.roomNo || 'TBD';
      const uid = `TT-${collegeInfo.classInfo.replace(/\s+/g, '-')}-${dayKey}-${idx}-${dtStart}@mit-timetable.edu`;

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:${uid}`);
      icsLines.push(`DTSTAMP:${nowStr}`);
      icsLines.push(`DTSTART;TZID=Asia/Kolkata:${dtStart}`);
      icsLines.push(`DTEND;TZID=Asia/Kolkata:${dtEnd}`);
      icsLines.push(`RRULE:FREQ=WEEKLY;UNTIL=${untilDateStr}`);
      icsLines.push(`SUMMARY:${summary}`);
      icsLines.push(`DESCRIPTION:${description}`);
      icsLines.push(`LOCATION:${location}`);
      icsLines.push('END:VEVENT');
    });
  });

  icsLines.push('END:VCALENDAR');

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  
  const link = document.createElement('a');
  const fileName = `Timetable_${collegeInfo.classInfo.replace(/\s+/g, '_')}.ics`;
  
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
