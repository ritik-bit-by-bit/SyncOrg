'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  BarChart3,
  Link as LinkIcon,
  HelpCircle,
  Vote,
  Settings,
  Shield,
  Zap,
  FileText,
  Home,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  // Handle hash navigation for messages section
  useEffect(() => {
    setMounted(true);
    setCurrentHash(window.location.hash);
    
    if (window.location.hash === '#messages') {
      setTimeout(() => {
        const messagesElement = document.getElementById('messages');
        if (messagesElement) {
          messagesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [pathname]);

  // Update hash when it changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
    },
    {
      title: 'Analytics',
      url: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      title: 'Link Management',
      url: '/dashboard/links',
      icon: LinkIcon,
    },
    {
      title: 'Q&A Mode',
      url: '/dashboard/qa',
      icon: HelpCircle,
    },
    {
      title: 'Polls',
      url: '/dashboard/polls',
      icon: Vote,
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings,
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isActive = (url: string, hash?: string) => {
    // During SSR or before mount, only check pathname to avoid hydration mismatch
    if (!mounted) {
      if (hash) {
        // For hash routes, only check pathname during SSR
        return pathname === url;
      }
      // For exact match (dashboard home)
      if (url === '/dashboard') {
        return pathname === '/dashboard' || pathname === '/dashboard/';
      }
      // For other routes, check if pathname exactly matches or starts with the url
      return pathname === url || pathname.startsWith(url + '/');
    }
    
    // After mount, we can safely check hash
    if (hash) {
      return pathname === url && currentHash === hash;
    }
    
    // For exact match (dashboard home)
    if (url === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }
    // For other routes, check if pathname exactly matches or starts with the url
    return pathname === url || pathname.startsWith(url + '/');
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <SidebarProvider>
        <Sidebar
          variant="inset"
          collapsible="icon"
          className="border-r border-gray-200 bg-white"
        >
        <SidebarHeader className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold text-gray-900">True Feedback</span>
                <span className="text-xs text-gray-500">Dashboard</span>
              </div>
            </div>
        </SidebarHeader>
        
        <SidebarContent className="bg-white">
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
              Quick Access
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url, item.hash)}
                      tooltip={item.title}
                      className="text-gray-700 hover:bg-gray-100 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:font-medium"
                    >
                      <Link href={item.url + (item.hash || '')}>
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium uppercase tracking-wider group-data-[collapsible=icon]:hidden px-2">
              Coming Soon
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    disabled
                    tooltip="Moderation"
                    className="text-gray-400 hover:bg-gray-50 cursor-not-allowed"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Moderation</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    disabled
                    tooltip="AI Replies (Available in Messages)"
                    className="text-gray-400 hover:bg-gray-50 cursor-not-allowed"
                  >
                    <Zap className="h-4 w-4" />
                    <span>AI Replies</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    disabled
                    tooltip="Export (Available in Messages)"
                    className="text-gray-400 hover:bg-gray-50 cursor-not-allowed"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Export</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-gray-200 p-4 bg-white">
          {session?.user && (
            <div className="mb-3 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium text-gray-900">
                {session.user.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{session.user.email}</p>
            </div>
          )}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                tooltip="Logout"
                className="text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />

      <SidebarInset className="relative flex-1 min-h-screen overflow-hidden bg-gray-50">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 px-6 bg-white shadow-sm">
          <SidebarTrigger className="text-gray-700 hover:bg-gray-100" />
          <div className="flex items-center gap-2 ml-auto">
            {session?.user && (
              <span className="text-sm font-medium text-gray-700">
                {session.user.name || 'User'}
              </span>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto relative bg-gray-50">
          {children}
        </div>
      </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

