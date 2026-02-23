'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/user';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { FileText, MessageSquare, RefreshCcw, X } from 'lucide-react';

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  onRefresh: () => void;
  onDelete: (messageId: string) => void;
}

export default function MessagesList({
  messages,
  isLoading,
  onRefresh,
  onDelete,
}: MessagesListProps) {
  const { toast } = useToast();

  const handleDelete = async (messageId: string) => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/deleteMessage/${messageId}`
      );
      toast({
        title: response.data.message,
        variant: 'default',
      });
      onDelete(messageId);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/export/messages?format=csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `messages-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({
          title: 'Success',
          description: 'Messages exported as CSV',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export messages',
        variant: 'destructive',
      });
    }
  };

  const handleExportJSON = async () => {
    try {
      const response = await fetch('/api/export/messages?format=json');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `messages-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({
          title: 'Success',
          description: 'Messages exported as JSON',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export messages',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm" data-testid="messages-list">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Received Messages</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="text-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onRefresh();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {isLoading ? (
                <Loader size="sm" className="mr-2" />
              ) : (
                <RefreshCcw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader />
            <p className="text-gray-500 mt-4 text-sm">Loading messages...</p>
          </div>
        ) : messages.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message._id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-medium text-sm leading-relaxed mb-2">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(message._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-auto w-auto flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-medium mb-1">No messages yet</p>
            <p className="text-gray-500 text-sm">Share your link to start receiving anonymous messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
