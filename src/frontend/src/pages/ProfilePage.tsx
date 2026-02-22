import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetBookings, useGetWorkoutPrograms, useGetGyms } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';
import { Upload, Calendar, MapPin, Dumbbell, Edit2, Save, X, DollarSign } from 'lucide-react';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: bookings = [] } = useGetBookings();
  const { data: programs = [] } = useGetWorkoutPrograms();
  const { data: gyms = [] } = useGetGyms();
  const saveProfile = useSaveCallerUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [aboutMe, setAboutMe] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [avatar, setAvatar] = useState<ExternalBlob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setAboutMe(userProfile.aboutMe);
      setContactInfo(userProfile.contactInfo);
      setIsPublic(userProfile.isPublic);
      if (userProfile.avatar) {
        setAvatarPreview(userProfile.avatar.getDirectURL());
      }
    }
  }, [userProfile]);

  if (!identity) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/' })}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container py-20">
        <p className="text-center text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Please complete your profile setup</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/' })}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });
      setAvatar(blob);
      setAvatarPreview(URL.createObjectURL(file));
      setUploadProgress(0);
    } catch (error) {
      toast.error('Failed to process image');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        aboutMe: aboutMe.trim(),
        contactInfo: contactInfo.trim(),
        isPublic,
        avatar: avatar || userProfile.avatar,
        recentTrainings: userProfile.recentTrainings,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setName(userProfile.name);
    setAboutMe(userProfile.aboutMe);
    setContactInfo(userProfile.contactInfo);
    setIsPublic(userProfile.isPublic);
    setAvatar(null);
    if (userProfile.avatar) {
      setAvatarPreview(userProfile.avatar.getDirectURL());
    } else {
      setAvatarPreview(null);
    }
    setIsEditing(false);
  };

  const recentBookings = bookings
    .filter((b) => userProfile.recentTrainings.includes(b.id))
    .slice(0, 5);

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and training history</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {isPublic ? 'Your profile is public and visible to all users' : 'Your profile is private and only visible to admins'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || undefined} alt={name} />
                  <AvatarFallback className="text-2xl">{name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="w-full">
                    <Label htmlFor="avatar-edit" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-1 text-xs text-primary hover:underline">
                        <Upload className="w-3 h-3" />
                        Change
                      </div>
                    </Label>
                    <Input
                      id="avatar-edit"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <p className="text-xs text-muted-foreground mt-1">Uploading: {uploadProgress}%</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  ) : (
                    <p className="text-lg font-medium">{userProfile.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutMe">About Me</Label>
                  {isEditing ? (
                    <Textarea
                      id="aboutMe"
                      value={aboutMe}
                      onChange={(e) => setAboutMe(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {userProfile.aboutMe || 'No information provided'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Information</Label>
                  {isEditing ? (
                    <Input
                      id="contactInfo"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Email, phone, etc."
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {userProfile.contactInfo || 'No contact information provided'}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="isPublic-edit" className="text-base">Public Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow other users to view your profile
                      </p>
                    </div>
                    <Switch id="isPublic-edit" checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveProfile.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Training Sessions</CardTitle>
            <CardDescription>Your latest bookings and completed workouts</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No training sessions yet. Book your first session to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  const program = programs.find((p) => p.id === booking.programId);
                  const gym = gyms.find((g) => g.id === booking.gymId);
                  return (
                    <div key={booking.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Dumbbell className="w-4 h-4 text-primary" />
                          <h3 className="font-semibold">{program?.title || 'Unknown Program'}</h3>
                          <Badge variant={booking.isPaid ? 'default' : 'secondary'} className="ml-auto">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {booking.isPaid ? 'Paid' : 'Not Paid'}
                          </Badge>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
