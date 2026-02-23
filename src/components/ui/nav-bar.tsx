'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User } from 'next-auth';

function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="container mx-auto">
        <div 
          className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 rounded-2xl"
        >
          <Link href="/" className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white hover:text-indigo-200 transition-colors drop-shadow-lg">
            True Feedback
          </Link>
          {session ? (
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <span className="text-sm sm:text-base text-white/90 font-medium">
                Welcome, {user?.username || user?.email}
              </span>
              <Button
                onClick={() => signOut()}
                className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 font-semibold font-heading rounded-full px-6 py-2 border-0"
                variant="outline"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/sign-in">
                <Button
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-200 font-semibold font-heading rounded-full px-6 py-2 border-0"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  className="bg-white/30 hover:bg-white/40 text-white backdrop-blur-sm transition-all duration-200 font-semibold font-heading rounded-full px-6 py-2 border-0"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;