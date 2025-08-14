import { format, parseISO, addDays, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatTimeForInput(time: string): string {
  return time;
}

export function formatDisplayDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM dd, yyyy');
}

export function formatDisplayTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  
  const date = new Date();
  date.setHours(hour, minute);
  
  return format(date, 'HH:mm');
}

export function getUpcomingMeetings(meetings: any[], weeksAhead: number = 2) {
  const now = new Date();
  const futureDate = addDays(now, weeksAhead * 7);
  
  return meetings.filter(meeting => {
    const meetingDate = parseISO(meeting.date);
    return isWithinInterval(meetingDate, { start: now, end: futureDate });
  }).sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA.getTime() - dateB.getTime();
  });
}

export function getCurrentWeekRange() {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(now, { weekStartsOn: 1 })
  };
}

export function getMeetingTypeColor(type: string) {
  switch (type) {
    case 'PaperPresentation':
      return {
        background: 'hsl(38.2 93.8% 53.1% / 0.2)',
        border: 'hsl(38.2 93.8% 53.1%)',
        text: 'hsl(38.2 93.8% 25%)'
      };
    case 'WorkPresentation':
      return {
        background: 'hsl(262.7 82.9% 68.6% / 0.2)',
        border: 'hsl(262.7 82.9% 68.6%)',
        text: 'hsl(262.7 82.9% 35%)'
      };
    case 'Tutorial':
      return {
        background: 'hsl(188.7 81.3% 54.1% / 0.2)',
        border: 'hsl(188.7 81.3% 54.1%)',
        text: 'hsl(188.7 81.3% 25%)'
      };
    default:
      return {
        background: 'hsl(210 5.2632% 92%)',
        border: 'hsl(210 5.2632% 70%)',
        text: 'hsl(210 25% 7.8431%)'
      };
  }
}

export function getMeetingTypeBadgeClass(type: string) {
  switch (type) {
    case 'PaperPresentation':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'WorkPresentation':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Tutorial':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function isInternExpiringSoon(expirationDate: string | null, daysThreshold: number = 30): boolean {
  if (!expirationDate) return false;
  
  const expDate = parseISO(expirationDate);
  const now = new Date();
  const thresholdDate = addDays(now, daysThreshold);
  
  return expDate <= thresholdDate && expDate >= now;
}
