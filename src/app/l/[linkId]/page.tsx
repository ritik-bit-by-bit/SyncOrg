'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { MessageSquare, Sparkles, UserPlus, AlertCircle } from 'lucide-react';
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

export default function LinkMessagePage() {
  const params = useParams<{ linkId: string }>();
  const linkId = params.linkId;
  const { toast } = useToast();

  const [linkInfo, setLinkInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (linkId) {
      fetchLinkInfo();
      fetchSuggestedMessages();
    }
  }, [linkId]);

  const fetchLinkInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(`/api/links/get?linkId=${linkId}`);
      if (response.data.success) {
        setLinkInfo(response.data.data);
      } else {
        setError(response.data.message || 'Link not found');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setError(axiosError.response?.data.message || 'Failed to load link');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
    if (!linkInfo) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/SendMessage', {
        ...data,
        username: linkInfo.username,
        linkId: linkId,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
      
      // Update link message count
      await axios.post('/api/links/increment', { linkId });
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
      const response = await fetch('/api/suggest-messages', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.status}`);
      }
      
      const data = JSON.parse(text);
      if (data.success && data.suggestions) {
        setSuggestedMessages(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // Keep default messages on error
    } finally {
      setIsSuggestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 60%, #0f172a 100%)',
      }}>
        <Loader />
      </div>
    );
  }

  if (error || !linkInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 60%, #0f172a 100%)',
      }}>
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Link Not Available</h1>
        <p className="text-white/70 mb-4">{error || 'This link is not available'}</p>
        <Link href="/">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
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
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      >
        {/* Background effects - same as /u/[username] */}
        <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none', zIndex: 0 }}>
          <div className="absolute w-full h-full" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            animation: 'wave 20s ease-in-out infinite',
          }} />
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
                {linkInfo.title || 'Send an Anonymous Message'}
              </h1>
              {linkInfo.description && (
                <p className="text-white/80 font-medium text-sm sm:text-base mt-2 drop-shadow-md">
                  {linkInfo.description}
                </p>
              )}
              <p className="text-white/90 font-medium text-base sm:text-lg mt-2 drop-shadow-md">
                Message to <span className="font-semibold">@{linkInfo.username}</span>
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
                      <FormLabel className="text-white font-semibold">Your Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type your anonymous message here..."
                          className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !messageContent}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-heading py-6 text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader size="sm" className="mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Anonymously'
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Side Card - Suggested Messages */}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h2 className="text-xl font-semibold font-heading text-white">Suggested Messages</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSuggestedMessages}
                disabled={isSuggestLoading}
                className="text-white hover:text-white/80 hover:bg-white/10 rounded-full"
              >
                {isSuggestLoading ? (
                  <Loader size="sm" />
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            <div className="space-y-3">
              {suggestedMessages.map((message, index) => (
                <button
                  key={index}
                  onClick={() => handleMessageClick(message)}
                  className="w-full text-left p-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <p className="text-white/90 text-sm leading-relaxed">{message}</p>
                </button>
              ))}
            </div>

            <Separator className="my-6 bg-white/20" />

            <div className="text-center">
              <p className="text-white/70 text-sm mb-4">
                Don&apos;t have an account? Create one to receive anonymous messages!
              </p>
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 rounded-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

