
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Award, Gift, Users } from 'lucide-react';
import Layout from '@/components/Layout';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="flex flex-col gap-12 py-8">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <div className="inline-block p-2 bg-primary/20 rounded-full mb-4">
            <Award size={36} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Refer Friends, <span className="text-primary">Earn Rewards</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share your unique referral code with friends and both of you will earn points. 
            Redeem your points for exclusive rewards and benefits.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button size="lg" className="px-8" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" className="px-8" asChild>
                  <Link to="/signup">Join Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Three simple steps to start earning rewards</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-lg shadow-md text-center flex flex-col items-center">
              <div className="bg-primary/20 p-3 rounded-full mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Refer Friends</h3>
              <p className="text-muted-foreground">Share your unique referral code with friends and family</p>
            </div>
            
            <div className="bg-card p-8 rounded-lg shadow-md text-center flex flex-col items-center">
              <div className="bg-primary/20 p-3 rounded-full mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Earn Points</h3>
              <p className="text-muted-foreground">Get 10 points when someone signs up using your code</p>
            </div>
            
            <div className="bg-card p-8 rounded-lg shadow-md text-center flex flex-col items-center">
              <div className="bg-primary/20 p-3 rounded-full mb-4">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Redeem Rewards</h3>
              <p className="text-muted-foreground">Use your points to claim exclusive rewards and benefits</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground rounded-xl p-12 text-center my-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our referral program today and start earning rewards by referring your friends.
          </p>
          {isAuthenticated ? (
            <Button size="lg" variant="secondary" className="px-8" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="px-8" asChild>
              <Link to="/signup">Sign Up Now</Link>
            </Button>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
