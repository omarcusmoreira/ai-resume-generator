import React from 'react';
import { Timestamp } from "firebase/firestore";

type TimestampLike = {
  seconds: number;
  nanoseconds: number;
};

type TimestampRendererProps = {
  timestamp: Timestamp | Date | string | number | TimestampLike | null | undefined;
  format: 'toLocale' | 'toDateString' | 'toString' | 'toISODate' | 'time';
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

// Utility function to format date
const formatToISODate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
};

// New utility function to format time
const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
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
  switch (format) {
    case 'toLocale':
      return <>{date.toLocaleDateString('pt-BR')}</>;
    case 'toDateString':
      return <>{date.toDateString()}</>;
    case 'toISODate':
      return <>{formatToISODate(date)}</>;
    case 'time':
      return <>{formatTime(date)}</>;
    case 'toString':
    default:
      return <>{date.toString()}</>;
  }
};