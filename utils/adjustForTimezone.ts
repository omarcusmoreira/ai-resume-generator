export const adjustForTimezone = (date: Date): Date => {
    const timezoneOffset = date.getTimezoneOffset(); // Offset in minutes
    return new Date(date.getTime() - timezoneOffset * 60 * 1000);
  };
  