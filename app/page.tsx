'use client'

import { AuthProvider, useAuth } from '@/context/AuthContext';
import LandingPage from './landing-page/page';
import ResumePage from './resume/page';
import Layout from './layout';

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Layout>
        {user ? <ResumePage /> : <LandingPage />}
      </Layout>
    </AuthProvider>
  );
}
