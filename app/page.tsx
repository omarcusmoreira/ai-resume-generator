'use client'

import { ProtectedRoute } from '@/components/ProtectedRouter/page';
import GenerateResumePage from './generate-resume/page';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <GenerateResumePage />
    </ProtectedRoute>
  );
}
