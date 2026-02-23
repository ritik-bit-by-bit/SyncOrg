'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MessageSquare, Sparkles, UserPlus } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageSchema } from '@/Schemas/messageSchema';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const { toast } = useToast();

  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(
    parseStringMessages(initialMessageString)
  );
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/SendMessage', {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      setIsSuggestLoading(true);
      console.log('Fetching suggestions from Gemini API...');
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const text = await response.text();
      console.log('Suggestion Text:', text);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.status} - ${text || 'Unknown error'}`);
      }
      
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from API');
      }
      
      const parsed = parseStringMessages(text);
      
      if (parsed.length === 0 || parsed.every(msg => !msg.trim())) {
        throw new Error('No valid messages in response');
      }
      
      setSuggestedMessages(parsed);
      toast({
        title: 'Success',
        description: 'Suggestions refreshed successfully!',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load suggestions. Using default messages.',
        variant: 'destructive',
      });
    } finally {
      setIsSuggestLoading(false);
    }
  };

  // Fetch suggestions on component mount
  useEffect(() => {
    fetchSuggestedMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          25% { transform: translateX(10px) translateY(-10px) rotate(2deg); }
          50% { transform: translateX(-10px) translateY(10px) rotate(-2deg); }
          75% { transform: translateX(5px) translateY(-5px) rotate(1deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}} />
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 60%, #0f172a 100%)',
        }}
      >
      
      {/* Animated wave layers */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          pointerEvents: 'none',
        }}
      >
        {/* Wave layer 1 */}
        <div 
          className="absolute w-full h-full"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            animation: 'wave 20s ease-in-out infinite',
          }}
        />
        
        {/* Wave layer 2 */}
        <div 
          className="absolute w-full h-full"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 0% 100%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)',
            animation: 'wave 25s ease-in-out infinite reverse',
          }}
        />
        
        {/* Wave layer 3 */}
        <div 
          className="absolute w-full h-full"
          style={{
            background: 'radial-gradient(ellipse 70% 45% at 100% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
            animation: 'wave 30s ease-in-out infinite',
          }}
        />
      </div>
      
      {/* Shimmer effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 8s linear infinite',
        }}
      />
      
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Animated gradient spots */}
      <div 
        className="absolute inset-0"
        style={{
          pointerEvents: 'none',
        }}
      >
        <div 
          className="absolute rounded-full blur-2xl"
          style={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            top: '20%',
            left: '10%',
            animation: 'fadeInOut 4s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute rounded-full blur-2xl"
          style={{
            width: '250px',
            height: '250px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, transparent 70%)',
            top: '60%',
            right: '15%',
            animation: 'fadeInOut 5s ease-in-out infinite 1s',
          }}
        />
        <div 
          className="absolute rounded-full blur-2xl"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            bottom: '20%',
            left: '50%',
            animation: 'fadeInOut 6s ease-in-out infinite 2s',
          }}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 gap-6 lg:gap-8 relative z-10">
        {/* Main Card - Message Form */}
        <div
          className="w-full lg:w-1/2 max-w-lg rounded-2xl shadow-2xl p-6 sm:p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div
                className="p-4 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 text-white leading-tight drop-shadow-lg">
              Send an Anonymous Message
            </h1>
            <p className="text-white/90 font-medium text-base sm:text-lg mt-2 drop-shadow-md">
              Message to <span className="font-semibold">@{username}</span>
            </p>
          </div>

          {/* Message Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-semibold text-sm mb-2 block drop-shadow-md">
                      Your Message
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your anonymous message here..."
                        className="resize-none bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 rounded-2xl p-4 min-h-[140px] text-base transition-all"
                        style={{
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300 drop-shadow-md" />
                  </FormItem>
                )}
              />
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading || !messageContent}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold font-heading py-6 px-8 text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader size="sm" className="mr-2" />
                      Sending...
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </div>
            </form>
          </Form>

        </div>

        {/* Side Card - Suggested Messages & Create Account */}
        <div className="w-full lg:w-1/2 max-w-lg flex flex-col gap-6">
          {/* Suggested Messages Section */}
          <div
            className="rounded-2xl shadow-2xl p-6 sm:p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
              <div className="flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-white" />
                <h2 className="text-xl sm:text-2xl font-semibold font-heading text-white drop-shadow-lg">
                  Suggested Messages
                </h2>
              </div>
              <Button
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold font-heading px-6 py-3 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isSuggestLoading ? (
                  <div className="flex items-center">
                    <Loader size="sm" className="mr-2" />
                    Loading...
                  </div>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestedMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => handleMessageClick(message)}
                  className="w-full text-left bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-xl p-4 transition-all duration-200 hover:shadow-md text-sm sm:text-base"
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  {message}
                </button>
              ))}
            </div>
          </div>

          {/* Create Account Section */}
          <div
            className="rounded-2xl shadow-2xl p-10 sm:p-8 text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="flex justify-center mb-4">
              <UserPlus className="w-6 h-6 text-white/80" />
            </div>
            <p className="text-white/90 text-base sm:text-lg mb-4 drop-shadow-md">
              Want your own message board?
            </p>
            <Link href="/sign-up">
              <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold font-heading py-4 px-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}