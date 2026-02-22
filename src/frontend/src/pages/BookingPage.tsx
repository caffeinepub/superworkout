import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { useGetWorkoutPrograms, useGetGyms, useCreateBooking, useGetAvailableTimeSlots } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function BookingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: programs = [] } = useGetWorkoutPrograms();
  const { data: gyms = [] } = useGetGyms();
  const createBooking = useCreateBooking();

  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedGym, setSelectedGym] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [healthDisclosureAccepted, setHealthDisclosureAccepted] = useState(false);
  const [healthInformation, setHealthInformation] = useState('');
  const [showHealthDisclosure, setShowHealthDisclosure] = useState(false);

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
  const { data: timeSlots = [], isLoading: timeSlotsLoading } = useGetAvailableTimeSlots(formattedDate);

  const isAuthenticated = !!identity;

  const selectedGymData = gyms.find((g) => g.id === selectedGym);

  const handleContinueToDisclosure = () => {
    if (!selectedProgram || !selectedGym || !selectedDate || !selectedTime) {
      toast.error('Please fill in all fields');
      return;
    }
    setShowHealthDisclosure(true);
  };

  const handleBackToBooking = () => {
    setShowHealthDisclosure(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      return;
    }

    if (!healthDisclosureAccepted) {
      toast.error('You must accept the health disclosure to proceed');
      return;
    }

    try {
      const bookingId = `booking-${Date.now()}`;
      await createBooking.mutateAsync({
        id: bookingId,
        user: identity.getPrincipal(),
        programId: selectedProgram,
        gymId: selectedGym,
        date: format(selectedDate!, 'yyyy-MM-dd'),
        time: selectedTime,
        isPaid: false,
        healthDisclosureAccepted,
        healthInformation: healthInformation.trim(),
      });
      toast.success('Booking created successfully!');
      navigate({ to: '/donation/$bookingId', params: { bookingId } });
    } catch (error: any) {
      if (error.message?.includes('Time slot already booked')) {
        toast.error('This time slot is already booked. Please select another time.');
      } else if (error.message?.includes('Time slot is unavailable')) {
        toast.error('This time slot is unavailable. Please select another time.');
      } else if (error.message?.includes('Health disclosure must be accepted')) {
        toast.error('You must accept the health disclosure to proceed');
      } else {
        toast.error('Failed to create booking');
      }
      console.error(error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to book a training session</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (showHealthDisclosure) {
    return (
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Health Disclosure & Confirmation</h1>
            <p className="text-muted-foreground">Please review and accept the terms before proceeding</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Program:</span>
                  <Badge variant="outline">{programs.find((p) => p.id === selectedProgram)?.title}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <span className="text-sm font-medium">{selectedGymData?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <Badge variant="outline">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {format(selectedDate!, 'PPP')}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time:</span>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedTime}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Health Disclosure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Liability Waiver & Health Disclosure
                </CardTitle>
                <CardDescription>Required for all training sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Notice</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p>
                      By participating in training sessions, you acknowledge that physical exercise involves inherent risks including, but not limited to, muscle strains, sprains, fractures, and other injuries.
                    </p>
                    <p>
                      You agree to assume all risks associated with your participation and release the trainer from any liability for injuries or accidents that may occur during training sessions.
                    </p>
                    <p className="font-medium">
                      You confirm that you are physically capable of participating in the training program and have consulted with a healthcare provider if you have any medical concerns.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/50">
                  <Checkbox
                    id="disclosure"
                    checked={healthDisclosureAccepted}
                    onCheckedChange={(checked) => setHealthDisclosureAccepted(checked === true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="disclosure"
                      className="text-sm font-medium leading-relaxed cursor-pointer"
                    >
                      I have read and understand the liability waiver. I accept full responsibility for any injuries or accidents that may occur during training sessions and release the trainer from all liability.
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="healthInfo">
                    Health Information <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    id="healthInfo"
                    placeholder="Please share any health issues, disabilities, medical conditions, injuries, or other relevant information that the trainer should be aware of..."
                    value={healthInformation}
                    onChange={(e) => setHealthInformation(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This information helps the trainer provide safer and more effective training tailored to your needs.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleBackToBooking}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={!healthDisclosureAccepted || createBooking.isPending}
              >
                {createBooking.isPending ? 'Creating Booking...' : 'Continue to Payment'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Book Your Training Session</h1>
          <p className="text-muted-foreground">Select your program, location, and preferred time</p>
        </div>

        <div className="space-y-8">
          {/* Program Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Program</CardTitle>
              <CardDescription>Select the workout program that fits your goals</CardDescription>
            </CardHeader>
            <CardContent>
              {programs.length === 0 ? (
                <p className="text-muted-foreground">No programs available yet. Please check back later.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {programs.map((program) => (
                    <Card
                      key={program.id}
                      className={`cursor-pointer transition-all ${
                        selectedProgram === program.id
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedProgram(program.id)}
                    >
                      <CardContent className="p-4">
                        {program.image && (
                          <div className="aspect-video relative rounded-lg overflow-hidden mb-3">
                            <img
                              src={program.image.getDirectURL()}
                              alt={program.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold mb-2">{program.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gym Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Location</CardTitle>
              <CardDescription>Choose your preferred training location</CardDescription>
            </CardHeader>
            <CardContent>
              {gyms.length === 0 ? (
                <p className="text-muted-foreground">No gyms available yet. Please check back later.</p>
              ) : (
                <div className="space-y-3">
                  {gyms.map((gym) => (
                    <Card
                      key={gym.id}
                      className={`cursor-pointer transition-all ${
                        selectedGym === gym.id
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedGym(gym.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1">{gym.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">{gym.address}</p>
                            {gym.details && <p className="text-xs text-muted-foreground">{gym.details}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {selectedGymData && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedGymData.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedGymData.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Date & Time</CardTitle>
              <CardDescription>Select your preferred training schedule (08:00 - 21:00, 24-hour format)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Calendar Section */}
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="flex justify-center lg:justify-start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setSelectedTime('');
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md border w-full max-w-md"
                    />
                  </div>
                </div>

                {/* Time Slots Section */}
                <div className="space-y-2">
                  <Label>Available Time Slots</Label>
                  {!selectedDate ? (
                    <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground border rounded-md">
                      <div>
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Please select a date first</p>
                      </div>
                    </div>
                  ) : timeSlotsLoading ? (
                    <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground border rounded-md">
                      Loading available times...
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="flex items-center justify-center h-[350px] text-center text-muted-foreground border rounded-md">
                      No time slots available for this date
                    </div>
                  ) : (
                    <ScrollArea className="h-[350px] w-full rounded-md border p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot) => {
                          const isDisabled = slot.isBooked || slot.isUnavailable;
                          return (
                            <Button
                              key={slot.time}
                              type="button"
                              variant={selectedTime === slot.time ? 'default' : 'outline'}
                              disabled={isDisabled}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`relative h-auto py-3 ${
                                isDisabled
                                  ? 'opacity-50 cursor-not-allowed'
                                  : selectedTime === slot.time
                                    ? ''
                                    : 'hover:border-primary'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-1 w-full">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-semibold">{slot.time}</span>
                                </div>
                                {slot.isUnavailable ? (
                                  <div className="flex items-center gap-1 text-xs">
                                    <XCircle className="h-3 w-3" />
                                    <span>Unavailable</span>
                                  </div>
                                ) : slot.isBooked ? (
                                  <div className="flex items-center gap-1 text-xs">
                                    <XCircle className="h-3 w-3" />
                                    <span>Booked</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-3 w-3" />
                                    <span>Available</span>
                                  </div>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}
                  {selectedDate && timeSlots.length > 0 && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-destructive" />
                        <span>Booked/Unavailable</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedDate && selectedTime && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Booking:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {format(selectedDate, 'PPP')}
                    </Badge>
                    <Badge variant="outline" className="font-normal">
                      <Clock className="h-3 w-3 mr-1" />
                      {selectedTime}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={handleContinueToDisclosure}
            disabled={!selectedProgram || !selectedGym || !selectedDate || !selectedTime}
          >
            Continue to Health Disclosure
          </Button>
        </div>
      </div>
    </div>
  );
}
