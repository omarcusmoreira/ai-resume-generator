import { Timestamp } from "firebase/firestore";

type TimestampLike = {
  seconds: number;
  nanoseconds: number;
};

type TimestampRendererProps = {
  timestamp: Timestamp | Date | string | number | TimestampLike | null | undefined;
  format: 'toLocale' | 'toDateString' | 'toString' | 'toISODate';
  fallback: string;
};

//eslint-disable-next-line
const isTimestampLike = (value: any): value is TimestampLike => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  );
};

// Utility function to adjust for UTC to YYYY-MM-DD format
const formatToISODate = (date: Date): string => {
  // Convert the date to the correct YYYY-MM-DD format in UTC
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day}/${month}/${year}`
};

export const TimestampRenderer: React.FC<TimestampRendererProps> = ({ timestamp, format, fallback }) => {
  if (!timestamp) {
    return <>{fallback}</>;
  }

  let date: Date;

  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (isTimestampLike(timestamp)) {
    date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return <>{fallback}</>;
  }

  if (isNaN(date.getTime())) {
    return <>{fallback}</>;
  }

  // Handle formatting options
  if (format === 'toLocale') {
    return <>{date.toLocaleDateString('pt-BR')}</>;
  }

  if (format === 'toDateString') {
    return <>{date.toDateString()}</>;
  }

  // Format as YYYY-MM-DD (ISO format), but in UTC to avoid the timezone shift
  if (format === 'toISODate') {
    return <>{formatToISODate(date)}</>;
  }

  // Default to full date string
  return <>{date.toString()}</>;
};
