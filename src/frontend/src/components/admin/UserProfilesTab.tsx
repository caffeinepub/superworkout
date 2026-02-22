import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import {
  useGetAllUserProfiles,
  useGetBookings,
  useGetWorkoutPrograms,
  useGetGyms,
  useGetExtendedProfile,
  useSaveExtendedProfile,
} from '../../hooks/useQueries';
import { UserProfile, ExtendedProfile } from '../../backend';
import { Search, User, Lock, Globe, Calendar, MapPin, Dumbbell, UserPlus, Loader2 } from 'lucide-react';
import { Principal } from '@icp-sdk/core/principal';
import { toast } from 'sonner';

interface ExtendedProfileWithPrincipal {
  principal: Principal;
  profile: UserProfile;
}

export default function UserProfilesTab() {
  const { data: profiles = [], isLoading } = useGetAllUserProfiles();
  const { data: bookings = [] } = useGetBookings();
  const { data: programs = [] } = useGetWorkoutPrograms();
  const { data: gyms = [] } = useGetGyms();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [extendedProfileModal, setExtendedProfileModal] = useState<ExtendedProfileWithPrincipal | null>(null);

  const filteredProfiles = profiles.filter((profile) =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading user profiles...</p>
        </CardContent>
      </Card>
    );
  }

  const getProfileBookings = (profile: UserProfile) => {
    return bookings.filter((b) => profile.recentTrainings.includes(b.id));
  };

  // Helper to get Principal from profile (we'll need to track this)
  // Since we don't have direct access to Principal from UserProfile, we'll need to pass it through
  const handleExtendProfile = (profile: UserProfile, index: number) => {
    // We need to derive the principal somehow - in a real scenario, we'd need to store this mapping
    // For now, we'll use the booking data to find the user's principal
    const userBooking = bookings.find((b) => profile.recentTrainings.includes(b.id));
    if (userBooking) {
      setExtendedProfileModal({
        principal: userBooking.user,
        profile,
      });
    } else {
      toast.error('Cannot determine user identity. User must have at least one booking.');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Profiles</CardTitle>
          <CardDescription>View and manage all user profiles and their training history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredProfiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No users found matching your search' : 'No user profiles yet'}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredProfiles.map((profile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar?.getDirectURL()} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{profile.name}</h3>
                      {profile.isPublic ? (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {profile.recentTrainings.length} training session{profile.recentTrainings.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedProfile(profile)}>
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleExtendProfile(profile, index)}
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Extend Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle>User Profile Details</DialogTitle>
                <DialogDescription>Complete profile information and training history</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedProfile.avatar?.getDirectURL()} alt={selectedProfile.name} />
                    <AvatarFallback className="text-2xl">
                      {selectedProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold">{selectedProfile.name}</h3>
                        {selectedProfile.isPublic ? (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Public
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Private
                          </Badge>
                        )}
                      </div>
                    </div>

                    {selectedProfile.aboutMe && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">About</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {selectedProfile.aboutMe}
                        </p>
                      </div>
                    )}

                    {selectedProfile.contactInfo && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Contact Information</h4>
                        <p className="text-sm text-muted-foreground">{selectedProfile.contactInfo}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Training History</h4>
                  {getProfileBookings(selectedProfile).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8 border rounded-lg">
                      No training sessions recorded
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {getProfileBookings(selectedProfile).map((booking) => {
                        const program = programs.find((p) => p.id === booking.programId);
                        const gym = gyms.find((g) => g.id === booking.gymId);
                        return (
                          <div key={booking.id} className="flex items-start gap-4 p-4 rounded-lg border">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Dumbbell className="w-4 h-4 text-primary" />
                                <h5 className="font-semibold">{program?.title || 'Unknown Program'}</h5>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {booking.date} at {booking.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {gym?.name || 'Unknown Gym'}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Extended Profile Modal */}
      {extendedProfileModal && (
        <ExtendedProfileModal
          userPrincipal={extendedProfileModal.principal}
          userName={extendedProfileModal.profile.name}
          onClose={() => setExtendedProfileModal(null)}
        />
      )}
    </>
  );
}

interface ExtendedProfileModalProps {
  userPrincipal: Principal;
  userName: string;
  onClose: () => void;
}

function ExtendedProfileModal({ userPrincipal, userName, onClose }: ExtendedProfileModalProps) {
  const { data: existingProfile, isLoading: loadingProfile } = useGetExtendedProfile(userPrincipal);
  const saveExtendedProfile = useSaveExtendedProfile();

  const [formData, setFormData] = useState<ExtendedProfile>({
    gender: '',
    age: BigInt(0),
    weight: BigInt(0),
    height: BigInt(0),
    bmi: 0,
    bodyFatPercentage: 0,
    pushUps: BigInt(0),
    pullUps: BigInt(0),
    squats: BigInt(0),
    lSit: BigInt(0),
    details: '',
  });

  // Load existing profile data when available
  useState(() => {
    if (existingProfile) {
      setFormData(existingProfile);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveExtendedProfile.mutateAsync({
        user: userPrincipal,
        profile: formData,
      });
      toast.success('Extended profile saved successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save extended profile');
    }
  };

  const handleNumberChange = (field: keyof ExtendedProfile, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    if (field === 'bmi' || field === 'bodyFatPercentage') {
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: BigInt(Math.max(0, Math.floor(numValue))) }));
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Extended Profile - {userName}</DialogTitle>
          <DialogDescription>
            Enter detailed fitness metrics and performance data for this user
          </DialogDescription>
        </DialogHeader>

        {loadingProfile ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Entrance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    placeholder="e.g., Male, Female"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    value={formData.age.toString()}
                    onChange={(e) => handleNumberChange('age', e.target.value)}
                    placeholder="Years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    value={formData.weight.toString()}
                    onChange={(e) => handleNumberChange('weight', e.target.value)}
                    placeholder="Kilograms"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="0"
                    value={formData.height.toString()}
                    onChange={(e) => handleNumberChange('height', e.target.value)}
                    placeholder="Centimeters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi">BMI</Label>
                  <Input
                    id="bmi"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.bmi}
                    onChange={(e) => handleNumberChange('bmi', e.target.value)}
                    placeholder="Body Mass Index"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat %</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.bodyFatPercentage}
                    onChange={(e) => handleNumberChange('bodyFatPercentage', e.target.value)}
                    placeholder="Percentage"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1st Training Performance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pushUps">Push-ups</Label>
                  <Input
                    id="pushUps"
                    type="number"
                    min="0"
                    value={formData.pushUps.toString()}
                    onChange={(e) => handleNumberChange('pushUps', e.target.value)}
                    placeholder="Count"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pullUps">Pull-ups</Label>
                  <Input
                    id="pullUps"
                    type="number"
                    min="0"
                    value={formData.pullUps.toString()}
                    onChange={(e) => handleNumberChange('pullUps', e.target.value)}
                    placeholder="Count"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squats">Squats</Label>
                  <Input
                    id="squats"
                    type="number"
                    min="0"
                    value={formData.squats.toString()}
                    onChange={(e) => handleNumberChange('squats', e.target.value)}
                    placeholder="Count"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lSit">L-sit (seconds)</Label>
                  <Input
                    id="lSit"
                    type="number"
                    min="0"
                    value={formData.lSit.toString()}
                    onChange={(e) => handleNumberChange('lSit', e.target.value)}
                    placeholder="Seconds"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Additional Details</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder="Any additional notes or observations..."
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveExtendedProfile.isPending}>
                {saveExtendedProfile.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Extended Profile'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
