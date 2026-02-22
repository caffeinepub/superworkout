import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface DonationOption {
    id: string;
    method: string;
    details: string;
}
export interface TimeSlot {
    isUnavailable: boolean;
    date: string;
    time: string;
    isBooked: boolean;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface LifestyleSurveyResult {
    id: string;
    recommendations: Array<string>;
    summaryMessage: string;
    score: bigint;
    category: string;
}
export interface BodyAnalysisSummary {
    recommendations: string;
    muscleMassEstimate: number;
    score: bigint;
    bodyType: BodyType;
    bodyFatPercentage: bigint;
}
export interface AboutMeContent {
    content: string;
}
export interface ExtendedProfile {
    age: bigint;
    bmi: number;
    weight: bigint;
    height: bigint;
    lSit: bigint;
    squats: bigint;
    pullUps: bigint;
    pushUps: bigint;
    gender: string;
    details: string;
    bodyFatPercentage: number;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface GalleryImage {
    id: string;
    description: string;
    image: ExternalBlob;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Gym {
    id: string;
    name: string;
    address: string;
    details: string;
}
export interface Booking {
    id: string;
    healthInformation: string;
    date: string;
    time: string;
    user: Principal;
    isPaid: boolean;
    gymId: string;
    healthDisclosureAccepted: boolean;
    programId: string;
}
export interface WorkoutProgram {
    id: string;
    title: string;
    description: string;
    image?: ExternalBlob;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface UserProfile {
    contactInfo: string;
    aboutMe: string;
    name: string;
    recentTrainings: Array<string>;
    isPublic: boolean;
    avatar?: ExternalBlob;
}
export enum BodyType {
    endomorph = "endomorph",
    mesomorph = "mesomorph",
    ectomorph = "ectomorph"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDonationOption(option: DonationOption): Promise<void>;
    addGalleryImage(image: GalleryImage): Promise<void>;
    addGym(gym: Gym): Promise<void>;
    addWorkoutProgram(program: WorkoutProgram): Promise<void>;
    analyzeBodyShape(fileId: string, analysis: BodyAnalysisSummary): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBooking(booking: Booking): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteAnalysisResult(fileId: string): Promise<void>;
    deleteBooking(bookingId: string): Promise<void>;
    deleteDonationOption(optionId: string): Promise<void>;
    deleteGalleryImage(imageId: string): Promise<void>;
    deleteGym(gymId: string): Promise<void>;
    deleteLifestyleSurveyResult(resultId: string): Promise<void>;
    deleteWorkoutProgram(programId: string): Promise<void>;
    getAboutMeContent(): Promise<AboutMeContent | null>;
    getAllAnalysisResults(): Promise<Array<BodyAnalysisSummary>>;
    getAllLifestyleSurveyResults(): Promise<Array<LifestyleSurveyResult>>;
    getAllUserProfiles(): Promise<Array<UserProfile>>;
    getAnalysisResult(fileId: string): Promise<BodyAnalysisSummary | null>;
    getAvailableTimeSlots(date: string): Promise<Array<TimeSlot>>;
    getBookings(): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoachProfilePicture(): Promise<ExternalBlob | null>;
    getDonationOptions(): Promise<Array<DonationOption>>;
    getExtendedProfile(user: Principal): Promise<ExtendedProfile | null>;
    getGalleryImages(): Promise<Array<GalleryImage>>;
    getGyms(): Promise<Array<Gym>>;
    getLifestyleSurveyResult(resultId: string): Promise<LifestyleSurveyResult | null>;
    getLikeCount(): Promise<bigint>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkoutPrograms(): Promise<Array<WorkoutProgram>>;
    hasCallerLiked(): Promise<boolean>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    likeWebsite(): Promise<void>;
    markBookingAsPaid(bookingId: string): Promise<void>;
    markBookingAsUnpaid(bookingId: string): Promise<void>;
    markTimeSlotUnavailable(date: string, time: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveExtendedProfile(user: Principal, profile: ExtendedProfile): Promise<void>;
    saveLifestyleSurveyResult(result: LifestyleSurveyResult): Promise<void>;
    setAboutMeContent(content: string): Promise<void>;
    setCoachProfilePicture(image: ExternalBlob): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    unmarkTimeSlotUnavailable(date: string, time: string): Promise<void>;
    updateDonationOption(option: DonationOption): Promise<void>;
    updateGym(gym: Gym): Promise<void>;
    updateWorkoutProgram(program: WorkoutProgram): Promise<void>;
}
