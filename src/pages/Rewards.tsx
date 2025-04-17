
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useRewards } from '@/contexts/RewardsContext';
import RewardCard from '@/components/rewards/RewardCard';

const Rewards = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const { rewards } = useRewards();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <div className="space-y-8 py-8">
        <div>
          <h1 className="text-3xl font-bold">Rewards</h1>
          <p className="text-muted-foreground mt-1">
            You have {currentUser?.points || 0} points available to redeem.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rewards.map(reward => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Rewards;
