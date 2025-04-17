export interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  points: number;
  referredBy?: string;
  password: string; // Added for basic auth
  createdAt?: string;
  updatedAt?: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image: string;
}

export interface Referral {
  id: string;
  referrerCode: string;
  refereeEmail: string;
  date: string;
  status?: 'pending' | 'completed';
}

export interface RedemptionHistory {
  id: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  date: string;
  status?: 'pending' | 'completed';
}
