import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="container py-20">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-12 pb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6">
            Your payment has been processed successfully. Thank you for your support!
          </p>
          <Button onClick={() => navigate({ to: '/' })} size="lg">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
