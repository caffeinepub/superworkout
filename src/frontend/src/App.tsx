import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import DonationPage from './pages/DonationPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import AboutMePage from './pages/AboutMePage';
import FitnessMetricsPage from './pages/FitnessMetricsPage';
import LifestyleSurveyPage from './pages/LifestyleSurveyPage';
import BodyAnalysisPage from './pages/BodyAnalysisPage';
import Layout from './components/Layout';
import { Toaster } from './components/ui/sonner';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/booking',
  component: BookingPage,
});

const donationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/donation/$bookingId',
  component: DonationPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const aboutMeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutMePage,
});

const fitnessMetricsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/fitness-metrics',
  component: FitnessMetricsPage,
});

const lifestyleSurveyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lifestyle-survey',
  component: LifestyleSurveyPage,
});

const bodyAnalysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/body-analysis',
  component: BodyAnalysisPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  bookingRoute,
  donationRoute,
  adminRoute,
  profileRoute,
  aboutMeRoute,
  fitnessMetricsRoute,
  lifestyleSurveyRoute,
  bodyAnalysisRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
