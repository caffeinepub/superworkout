import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useGetBookings, useGetWorkoutPrograms, useGetGyms, useDeleteBooking, useMarkBookingAsPaid, useMarkBookingAsUnpaid } from '../../hooks/useQueries';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, Clock, MapPin, User, Trash2, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';

export default function BookingsTab() {
  const { data: bookings = [] } = useGetBookings();
  const { data: programs = [] } = useGetWorkoutPrograms();
  const { data: gyms = [] } = useGetGyms();
  const deleteBooking = useDeleteBooking();
  const markAsPaid = useMarkBookingAsPaid();
  const markAsUnpaid = useMarkBookingAsUnpaid();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);

  const getProgramName = (programId: string) => {
    return programs.find((p) => p.id === programId)?.title || 'Unknown Program';
  };

  const getGymInfo = (gymId: string) => {
    const gym = gyms.find((g) => g.id === gymId);
    return gym ? { name: gym.name, address: gym.address } : { name: 'Unknown Gym', address: '' };
  };

  const handleDelete = async (bookingId: string) => {
    setDeletingId(bookingId);
    try {
      await deleteBooking.mutateAsync(bookingId);
      toast.success('Booking deleted successfully');
    } catch (error) {
      toast.error('Failed to delete booking');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePayment = async (bookingId: string, currentStatus: boolean) => {
    setProcessingPaymentId(bookingId);
    try {
      if (currentStatus) {
        await markAsUnpaid.mutateAsync(bookingId);
        toast.success('Marked as unpaid');
      } else {
        await markAsPaid.mutateAsync(bookingId);
        toast.success('Marked as paid');
      }
    } catch (error) {
      toast.error('Failed to update payment status');
      console.error(error);
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const isPastBooking = (date: string, time: string) => {
    const bookingDateTime = new Date(`${date}T${time}`);
    return bookingDateTime < new Date();
  };

  const currentBookings = bookings.filter((b) => !isPastBooking(b.date, b.time));
  const pastBookings = bookings.filter((b) => isPastBooking(b.date, b.time));

  const BookingCard = ({ booking, isPast = false }: { booking: any; isPast?: boolean }) => {
    const gymInfo = getGymInfo(booking.gymId);
    const hasHealthInfo = booking.healthInformation && booking.healthInformation.trim().length > 0;

    return (
      <Card className={isPast ? 'opacity-75' : ''}>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={isPast ? 'secondary' : 'outline'}>{getProgramName(booking.programId)}</Badge>
                  {isPast && <Badge variant="outline" className="text-xs">Completed</Badge>}
                  <Badge variant={booking.isPaid ? 'default' : 'secondary'}>
                    <DollarSign className="h-3 w-3 mr-1" />
                    {booking.isPaid ? 'Paid' : 'Not Paid'}
                  </Badge>
                  {booking.healthDisclosureAccepted && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      Disclosure Accepted
                    </Badge>
                  )}
                  {hasHealthInfo && (
                    <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Health Info
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{booking.user.toString().slice(0, 10)}...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{gymInfo.name}</span>
                      {gymInfo.address && (
                        <span className="text-xs">{gymInfo.address}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{booking.time}</span>
                  </div>
                </div>
                {hasHealthInfo && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2">
                        <FileText className="h-4 w-4 mr-2" />
                        View Health Information
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Health Information</DialogTitle>
                        <DialogDescription>
                          Information provided by the client for this booking
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[400px] w-full rounded-md border p-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-2">Client:</p>
                            <p className="text-sm text-muted-foreground">{booking.user.toString()}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Session Details:</p>
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline">{booking.date}</Badge>
                              <Badge variant="outline">{booking.time}</Badge>
                              <Badge variant="outline">{getProgramName(booking.programId)}</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Health Information:</p>
                            <div className="bg-muted p-4 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{booking.healthInformation}</p>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={booking.isPaid ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleTogglePayment(booking.id, booking.isPaid)}
                  disabled={processingPaymentId === booking.id}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  {processingPaymentId === booking.id
                    ? 'Processing...'
                    : booking.isPaid
                      ? 'Mark Unpaid'
                      : 'Mark Paid'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant={isPast ? 'outline' : 'destructive'}
                      size="sm"
                      disabled={deletingId === booking.id}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deletingId === booking.id ? 'Deleting...' : isPast ? 'Remove' : 'Delete'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{isPast ? 'Remove Past Session' : 'Delete Booking'}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {isPast
                          ? 'Are you sure you want to remove this past session from the records? This action cannot be undone.'
                          : 'Are you sure you want to delete this booking? This will free up the time slot for other users. This action cannot be undone.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(booking.id)}>
                        {isPast ? 'Remove' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Current Bookings</CardTitle>
          <CardDescription>Upcoming and active training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {currentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No current bookings.</p>
          ) : (
            <div className="space-y-4">
              {currentBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
          <CardDescription>Completed training sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {pastBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No past sessions.</p>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
