import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  WorkoutProgram,
  Gym,
  Booking,
  DonationOption,
  GalleryImage,
  UserProfile,
  TimeSlot,
  AboutMeContent,
  ExternalBlob,
  ExtendedProfile,
  LifestyleSurveyResult,
  BodyAnalysisSummary,
} from '../backend';
import { Principal } from '@icp-sdk/core/principal';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    },
  });
}

export function useGetAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserProfile(userPrincipal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      const principal = Principal.fromText(userPrincipal);
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: 'always',
  });
}

// Extended Profile (Admin Only)
export function useGetExtendedProfile(userPrincipal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ExtendedProfile | null>({
    queryKey: ['extendedProfile', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getExtendedProfile(userPrincipal);
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useSaveExtendedProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, profile }: { user: Principal; profile: ExtendedProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveExtendedProfile(user, profile);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['extendedProfile', variables.user.toString()] });
    },
  });
}

// Body Analysis
export function useAnalyzeBodyShape() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, analysis }: { fileId: string; analysis: BodyAnalysisSummary }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.analyzeBodyShape(fileId, analysis);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodyAnalysis'] });
    },
  });
}

export function useGetAnalysisResult(fileId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<BodyAnalysisSummary | null>({
    queryKey: ['bodyAnalysis', fileId],
    queryFn: async () => {
      if (!actor || !fileId) return null;
      return actor.getAnalysisResult(fileId);
    },
    enabled: !!actor && !isFetching && !!fileId,
  });
}

// Workout Programs
export function useGetWorkoutPrograms() {
  const { actor, isFetching } = useActor();

  return useQuery<WorkoutProgram[]>({
    queryKey: ['workoutPrograms'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWorkoutPrograms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddWorkoutProgram() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: WorkoutProgram) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWorkoutProgram(program);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPrograms'] });
    },
  });
}

export function useUpdateWorkoutProgram() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (program: WorkoutProgram) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWorkoutProgram(program);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPrograms'] });
    },
  });
}

export function useDeleteWorkoutProgram() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWorkoutProgram(programId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutPrograms'] });
    },
  });
}

// Gyms
export function useGetGyms() {
  const { actor, isFetching } = useActor();

  return useQuery<Gym[]>({
    queryKey: ['gyms'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGyms();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGym() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gym: Gym) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGym(gym);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });
}

export function useUpdateGym() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gym: Gym) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateGym(gym);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });
}

export function useDeleteGym() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gymId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGym(gymId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });
}

// Bookings
export function useGetBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: Booking) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(booking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableTimeSlots'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useDeleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableTimeSlots'] });
    },
  });
}

export function useGetAvailableTimeSlots(date: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<TimeSlot[]>({
    queryKey: ['availableTimeSlots', date],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.getAvailableTimeSlots(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useMarkBookingAsPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markBookingAsPaid(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMarkBookingAsUnpaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markBookingAsUnpaid(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMarkTimeSlotUnavailable() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, time }: { date: string; time: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markTimeSlotUnavailable(date, time);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTimeSlots'] });
    },
  });
}

export function useUnmarkTimeSlotUnavailable() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, time }: { date: string; time: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unmarkTimeSlotUnavailable(date, time);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableTimeSlots'] });
    },
  });
}

// Donation Options
export function useGetDonationOptions() {
  const { actor, isFetching } = useActor();

  return useQuery<DonationOption[]>({
    queryKey: ['donationOptions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDonationOptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddDonationOption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: DonationOption) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDonationOption(option);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationOptions'] });
    },
  });
}

export function useUpdateDonationOption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: DonationOption) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDonationOption(option);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationOptions'] });
    },
  });
}

export function useDeleteDonationOption() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (optionId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteDonationOption(optionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donationOptions'] });
    },
  });
}

// Gallery
export function useGetGalleryImages() {
  const { actor, isFetching } = useActor();

  return useQuery<GalleryImage[]>({
    queryKey: ['galleryImages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGalleryImages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: GalleryImage) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGalleryImage(image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    },
  });
}

export function useDeleteGalleryImage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteGalleryImage(imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryImages'] });
    },
  });
}

// Like System
export function useGetLikeCount() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['likeCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getLikeCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasCallerLiked() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasLiked'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasCallerLiked();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLikeWebsite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeWebsite();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likeCount'] });
      queryClient.invalidateQueries({ queryKey: ['hasLiked'] });
    },
  });
}

// About Me
export function useGetAboutMeContent() {
  const { actor, isFetching } = useActor();

  return useQuery<AboutMeContent | null>({
    queryKey: ['aboutMeContent'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAboutMeContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAboutMeContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setAboutMeContent(content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutMeContent'] });
    },
  });
}

// Coach Profile Picture
export function useGetCoachProfilePicture() {
  const { actor, isFetching } = useActor();

  return useQuery<ExternalBlob | null>({
    queryKey: ['coachProfilePicture'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCoachProfilePicture();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetCoachProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setCoachProfilePicture(image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coachProfilePicture'] });
    },
  });
}

// Lifestyle Survey Results
export function useSaveLifestyleSurveyResult() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (result: LifestyleSurveyResult) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveLifestyleSurveyResult(result);
    },
  });
}

export function useGetLifestyleSurveyResult(resultId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<LifestyleSurveyResult | null>({
    queryKey: ['lifestyleSurveyResult', resultId],
    queryFn: async () => {
      if (!actor || !resultId) return null;
      return actor.getLifestyleSurveyResult(resultId);
    },
    enabled: !!actor && !isFetching && !!resultId,
  });
}
