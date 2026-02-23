'use client'

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import { X, Sparkles, Copy } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Message } from '@/model/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import ElectricBorder from '@/components/ElectricBorder';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/deleteMessage/${message._id}`
      );
      toast({
        title: response.data.message,
        variant: 'default',
      });
      onMessageDelete(message._id);

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to delete message',
        variant: 'destructive',
      });
    } 
  };

  const fetchReplySuggestions = async () => {
    if (suggestions.length > 0) {
      setIsSuggestionsOpen(true);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await axios.post<ApiResponse>('/api/replies/suggest', {
        messageText: message.content
      });
      if (response.data.success && response.data.suggestions) {
        setSuggestions(response.data.suggestions);
        setIsSuggestionsOpen(true);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to generate suggestions',
        variant: 'destructive',
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const copySuggestion = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Reply suggestion copied to clipboard',
    });
  };

  return (
    <ElectricBorder
      color="#7df9ff"
      speed={1}
      chaos={0.5}
      thickness={2}
      style={{ borderRadius: 16 }}
    >
      <Card
        className="shadow-lg hover:shadow-xl transition-all duration-300"
        style={{
          background: 'linear-gradient(to bottom right, #ffffff 0%, #e8e0f0 30%, #cabadb 70%, #a896c5 100%)',
          border: 'none',
        }}
      >
      <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-lg font-semibold text-gray-800 flex-1">
              {message.content}
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={fetchReplySuggestions}
                    disabled={loadingSuggestions}
                    className="bg-blue-500/80 hover:bg-blue-600/80 backdrop-blur-sm border border-blue-400/50 text-white rounded-full p-2 h-auto w-auto flex-shrink-0"
                    title="Get AI reply suggestions"
                  >
                    {loadingSuggestions ? (
                      <Loader size="sm" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}>
                  <DialogHeader>
                    <DialogTitle className="text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-500" />
                      AI Reply Suggestions
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Click on a suggestion to copy it
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {suggestions.length > 0 ? (
                      suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => copySuggestion(suggestion)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-gray-800 flex-1">{suggestion}</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                copySuggestion(suggestion);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-center py-4">No suggestions available</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm border border-red-400/50 text-white rounded-full p-2 h-auto w-auto flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
              <AlertDialogContent
                className="rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}
              >
              <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading text-gray-800">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-full">
                  Cancel
                </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-500 hover:bg-red-600 rounded-full"
                  >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
          <div className="text-sm text-gray-600 mt-2">
          {dayjs(message.createdAt).format('MMM D, YYYY h:mm A')}
        </div>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
    </ElectricBorder>
  );
}
