import { Outlet } from '@tanstack/react-router';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import ProfileSetupModal from './ProfileSetupModal';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <ProfileSetupModal />
    </div>
  );
}
