
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User, Referral, RedemptionHistory } from '@/types';

// Mock data for demo purposes
const mockUsers: User[] = [
  {
    id: "user1",
    email: "demo@example.com",
    name: "Demo User",
    referralCode: "DEMO123",
    points: 50,
  }
];

const mockReferrals: Referral[] = [];

const mockRedemptions: RedemptionHistory[] = [];

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
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

const USERS_KEY = 'referral-app-users';
const CURRENT_USER_KEY = 'referral-app-current-user';
const REFERRALS_KEY = 'referral-app-referrals';
const REDEMPTIONS_KEY = 'referral-app-redemptions';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize data on first load
  useEffect(() => {
    const initializeData = () => {
      try {
        // Check if we have users in localStorage, if not, set default mock data
        const storedUsers = localStorage.getItem(USERS_KEY);
        if (!storedUsers) {
          localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
        }

        // Check if we have referrals in localStorage
        const storedReferrals = localStorage.getItem(REFERRALS_KEY);
        if (!storedReferrals) {
          localStorage.setItem(REFERRALS_KEY, JSON.stringify(mockReferrals));
        } else {
          setReferrals(JSON.parse(storedReferrals));
        }

        // Check if we have redemptions in localStorage
        const storedRedemptions = localStorage.getItem(REDEMPTIONS_KEY);
        if (!storedRedemptions) {
          localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(mockRedemptions));
        } else {
          setRedemptions(JSON.parse(storedRedemptions));
        }

        // Check if we have a current user in localStorage
        const storedCurrentUser = localStorage.getItem(CURRENT_USER_KEY);
        if (storedCurrentUser) {
          setCurrentUser(JSON.parse(storedCurrentUser));
        }
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const generateReferralCode = (name: string): string => {
    // Create a code based on first 3 letters of name + 3 random numbers
    const prefix = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
    return `${prefix}${randomNum}`;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would validate credentials against a backend
      const usersString = localStorage.getItem(USERS_KEY);
      if (!usersString) return false;
      
      const users: User[] = JSON.parse(usersString);
      const user = users.find(u => u.email === email);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        toast({
          title: "Logged in successfully!",
          description: `Welcome back, ${user.name}!`,
        });
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const signup = async (email: string, name: string, password: string, referralCode?: string): Promise<boolean> => {
    try {
      // In a real app, this would create an account in a backend
      const usersString = localStorage.getItem(USERS_KEY);
      if (!usersString) return false;
      
      const users: User[] = JSON.parse(usersString);
      
      // Check if user already exists
      if (users.some(u => u.email === email)) {
        toast({
          title: "Signup failed",
          description: "Email already in use",
          variant: "destructive",
        });
        return false;
      }

      // Create new user
      const newUser: User = {
        id: `user${Date.now()}`,
        email,
        name,
        referralCode: generateReferralCode(name),
        points: 0,
      };

      // Check if a valid referral code was provided
      if (referralCode) {
        const referrer = users.find(u => u.referralCode === referralCode);
        
        if (referrer) {
          // Make sure user isn't referring themselves with a fake code
          if (referrer.email === email) {
            toast({
              title: "Invalid referral",
              description: "You cannot refer yourself",
              variant: "destructive",
            });
            return false;
          }

          // Add referral record
          const newReferral: Referral = {
            id: `ref${Date.now()}`,
            referrerCode: referralCode,
            refereeEmail: email,
            date: new Date().toISOString(),
          };
          
          const updatedReferrals = [...referrals, newReferral];
          setReferrals(updatedReferrals);
          localStorage.setItem(REFERRALS_KEY, JSON.stringify(updatedReferrals));
          
          // Update referrer's points
          const updatedUsers = users.map(u => {
            if (u.id === referrer.id) {
              return { ...u, points: u.points + 10 };
            }
            return u;
          });
          
          // Add welcome points to new user
          newUser.points = 5;
          newUser.referredBy = referrer.id;
          
          localStorage.setItem(USERS_KEY, JSON.stringify([...updatedUsers, newUser]));
          
          toast({
            title: "Welcome bonus!",
            description: "You've received 5 points for signing up with a referral!",
          });
        } else {
          toast({
            title: "Invalid referral code",
            description: "The referral code you entered is not valid",
            variant: "destructive",
          });
          localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
        }
      } else {
        // No referral code, just add the user
        localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
      }

      setCurrentUser(newUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      
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
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    toast({
      title: "Logged out",
      description: "You've been successfully logged out",
    });
  };

  const addRedemption = (redemptionData: Omit<RedemptionHistory, 'id' | 'date'>) => {
    try {
      if (!currentUser) return;

      const newRedemption: RedemptionHistory = {
        ...redemptionData,
        id: `redeem${Date.now()}`,
        date: new Date().toISOString(),
      };

      // Update user points
      const usersString = localStorage.getItem(USERS_KEY);
      if (usersString) {
        const users: User[] = JSON.parse(usersString);
        const updatedUsers = users.map(u => {
          if (u.id === currentUser.id) {
            const updatedPoints = u.points - redemptionData.pointsCost;
            // Update current user in state
            const updatedUser = { ...u, points: updatedPoints };
            setCurrentUser(updatedUser);
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
            return updatedUser;
          }
          return u;
        });
        localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }

      // Add to redemption history
      const updatedRedemptions = [...redemptions, newRedemption];
      setRedemptions(updatedRedemptions);
      localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(updatedRedemptions));

      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed ${redemptionData.rewardName}`,
      });
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
