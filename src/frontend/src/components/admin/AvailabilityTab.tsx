import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Label } from '../ui/label';
import {
  useGetAvailableTimeSlots,
  useMarkTimeSlotUnavailable,
  useUnmarkTimeSlotUnavailable,
} from '../../hooks/useQueries';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export default function AvailabilityTab() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: timeSlots = [], isLoading: timeSlotsLoading } = useGetAvailableTimeSlots(formattedDate);
  const markUnavailable = useMarkTimeSlotUnavailable();
  const unmarkUnavailable = useUnmarkTimeSlotUnavailable();
  const [processingSlot, setProcessingSlot] = useState<string | null>(null);

  const handleToggleAvailability = async (time: string, isCurrentlyUnavailable: boolean) => {
    if (!selectedDate) return;

    const slotKey = `${formattedDate}-${time}`;
    setProcessingSlot(slotKey);

    try {
      if (isCurrentlyUnavailable) {
        await unmarkUnavailable.mutateAsync({ date: formattedDate!, time });
        toast.success(`Time slot ${time} marked as available`);
      } else {
        await markUnavailable.mutateAsync({ date: formattedDate!, time });
        toast.success(`Time slot ${time} marked as unavailable`);
      }
    } catch (error) {
      toast.error('Failed to update time slot availability');
      console.error(error);
    } finally {
      setProcessingSlot(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Availability</CardTitle>
          <CardDescription>
            Mark specific days and time slots as unavailable to prevent bookings (08:00 - 21:00)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <div className="flex justify-center lg:justify-start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border w-full max-w-md"
                />
              </div>
            </div>

            {/* Time Slots Section */}
            <div className="space-y-2">
              <Label>Time Slots (08:00 - 21:00)</Label>
              {!selectedDate ? (
                <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground border rounded-md">
                  <div>
                    <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Please select a date first</p>
                  </div>
                </div>
              ) : timeSlotsLoading ? (
                <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground border rounded-md">
                  Loading time slots...
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground border rounded-md">
                  No time slots available
                </div>
              ) : (
                <ScrollArea className="h-[350px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {timeSlots.map((slot) => {
                      const slotKey = `${formattedDate}-${slot.time}`;
                      const isProcessing = processingSlot === slotKey;

                      return (
                        <div
                          key={slot.time}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{slot.time}</span>
                            {slot.isBooked && (
                              <Badge variant="secondary" className="text-xs">
                                Booked
                              </Badge>
                            )}
                            {slot.isUnavailable && !slot.isBooked && (
                              <Badge variant="destructive" className="text-xs">
                                <XCircle className="h-3 w-3 mr-1" />
                                Unavailable
                              </Badge>
                            )}
                            {!slot.isBooked && !slot.isUnavailable && (
                              <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Available
                              </Badge>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={slot.isUnavailable ? 'default' : 'outline'}
                            onClick={() => handleToggleAvailability(slot.time, slot.isUnavailable)}
                            disabled={slot.isBooked || isProcessing}
                          >
                            {isProcessing
                              ? 'Processing...'
                              : slot.isUnavailable
                                ? 'Mark Available'
                                : 'Mark Unavailable'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              {selectedDate && timeSlots.length > 0 && (
                <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-2 p-3 bg-muted/50 rounded-md">
                  <p className="font-medium">Legend:</p>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span>Available - Can be marked unavailable</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3 w-3 text-destructive" />
                    <span>Unavailable - Blocked by admin</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">Booked - Cannot be modified</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedDate && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Selected Date:</p>
              <Badge variant="outline" className="font-normal">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {format(selectedDate, 'PPP')}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
