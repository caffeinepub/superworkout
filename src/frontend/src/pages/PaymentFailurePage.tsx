import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { XCircle } from 'lucide-react';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-20">
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="pt-12 pb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-6">
            There was an issue processing your payment. Please try again or contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate({ to: '/booking' })} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>Return to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
