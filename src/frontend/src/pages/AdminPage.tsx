import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import WorkoutProgramsTab from '../components/admin/WorkoutProgramsTab';
import GymsTab from '../components/admin/GymsTab';
import BookingsTab from '../components/admin/BookingsTab';
import DonationOptionsTab from '../components/admin/DonationOptionsTab';
import GalleryTab from '../components/admin/GalleryTab';
import UserProfilesTab from '../components/admin/UserProfilesTab';
import AvailabilityTab from '../components/admin/AvailabilityTab';
import AboutMeTab from '../components/admin/AboutMeTab';

export default function AdminPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (!identity) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please log in to access the admin panel</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-20">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-20">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to access this page</CardDescription>
          </CardHeader>
          <CardContent>
            <button onClick={() => navigate({ to: '/' })} className="text-primary hover:underline">
              Return to Home
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your calisthenics training platform</p>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="gyms">Gyms</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="about">About Me</TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <WorkoutProgramsTab />
        </TabsContent>

        <TabsContent value="gyms">
          <GymsTab />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityTab />
        </TabsContent>

        <TabsContent value="users">
          <UserProfilesTab />
        </TabsContent>

        <TabsContent value="donations">
          <DonationOptionsTab />
        </TabsContent>

        <TabsContent value="gallery">
          <GalleryTab />
        </TabsContent>

        <TabsContent value="about">
          <AboutMeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
