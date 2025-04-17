
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ShareReferral = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const referralCode = currentUser?.referralCode || '';
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  const createConfetti = () => {
    setShowConfetti(true);
    const colors = ['#9b87f5', '#7E69AB', '#E5DEFF', '#D6BCFA'];
    
    // Create 50 confetti pieces
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `${Math.random() * 20}vh`;
      document.body.appendChild(confetti);
      
      // Remove confetti after animation completes
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 5000);
    }
    
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
      createConfetti();
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again or copy manually',
        variant: 'destructive',
      });
    }
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join me on ReferReward',
        text: `Use my referral code ${referralCode} to sign up and get bonus points!`,
        url: referralLink,
      })
      .then(() => {
        toast({
          title: 'Shared!',
          description: 'Thanks for sharing your referral link',
        });
        createConfetti();
      })
      .catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      copyToClipboard(referralLink);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Share Your Referral</CardTitle>
        <CardDescription>
          Invite friends and earn 10 points for each successful referral
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Your Referral Code</div>
          <div className="flex items-center space-x-2">
            <div className="bg-secondary p-2 px-3 rounded-md font-mono text-lg font-semibold">
              {referralCode}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => copyToClipboard(referralCode)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium">Referral Link</div>
          <div className="flex space-x-2">
            <Input 
              readOnly 
              value={referralLink} 
              onClick={(e) => (e.target as HTMLInputElement).select()} 
            />
            <Button 
              onClick={() => copyToClipboard(referralLink)} 
              variant="outline"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={shareReferral}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share Referral
        </Button>
      </CardContent>
    </Card>
  );
};

export default ShareReferral;
