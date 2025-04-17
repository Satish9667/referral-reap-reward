
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import ShareReferral from '@/components/dashboard/ShareReferral';
import ReferralHistory from '@/components/dashboard/ReferralHistory';
import RedemptionHistory from '@/components/dashboard/RedemptionHistory';
import { Award, Gift, Users } from 'lucide-react';

const Dashboard = () => {
  const { currentUser, isAuthenticated, referrals, redemptions } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Count referrals made by user
  const userReferralsCount = referrals.filter(
    referral => currentUser && referral.referrerCode === currentUser.referralCode
  ).length;

  // Count redemptions made by user
  const userRedemptionsCount = redemptions.filter(
    redemption => currentUser && redemption.userId === currentUser.id
  ).length;

  return (
    <Layout>
      <div className="space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {currentUser?.name}! Here's an overview of your activity.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard 
            title="Available Points" 
            value={currentUser?.points || 0}
            icon={Award}
            description="Use points to redeem rewards"
          />
          <StatCard 
            title="Successful Referrals" 
            value={userReferralsCount}
            icon={Users}
            description="People who signed up using your code"
          />
          <StatCard 
            title="Rewards Redeemed" 
            value={userRedemptionsCount}
            icon={Gift}
            description="Number of rewards you've claimed"
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <ShareReferral />
          <ReferralHistory />
        </div>
        
        <RedemptionHistory />
      </div>
    </Layout>
  );
};

export default Dashboard;
