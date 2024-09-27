import { Timestamp } from "firebase/firestore";

type TimestampLike = {
    seconds: number;
    nanoseconds: number;
  };
  
  type TimestampRendererProps = {
    timestamp: Timestamp | Date | string | number | TimestampLike | null | undefined;
    format: 'toLocale' | 'toDateString' | 'toString';
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
  
  export const TimestampRenderer: React.FC<TimestampRendererProps> = ({ timestamp, format, fallback }) => {
    if (!timestamp) {
      return fallback;
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
      return fallback;
    }
  
    if (isNaN(date.getTime())) {
      return fallback;
    }

    if(format === 'toLocale'){
        return date.toLocaleDateString()
    }
    if(format === 'toDateString'){
        return date.toDateString()
    }
    return date.toString()
  };