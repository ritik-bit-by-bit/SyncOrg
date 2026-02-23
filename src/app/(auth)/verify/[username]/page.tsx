'use client';

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
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { verifySchema } from '@/Schemas/verifySchema';
import FloatingLines from '@/components/FloatingLines';
import { Mail, Shield } from 'lucide-react';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>('/api/VerifyCode', {
        username: params.username,
        code: data.code,
      });

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Verification Failed',
        description:
          axiosError.response?.data.message ??
          'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen relative overflow-hidden">
      <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
        <FloatingLines 
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={18}
          lineDistance={81}
          bendRadius={25.5}
          bendStrength={0}
          interactive={false}
          parallax={false}
          animationSpeed={0}
        />
      </div>

      <div
        className="w-full max-w-md p-10 sm:p-12 rounded-2xl shadow-2xl z-10 relative"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div
              className="p-4 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight mb-2 text-white leading-tight drop-shadow-lg">
            Verify Your Account
          </h1>
          <div className="flex items-center justify-center gap-2 mt-4 text-white/90">
            <Mail className="w-5 h-5" />
            <p className="font-medium text-base sm:text-lg drop-shadow-md">
              Enter the verification code sent to your email
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-semibold text-sm mb-2 block drop-shadow-md">
                    Verification Code
                  </FormLabel>
                  <Input
                    {...field}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50 focus:ring-2 focus:ring-white/30 h-12 text-base rounded-full transition-all text-center text-lg tracking-widest font-semibold"
                    placeholder="000000"
                    maxLength={6}
                    style={{
                      letterSpacing: '0.5em',
                    }}
                  />
                  <FormMessage className="text-red-300 drop-shadow-md" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold font-heading py-6 text-base sm:text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-200 mt-6"
            >
              Verify Account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}