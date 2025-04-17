
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import SignupForm from '@/components/auth/SignupForm';
import { useAuth } from '@/contexts/AuthContext';

const Signup = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="py-12">
        <SignupForm />
      </div>
    </Layout>
  );
};

export default Signup;
