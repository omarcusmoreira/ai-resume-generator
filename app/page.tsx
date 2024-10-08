'use client'

import { ProtectedRoute } from '@/components/ProtectedRouter';
import GenerateResumePage from './resume-generate/page';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <GenerateResumePage />
    </ProtectedRoute>
  );
}
