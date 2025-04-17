
import React, { createContext, useState, useContext } from 'react';
import { Reward } from '@/types';
import { useAuth } from './AuthContext';

// Static rewards for the first version
const initialRewards: Reward[] = [
  {
    id: "reward1",
    name: "Free eBook",
    description: "Download our exclusive guide on maximizing your productivity",
    pointsCost: 30,
    image: "/placeholder.svg",
  },
  {
    id: "reward2",
    name: "Amazon Coupon",
    description: "$10 Amazon gift card for your next purchase",
    pointsCost: 100,
    image: "/placeholder.svg",
  },
  {
    id: "reward3",
    name: "Premium Membership",
    description: "One month of premium membership features",
    pointsCost: 150,
    image: "/placeholder.svg",
  },
  {
    id: "reward4",
    name: "Exclusive Webinar",
    description: "Access to our upcoming expert webinar",
    pointsCost: 50,
    image: "/placeholder.svg",
  },
];

interface RewardsContextType {
  rewards: Reward[];
  redeemReward: (rewardId: string) => boolean;
  canRedeem: (rewardId: string) => boolean;
}

const RewardsContext = createContext<RewardsContextType>({
  rewards: initialRewards,
  redeemReward: () => false,
  canRedeem: () => false,
});

export const useRewards = () => useContext(RewardsContext);

export function RewardsProvider({ children }: { children: React.ReactNode }) {
  const [rewards] = useState<Reward[]>(initialRewards);
  const { currentUser, addRedemption } = useAuth();

  const canRedeem = (rewardId: string): boolean => {
    if (!currentUser) return false;
    
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return false;
    
    return currentUser.points >= reward.pointsCost;
  };

  const redeemReward = (rewardId: string): boolean => {
    if (!canRedeem(rewardId)) return false;
    
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || !currentUser) return false;
    
    addRedemption({
      userId: currentUser.id,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsCost: reward.pointsCost,
    });
    
    return true;
  };

  return (
    <RewardsContext.Provider value={{ rewards, redeemReward, canRedeem }}>
      {children}
    </RewardsContext.Provider>
  );
}
