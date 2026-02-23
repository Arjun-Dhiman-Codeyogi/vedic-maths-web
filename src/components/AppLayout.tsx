import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Footer from './Footer';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
