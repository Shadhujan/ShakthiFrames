import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/public/ChatbotWidget';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-white">
        <Outlet />
      </main>
      <Footer />
       <ChatbotWidget />
    </div>
  );
}