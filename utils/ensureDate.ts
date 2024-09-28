export const ensureDate = (date: { seconds: number, nanoseconds: number } | Date | string | number | null | undefined): Date | null => {
    console.log('date: ', date);

    if (!date) {
        console.log('No date');
        return null;
    }

    if (date instanceof Date) {
        console.log('Returning type Date');
        return date;
    }

    // Check if it's the timestamp object with seconds and nanoseconds
    if (typeof date === 'object' && 'seconds' in date && 'nanoseconds' in date) {
        const dateObj = new Date(date.seconds * 1000); // Convert seconds to milliseconds
        console.log('Returning type Timestamp-like object');
        return dateObj;
    }

    if (typeof date === 'string' || typeof date === 'number') {
        const parsedDate = new Date(date);
        console.log('Returning type string or number');
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    console.log('Returning null');
    return null;
};