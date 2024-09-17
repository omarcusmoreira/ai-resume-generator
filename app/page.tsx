'use client'

import { AuthProvider, useAuth } from '@/context/AuthContext';
import Layout from './layout';
import GenerateResumePage from './generate-resume/page';

export default function HomePage() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Layout>
        <GenerateResumePage />
      </Layout>
    </AuthProvider>
  );
}
