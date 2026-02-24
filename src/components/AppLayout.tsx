import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Footer from './Footer';
import AuthGuard from './AuthGuard';

const AppLayout = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthGuard>
  );
};

export default AppLayout;
