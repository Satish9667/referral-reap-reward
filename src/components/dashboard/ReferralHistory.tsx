
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Referral } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const ReferralHistory = () => {
  const { referrals, currentUser } = useAuth();
  
  // Filter referrals made by the current user
  const userReferrals = referrals.filter(
    (referral) => currentUser && referral.referrerCode === currentUser.referralCode
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Referral History</CardTitle>
        <CardDescription>
          People you've referred to join our platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userReferrals.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Points Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userReferrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>{referral.refereeEmail}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(referral.date), { addSuffix: true })}
                  </TableCell>
                  <TableCell>+10</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            You haven't referred anyone yet. Share your code to start earning points!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralHistory;
