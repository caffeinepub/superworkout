import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Nat "mo:core/Nat";



actor {
  // Authorization
  var accessControlState = AccessControl.initState();

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public type UserProfile = {
    name : Text;
    avatar : ?Storage.ExternalBlob;
    aboutMe : Text;
    contactInfo : Text;
    isPublic : Bool;
    recentTrainings : [Text];
  };

  var userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    let profile = userProfiles.get(user);
    switch (profile) {
      case null { null };
      case (?p) {
        if (p.isPublic) {
          ?p;
        } else {
          if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
            Runtime.trap("Unauthorized: Only authenticated users can view private profiles");
          };
          if (caller == user or AccessControl.isAdmin(accessControlState, caller)) {
            ?p;
          } else {
            Runtime.trap("Unauthorized: This profile is private");
          };
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllUserProfiles() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    userProfiles.values().toArray();
  };

  public type ExtendedProfile = {
    gender : Text;
    age : Nat;
    weight : Nat; // stored as integer grams for simplicity (use Nat to avoid negative values)
    height : Nat; // stored as integer centimeters for simplicity
    bmi : Float;
    bodyFatPercentage : Float;
    pushUps : Nat;
    pullUps : Nat;
    squats : Nat;
    lSit : Nat;
    details : Text;
  };

  var extendedProfiles = Map.empty<Principal, ExtendedProfile>();

  public shared ({ caller }) func saveExtendedProfile(user : Principal, profile : ExtendedProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can save extended profiles");
    };
    extendedProfiles.add(user, profile);
  };

  public query ({ caller }) func getExtendedProfile(user : Principal) : async ?ExtendedProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view extended profiles");
    };
    extendedProfiles.get(user);
  };

  // Storage
  let storage = Storage.new();
  include MixinStorage(storage);

  // Data Types
  public type WorkoutProgram = {
    id : Text;
    title : Text;
    description : Text;
    image : ?Storage.ExternalBlob;
  };

  public type Gym = {
    id : Text;
    name : Text;
    address : Text;
    details : Text;
  };

  public type Booking = {
    id : Text;
    user : Principal;
    programId : Text;
    gymId : Text;
    date : Text;
    time : Text;
    isPaid : Bool;
    healthDisclosureAccepted : Bool;
    healthInformation : Text;
  };

  public type DonationOption = {
    id : Text;
    method : Text;
    details : Text;
  };

  public type GalleryImage = {
    id : Text;
    image : Storage.ExternalBlob;
    description : Text;
  };

  public type TimeSlot = {
    date : Text;
    time : Text;
    isBooked : Bool;
    isUnavailable : Bool;
  };

  public type AboutMeContent = {
    content : Text;
  };

  public type CoachProfile = {
    profilePicture : ?Storage.ExternalBlob;
  };

  public type LifestyleSurveyResult = {
    id : Text;
    score : Nat;
    category : Text;
    recommendations : [Text];
    summaryMessage : Text;
  };

  public type BodyType = {
    #ectomorph;
    #mesomorph;
    #endomorph;
  };

  public type BodyAnalysisSummary = {
    bodyType : BodyType;
    recommendations : Text;
    score : Nat;
    bodyFatPercentage : Nat;
    muscleMassEstimate : Float;
  };

  public type BodyAnalysisRecord = {
    fileId : Text;
    owner : Principal;
    analysis : BodyAnalysisSummary;
  };

  var workoutPrograms = Map.empty<Text, WorkoutProgram>();
  var gyms = Map.empty<Text, Gym>();
  var bookings = Map.empty<Text, Booking>();
  var donationOptions = Map.empty<Text, DonationOption>();
  var galleryImages = Map.empty<Text, GalleryImage>();
  var unavailableSlots = Map.empty<Text, Bool>();
  var likeCount : Nat = 365;
  var userLikes = Map.empty<Principal, Bool>();
  var aboutMeContent : ?AboutMeContent = null;
  var coachProfile : CoachProfile = { profilePicture = null };
  var lifestyleSurveyResults = Map.empty<Text, LifestyleSurveyResult>();
  var bodyTypeAnalysis = Map.empty<Text, BodyAnalysisRecord>();

  // Body Shape Analysis
  public shared ({ caller }) func analyzeBodyShape(fileId : Text, analysis : BodyAnalysisSummary) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Body shape analysis is only possible for authenticated users");
    };
    let record : BodyAnalysisRecord = {
      fileId = fileId;
      owner = caller;
      analysis = analysis;
    };
    bodyTypeAnalysis.add(fileId, record);
  };

  public query ({ caller }) func getAnalysisResult(fileId : Text) : async ?BodyAnalysisSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view analysis results");
    };
    let record = bodyTypeAnalysis.get(fileId);
    switch (record) {
      case null { null };
      case (?r) {
        if (caller == r.owner or AccessControl.isAdmin(accessControlState, caller)) {
          ?r.analysis;
        } else {
          Runtime.trap("Unauthorized: You can only view your own analysis results");
        };
      };
    };
  };

  public query ({ caller }) func getAllAnalysisResults() : async [BodyAnalysisSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all analysis results");
    };
    let records = bodyTypeAnalysis.values().toArray();
    records.map<BodyAnalysisRecord, BodyAnalysisSummary>(func(r) { r.analysis });
  };

  public shared ({ caller }) func deleteAnalysisResult(fileId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete analysis results");
    };
    bodyTypeAnalysis.remove(fileId);
  };

  // Workout Program Management
  public shared ({ caller }) func addWorkoutProgram(program : WorkoutProgram) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add workout programs");
    };
    workoutPrograms.add(program.id, program);
  };

  public shared ({ caller }) func updateWorkoutProgram(program : WorkoutProgram) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update workout programs");
    };
    workoutPrograms.add(program.id, program);
  };

  public shared ({ caller }) func deleteWorkoutProgram(programId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete workout programs");
    };
    workoutPrograms.remove(programId);
  };

  public query func getWorkoutPrograms() : async [WorkoutProgram] {
    workoutPrograms.values().toArray();
  };

  // Gym Management
  public shared ({ caller }) func addGym(gym : Gym) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add gyms");
    };
    gyms.add(gym.id, gym);
  };

  public shared ({ caller }) func updateGym(gym : Gym) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update gyms");
    };
    gyms.add(gym.id, gym);
  };

  public shared ({ caller }) func deleteGym(gymId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete gyms");
    };
    gyms.remove(gymId);
  };

  public query func getGyms() : async [Gym] {
    gyms.values().toArray();
  };

  // Booking System
  public shared ({ caller }) func createBooking(booking : Booking) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };
    if (booking.user != caller) {
      Runtime.trap("Unauthorized: Cannot create bookings for other users");
    };
    let allBookings = bookings.values().toArray();
    let isSlotBooked = allBookings.find(func(b) { b.date == booking.date and b.time == booking.time });
    let isSlotUnavailable = switch (unavailableSlots.get(booking.date # booking.time)) {
      case (null) { false };
      case (?bool) { bool };
    };
    switch (isSlotBooked) {
      case (?_) {
        Runtime.trap("Time slot already booked");
      };
      case null {
        if (isSlotUnavailable) {
          Runtime.trap("Time slot is unavailable");
        };
        if (not booking.healthDisclosureAccepted) {
          Runtime.trap("Health disclosure must be accepted");
        };
        bookings.add(booking.id, booking);
        let userProfile = userProfiles.get(caller);
        switch (userProfile) {
          case null {};
          case (?profile) {
            let updatedTrainings = profile.recentTrainings.concat([booking.id]);
            let updatedProfile = {
              profile with
              recentTrainings = updatedTrainings;
            };
            userProfiles.add(caller, updatedProfile);
          };
        };
      };
    };
  };

  public query ({ caller }) func getBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bookings");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return bookings.values().toArray();
    };
    let allBookings = bookings.values().toArray();
    allBookings.filter(func(booking) { booking.user == caller });
  };

  public shared ({ caller }) func deleteBooking(bookingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete bookings");
    };
    bookings.remove(bookingId);
  };

  public query ({ caller }) func getAvailableTimeSlots(date : Text) : async [TimeSlot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view available time slots");
    };
    let allBookings = bookings.values().toArray();
    Array.tabulate<TimeSlot>(
      14,
      func(i) {
        let hour = if (i + 8 < 10) { "0" # debug_show (i + 8) } else { debug_show (i + 8) };
        let time = hour # ":00";
        let isBooked = allBookings.find(func(b) { b.date == date and b.time == time }) != null;
        let isUnavailable = switch (unavailableSlots.get(date # time)) {
          case (null) { false };
          case (?bool) { bool };
        };
        {
          date;
          time;
          isBooked;
          isUnavailable;
        };
      },
    );
  };

  public shared ({ caller }) func markTimeSlotUnavailable(date : Text, time : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark time slots as unavailable");
    };
    unavailableSlots.add(date # time, true);
  };

  public shared ({ caller }) func unmarkTimeSlotUnavailable(date : Text, time : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can unmark time slots as unavailable");
    };
    unavailableSlots.remove(date # time);
  };

  public shared ({ caller }) func markBookingAsPaid(bookingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark bookings as paid");
    };
    let booking = bookings.get(bookingId);
    switch (booking) {
      case null {
        Runtime.trap("Booking not found");
      };
      case (?b) {
        let updatedBooking = { b with isPaid = true };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  public shared ({ caller }) func markBookingAsUnpaid(bookingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark bookings as unpaid");
    };
    let booking = bookings.get(bookingId);
    switch (booking) {
      case null {
        Runtime.trap("Booking not found");
      };
      case (?b) {
        let updatedBooking = { b with isPaid = false };
        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  // Donation System
  public shared ({ caller }) func addDonationOption(option : DonationOption) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add donation options");
    };
    donationOptions.add(option.id, option);
  };

  public shared ({ caller }) func updateDonationOption(option : DonationOption) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update donation options");
    };
    donationOptions.add(option.id, option);
  };

  public shared ({ caller }) func deleteDonationOption(optionId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete donation options");
    };
    donationOptions.remove(optionId);
  };

  public query func getDonationOptions() : async [DonationOption] {
    donationOptions.values().toArray();
  };

  // Gallery Management
  public shared ({ caller }) func addGalleryImage(image : GalleryImage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add gallery images");
    };
    galleryImages.add(image.id, image);
  };

  public shared ({ caller }) func deleteGalleryImage(imageId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete gallery images");
    };
    galleryImages.remove(imageId);
  };

  public query func getGalleryImages() : async [GalleryImage] {
    galleryImages.values().toArray();
  };

  // Like Functionality
  public shared ({ caller }) func likeWebsite() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like the website");
    };
    let hasLiked = userLikes.get(caller);
    switch (hasLiked) {
      case (?true) {
        Runtime.trap("You have already liked the website");
      };
      case _ {
        likeCount += 1;
        userLikes.add(caller, true);
      };
    };
  };

  public query ({ caller }) func hasCallerLiked() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      false;
    } else {
      userLikes.get(caller) == ?true;
    };
  };

  public query func getLikeCount() : async Nat {
    likeCount;
  };

  // Stripe Integration
  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  private func getStripeConfiguration() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case null Runtime.trap("Stripe needs to be first configured");
      case (?value) value;
    };
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfiguration(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfiguration(), caller, items, successUrl, cancelUrl, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // About Me Page Management
  public shared ({ caller }) func setAboutMeContent(content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set About Me content");
    };
    aboutMeContent := ?{ content };
  };

  public query func getAboutMeContent() : async ?AboutMeContent {
    aboutMeContent;
  };

  // Coach Profile Picture Management
  public shared ({ caller }) func setCoachProfilePicture(image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set coach profile picture");
    };
    coachProfile := { profilePicture = ?image };
  };

  public query func getCoachProfilePicture() : async ?Storage.ExternalBlob {
    coachProfile.profilePicture;
  };

  // Lifestyle Survey Results Management
  public shared ({ caller }) func saveLifestyleSurveyResult(result : LifestyleSurveyResult) : async () {
    lifestyleSurveyResults.add(result.id, result);
  };

  public query func getLifestyleSurveyResult(resultId : Text) : async ?LifestyleSurveyResult {
    lifestyleSurveyResults.get(resultId);
  };

  public query ({ caller }) func getAllLifestyleSurveyResults() : async [LifestyleSurveyResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all survey results");
    };
    lifestyleSurveyResults.values().toArray();
  };

  public shared ({ caller }) func deleteLifestyleSurveyResult(resultId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete survey results");
    };
    lifestyleSurveyResults.remove(resultId);
  };
};
