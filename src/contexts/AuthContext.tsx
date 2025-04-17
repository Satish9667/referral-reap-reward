
import React, { createContext, useState, useContext } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User, Referral, RedemptionHistory } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => void;
  referrals: Referral[];
  redemptions: RedemptionHistory[];
  addRedemption: (redemption: Omit<RedemptionHistory, 'id' | 'date'>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  referrals: [],
  redemptions: [],
  addRedemption: () => {},
  isAuthenticated: false,
  loading: false,
});

export const useAuth = () => useContext(AuthContext);

// Mock users database
const users: User[] = [];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReferralCode = (name: string): string => {
    const prefix = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `${prefix}${randomNum}`;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      // Find user in our mock database
      const user = users.find(u => u.email === email);
      
      if (!user || user.password !== password) {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
      
      setCurrentUser(user);
      toast({
        title: "Logged in successfully!",
        description: "Welcome back!",
      });
      return true;
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, name: string, password: string, referralCode?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        toast({
          title: "Signup failed",
          description: "Email already exists",
          variant: "destructive",
        });
        return false;
      }
      
      const newReferralCode = generateReferralCode(name);
      let initialPoints = 0;
      let referrerId = null;
      
      // Check referral code
      if (referralCode) {
        const referrer = users.find(u => u.referralCode === referralCode);
        if (referrer) {
          referrerId = referrer.id;
          initialPoints = 5; // Bonus points for being referred
          
          // Add referral record
          const newReferral: Referral = {
            id: crypto.randomUUID(),
            referrerCode: referralCode,
            refereeEmail: email,
            date: new Date().toISOString(),
            status: 'completed'
          };
          setReferrals(prev => [...prev, newReferral]);
          
          // Update referrer's points
          referrer.points += 10;
        } else {
          toast({
            title: "Invalid referral code",
            description: "The referral code you entered is not valid",
            variant: "destructive",
          });
        }
      }
      
      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        name,
        password, // In a real app, this should be hashed
        referralCode: newReferralCode,
        points: initialPoints,
        referredBy: referrerId
      };
      
      users.push(newUser);
      setCurrentUser(newUser);
      
      toast({
        title: "Account created!",
        description: "Welcome to the referral program!",
      });
      
      return true;
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setReferrals([]);
    setRedemptions([]);
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
  };

  const addRedemption = (redemptionData: Omit<RedemptionHistory, 'id' | 'date'>) => {
    try {
      if (!currentUser) return;
      
      // Create redemption record
      const newRedemption: RedemptionHistory = {
        id: crypto.randomUUID(),
        userId: currentUser.id,
        rewardId: redemptionData.rewardId,
        rewardName: redemptionData.rewardName,
        pointsCost: redemptionData.pointsCost,
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      // Update user points
      if (currentUser.points >= redemptionData.pointsCost) {
        currentUser.points -= redemptionData.pointsCost;
        setCurrentUser({ ...currentUser });
        setRedemptions(prev => [...prev, newRedemption]);
        
        toast({
          title: "Reward redeemed!",
          description: `You've successfully redeemed ${redemptionData.rewardName}`,
        });
      } else {
        toast({
          title: "Insufficient points",
          description: "You don't have enough points for this reward",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Redemption error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    referrals,
    redemptions,
    addRedemption,
    isAuthenticated: !!currentUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
