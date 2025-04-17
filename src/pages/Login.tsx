
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="py-12">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default Login;
