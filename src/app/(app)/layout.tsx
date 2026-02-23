'use client';

import Navbar from '@/components/ui/nav-bar';
import { usePathname } from 'next/navigation';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboard && <Navbar />}
      {children}
    </div>
  );
}