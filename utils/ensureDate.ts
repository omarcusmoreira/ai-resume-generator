export const ensureDate = (date: { seconds: number, nanoseconds: number } | Date | string | number | null | undefined): Date | null => {

    if (!date) {
        return null;
    }

    if (date instanceof Date) {
       return date;
    }

    // Check if it's the timestamp object with seconds and nanoseconds
    if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
        const dateObj = new Date(date.seconds * 1000); // Convert seconds to milliseconds
        return dateObj;
    }

    if (typeof date === 'string' || typeof date === 'number') {
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    return null;
};