
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const RedemptionHistory = () => {
  const { redemptions, currentUser } = useAuth();
  
  // Filter redemptions made by the current user
  const userRedemptions = currentUser 
    ? redemptions.filter(redemption => redemption.userId === currentUser.id)
    : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Redemption History</CardTitle>
        <CardDescription>
          Rewards you've redeemed with your points
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userRedemptions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reward</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Points Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRedemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>{redemption.rewardName}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(redemption.date), { addSuffix: true })}
                  </TableCell>
                  <TableCell>-{redemption.pointsCost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            You haven't redeemed any rewards yet. Visit the rewards page to get started!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RedemptionHistory;
