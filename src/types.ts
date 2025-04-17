
export interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  points: number;
  referredBy?: string;
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
}

export interface RedemptionHistory {
  id: string;
  userId: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  date: string;
}
