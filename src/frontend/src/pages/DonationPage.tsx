import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { useGetDonationOptions } from '../hooks/useQueries';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DonationPage() {
  const { bookingId } = useParams({ from: '/donation/$bookingId' });
  const navigate = useNavigate();
  const { data: donationOptions = [] } = useGetDonationOptions();
  const [selectedOption, setSelectedOption] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (!selectedOption) {
      toast.error('Please select a payment method');
      return;
    }

    setCompleted(true);
    toast.success('Thank you for your booking!');
    setTimeout(() => {
      navigate({ to: '/' });
    }, 2000);
  };

  if (completed) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-4">
              Your training session has been booked successfully. We'll see you soon!
            </p>
            <p className="text-sm text-muted-foreground">Booking ID: {bookingId}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Support & Donation</h1>
          <p className="text-muted-foreground">Choose your preferred payment method</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
            <CardDescription>
              Select how you'd like to pay for your training session. You can pay in cash at the gym or make a donation
              through one of the following methods.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {donationOptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Payment options are being set up. Please pay in cash at your training session.
                </p>
                <Button onClick={() => navigate({ to: '/' })}>Return to Home</Button>
              </div>
            ) : (
              <>
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash Payment</div>
                        <div className="text-sm text-muted-foreground">Pay at the gym during your session</div>
                      </Label>
                    </div>

                    {donationOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{option.method}</div>
                          <div className="text-sm text-muted-foreground">{option.details}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>

                <Button onClick={handleComplete} size="lg" className="w-full">
                  Complete Booking
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
