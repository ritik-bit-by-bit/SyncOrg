'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios, { AxiosError } from 'axios';
import { Loader } from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import { signUpSchema } from '@/Schemas/signup';
import FloatingLines from '@/components/FloatingLines';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debouncedUsername] = useDebounceValue(username, 500); // 500ms is ideal

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      
    },
  });

  const checkUsername = useCallback(async (username: string) => {
    if (username && username.length >= 3) {
      setIsCheckingUsername(true);
      setUsernameMessage('');

      try {
        const response = await axios.get<ApiResponse>(
          `/api/CheckUsernameUnique?username=${username}`
        );
        setUsernameMessage(response.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(
          axiosError.response?.data.message ?? 'Error checking username'
        );
      } finally {
        setIsCheckingUsername(false);
      }
    }
  }, []);

  useEffect(() => {
    checkUsername(debouncedUsername);
  }, [debouncedUsername, checkUsername]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    console.log('onSubmit function called');
    setIsSubmitting(true);
    try {
        console.log('Form data:', data);
        console.log('Making request to /api/Signup');
      const response = await axios.post<ApiResponse>('/api/Signup', data);
      console.log('Signup response:', response);
      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message ??
        'There was a problem with your sign-up. Please try again.';

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
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
        className="w-full max-w-md max-h-screen p-10 sm:p-12 rounded-2xl shadow-2xl z-10 relative"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <div className="text-center mb-8">
          <p className=" text-lg text-white/90 font-bold sm:text-lg drop-shadow-md">Sign up to start your using SynOrg</p>
        </div>
        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log('Form submit event triggered');
              form.handleSubmit(onSubmit)(e);
            }} 
            className="space-y-3"
          >
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem >
                  <FormLabel className="text-white font-semibold text-sm mb-0.5 block drop-shadow-md">Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUsername(e.target.value);
                    }}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-black placeholder:text-black focus:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 h-12 text-base rounded-full transition-all"
                    placeholder="Choose a username"
                  />
                  <div className="mt-0.5 min-h-[20px]">
                  {isCheckingUsername && (
                      <div className="flex items-center gap-2">
                        <Loader size="sm" />
                        <span className="text-sm text-white/80">Checking...</span>
                      </div>
                  )}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                        className={`text-sm drop-shadow-md ${
                        usernameMessage === 'Username is unique'
                            ? 'text-green-300 font-medium'
                            : 'text-red-300 font-medium'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  </div>
                  <FormMessage className="mt-0.5" />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-semibold text-sm mb-2 block drop-shadow-md">Email</FormLabel>
                  <Input 
                    {...field} 
                    type="email"
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-black placeholder:text-black focus:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 h-12 text-base rounded-full transition-all" 
                    placeholder="Enter your email"
                  />
                  <p className="text-white/80 text-xs sm:text-sm mt-1.5 drop-shadow-md">
                    We will send you a verification code
                  </p>
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
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-black placeholder:text-black focus:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 h-12 text-base rounded-full transition-all" 
                    placeholder="Create a password"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full text-white font-semibold font-heading py-6 text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-200 mt-6 border-0" 
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-8 pt-6 border-t border-white/30">
          <p className="text-white/90 text-sm sm:text-base drop-shadow-md">
            Already a member?{' '}
            <Link href="/sign-in" className="text-white hover:text-white/80 font-semibold transition-colors underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
