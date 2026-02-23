'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { signInSchema } from '@/Schemas/signIn';
import { signIn } from 'next-auth/react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FloatingLines from '@/components/FloatingLines';

const Page = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        callbackUrl: `${window.location.origin}/dashboard`,
        identifier: data.identifier,
        password: data.password,
      });
      console.log({"result":result,"result url":result?.url});

      if (result?.error) {
        toast({
          title: 'Sign In Failed',
          description:
            result.error === 'CredentialsSignin'
              ? 'Invalid credentials. Please try again.'
              : result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Signed in successfully',
        });
      }

      if(result?.url){
        const url = new URL(result.url, window.location.origin);
        if (url.origin === window.location.origin) {
          router.replace(result.url);
        } else {
          window.location.href = result.url;
        }
      }
    } catch (error) {
      toast({
        title: 'Sign In Failed',
        description: 'There was a problem with your login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen relative overflow-hidden">
      {/* FloatingLines Background */}
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <FloatingLines 
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={18}
          lineDistance={81}
          bendRadius={25.5}
          bendStrength={0}
          interactive={true}
          parallax={true}
        />
      </div>

      {/* Main content */}
      <div 
        className="w-full max-w-md p-10 sm:p-12 rounded-2xl shadow-2xl z-10 relative"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white leading-tight drop-shadow-lg">
            <span className="block">Welcome Back</span>
            <span className="block text-3xl sm:text-4xl">to</span>
            <span className="block text-4xl sm:text-5xl">True Feedback</span>
          </h1>
          <p className="mt-4 text-white/90 font-medium text-base sm:text-lg drop-shadow-md">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-semibold text-sm mb-2 block drop-shadow-md">Email/Username</FormLabel>
                  <Input 
                    {...field} 
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 h-12 text-base rounded-full transition-all" 
                    placeholder="Enter your email or username"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-semibold text-sm mb-2 block drop-shadow-md">Password</FormLabel>
                  <Input 
                    type="password" 
                    {...field} 
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 h-12 text-base rounded-full transition-all" 
                    placeholder="Enter your password"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-indigo-600/80 hover:bg-indigo-600 backdrop-blur-sm border border-indigo-400/50 text-white font-semibold font-heading py-6 text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-200 mt-6" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-8 pt-6 border-t border-white/30">
          <p className="text-white/90 text-sm sm:text-base drop-shadow-md">
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-white hover:text-white/80 font-semibold transition-colors underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
