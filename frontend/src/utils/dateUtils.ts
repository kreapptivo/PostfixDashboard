/**
 * Date utility functions for accurate date range filtering
 */

/**
 * Get the start of today (00:00:00)
 */
export const getStartOfToday = (): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Get the end of today (23:59:59)
 */
export const getEndOfToday = (): Date => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Get date N days ago at start of day
 */
export const getDateDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateToISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get today's date range (start and end)
 */
export const getTodayRange = (): { startDate: string; endDate: string } => {
  const today = new Date();
  return {
    startDate: formatDateToISO(getStartOfToday()),
    endDate: formatDateToISO(today),
  };
};

/**
 * Get date range for last N days
 */
export const getLastNDaysRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = getDateDaysAgo(days - 1); // -1 because we want to include today
  
  return {
    startDate: formatDateToISO(startDate),
    endDate: formatDateToISO(endDate),
  };
};

/**
 * Get this week's date range (Monday to today)
 */
export const getThisWeekRange = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = Sunday
  
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  
  return {
    startDate: formatDateToISO(monday),
    endDate: formatDateToISO(today),
  };
};

/**
 * Get this month's date range (1st to today)
 */
export const getThisMonthRange = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  return {
    startDate: formatDateToISO(firstDayOfMonth),
    endDate: formatDateToISO(today),
  };
};

/**
 * Get last month's full date range
 */
export const getLastMonthRange = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  
  return {
    startDate: formatDateToISO(firstDayOfLastMonth),
    endDate: formatDateToISO(lastDayOfLastMonth),
  };
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
};