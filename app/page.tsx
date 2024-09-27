'use client'

import { ProtectedRoute } from '@/components/ProtectedRouter';
import JobTrackerDashboard from './job-tracker/page';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <JobTrackerDashboard />
    </ProtectedRoute>
  );
}
