
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { User, Referral, RedemptionHistory } from '@/types';
import { supabase } from '@/lib/supabase';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Initialize and set up auth listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setCurrentUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profile.name || '',
              referralCode: profile.referral_code || '',
              points: profile.points || 0,
              referredBy: profile.referred_by || undefined,
            });
          }
          
          // Fetch referrals
          const { data: referralsData } = await supabase
            .from('referrals')
            .select('*')
            .eq('referrer_id', session.user.id);
            
          if (referralsData) {
            setReferrals(referralsData.map(r => ({
              id: r.id,
              referrerCode: r.referrer_code,
              refereeEmail: r.referee_email,
              date: r.created_at,
              status: r.status,
            })));
          }
          
          // Fetch redemptions
          const { data: redemptionsData } = await supabase
            .from('redemptions')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (redemptionsData) {
            setRedemptions(redemptionsData.map(r => ({
              id: r.id,
              userId: r.user_id,
              rewardId: r.reward_id,
              rewardName: r.reward_name,
              pointsCost: r.points_cost,
              date: r.created_at,
              status: r.status,
            })));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // Call the initialization function
    initializeAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile after sign in
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profile.name || '',
            referralCode: profile.referral_code || '',
            points: profile.points || 0,
            referredBy: profile.referred_by || undefined,
          });
          
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setReferrals([]);
        setRedemptions([]);
      }
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const generateReferralCode = (name: string): string => {
    // Create a code based on first 3 letters of name + 3 random numbers
    const prefix = name.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
    return `${prefix}${randomNum}`;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
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
    }
  };

  const signup = async (email: string, name: string, password: string, referralCode?: string): Promise<boolean> => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (authError || !authData.user) {
        toast({
          title: "Signup failed",
          description: authError?.message || "Failed to create account",
          variant: "destructive",
        });
        return false;
      }
      
      const userId = authData.user.id;
      const newReferralCode = generateReferralCode(name);
      let initialPoints = 0;
      let referrerId = null;
      
      // Check if a valid referral code was provided
      if (referralCode) {
        const { data: referrerData } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .single();
        
        if (referrerData) {
          referrerId = referrerData.id;
          initialPoints = 5; // Bonus points for being referred
          
          // Add referral record
          await supabase.from('referrals').insert({
            referrer_id: referrerId,
            referee_id: userId,
            referrer_code: referralCode,
            referee_email: email,
          });
          
          // Update referrer's points
          await supabase.rpc('increment_user_points', {
            user_id: referrerId,
            points_to_add: 10
          });
          
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
        }
      }
      
      // Create user profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email,
        name,
        referral_code: newReferralCode,
        points: initialPoints,
        referred_by: referrerId,
      });
      
      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast({
          title: "Profile setup error",
          description: "Account created but profile setup failed",
          variant: "destructive",
        });
        return true; // Auth part succeeded, so return true
      }
      
      toast({
        title: "Account created!",
        description: "Welcome to the referral program!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Logout error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const addRedemption = async (redemptionData: Omit<RedemptionHistory, 'id' | 'date'>) => {
    try {
      if (!currentUser) return;
      
      // Insert redemption record
      const { data: redemptionRecord, error: redemptionError } = await supabase
        .from('redemptions')
        .insert({
          user_id: currentUser.id,
          reward_id: redemptionData.rewardId,
          reward_name: redemptionData.rewardName,
          points_cost: redemptionData.pointsCost,
          status: 'completed',
        })
        .select()
        .single();
      
      if (redemptionError) {
        toast({
          title: "Redemption error",
          description: "Failed to record redemption",
          variant: "destructive",
        });
        return;
      }
      
      // Update user points
      const { error: pointsError } = await supabase.rpc('decrement_user_points', {
        user_id: currentUser.id,
        points_to_subtract: redemptionData.pointsCost
      });
      
      if (pointsError) {
        toast({
          title: "Points update error",
          description: "Failed to update points balance",
          variant: "destructive",
        });
        return;
      }
      
      // Update current user state
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          points: currentUser.points - redemptionData.pointsCost
        });
      }
      
      // Update redemptions state
      const newRedemption: RedemptionHistory = {
        id: redemptionRecord.id,
        userId: redemptionRecord.user_id,
        rewardId: redemptionRecord.reward_id,
        rewardName: redemptionRecord.reward_name,
        pointsCost: redemptionRecord.points_cost,
        date: redemptionRecord.created_at,
        status: redemptionRecord.status,
      };
      
      setRedemptions(prev => [...prev, newRedemption]);
      
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
