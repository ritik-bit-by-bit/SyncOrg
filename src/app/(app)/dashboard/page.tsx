'use client'

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/user';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { 
  RefreshCcw, 
  Copy, 
  Link2, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Shield, 
  HelpCircle, 
  Vote, 
  Link as LinkIcon,
  Zap,
  FileText,
  Users,
  Bell,
  Palette,
  X,
  Sparkles,
  Send,
  MessageCircle
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { exceptMessage } from '@/Schemas/acceptMessageSchema';
import Link from 'next/link';
import MessagesList from '@/components/MessagesList';

interface QnAItem {
  _id: string;
  qnaId: string;
  questionText: string;
  answerText?: string;
  createdAt: Date;
  answeredAt?: Date;
  anonVisitorId?: string;
}

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [qaQuestions, setQaQuestions] = useState<QnAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [qaModeEnabled, setQaModeEnabled] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [savingReply, setSavingReply] = useState<string | null>(null);
 
  const { toast } = useToast();
  const { data: session } = useSession();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const form = useForm({
    resolver: zodResolver(exceptMessage),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/AcceptMessage');
      setValue('acceptMessages', true);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>('/api/getMessages');
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({
            title: 'Refreshed Messages',
            description: 'Showing latest messages',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'Error',
          description: axiosError.response?.data.message ?? 'Failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);  
      }
    },
    [setIsLoading, setMessages, toast]
  );

  const username = session?.user ? (session.user as any).username || '' : '';

  useEffect(() => {
    if (typeof window !== 'undefined' && username) {
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      setProfileUrl(`${baseUrl}/u/${username}`);
    }
  }, [username]);

  const fetchQASettings = useCallback(async () => {
    try {
      const response = await axios.get<ApiResponse>('/api/settings/get');
      if (response.data.success && response.data.data) {
        setQaModeEnabled(response.data.data.qaModeEnabled || false);
      }
    } catch (error) {
      console.error('Error fetching QA settings:', error);
    }
  }, []);

  const fetchQAQuestions = useCallback(async () => {
    if (!qaModeEnabled) return;
    setIsQaLoading(true);
    try {
      const response = await axios.get<ApiResponse & { data?: QnAItem[] }>('/api/qa/list');
      if (response.data.success) {
        setQaQuestions((response.data.data as QnAItem[]) || []);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('Error fetching QA questions:', axiosError);
    } finally {
      setIsQaLoading(false);
    }
  }, [qaModeEnabled]);

  const handleReply = async (qnaId: string) => {
    if (!replyText[qnaId] || !replyText[qnaId].trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reply',
        variant: 'destructive',
      });
      return;
    }

    setSavingReply(qnaId);
    try {
      const response = await axios.post<ApiResponse>('/api/qa/answer', {
        qnaId,
        answerText: replyText[qnaId],
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Reply saved successfully',
        });
        setReplyingTo(null);
        setReplyText({ ...replyText, [qnaId]: '' });
        fetchQAQuestions();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to save reply',
        variant: 'destructive',
      });
    } finally {
      setSavingReply(null);
    }
  };

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessages();
    fetchQASettings();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages, fetchQASettings]);

  useEffect(() => {
    if (qaModeEnabled) {
      fetchQAQuestions();
    }
  }, [qaModeEnabled, fetchQAQuestions]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/AcceptMessage', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: 'URL Copied!',
        description: 'Profile URL has been copied to clipboard.',
      });
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  return (
    <div className="w-full p-6 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Header */}
          <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Dashboard
              </h1>
            <p className="text-gray-500 text-sm">Manage your messages and Q&A interactions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Messages</p>
              <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <LinkIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Links</p>
              <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${acceptMessages ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <Zap className={`w-6 h-6 ${acceptMessages ? 'text-green-600' : 'text-orange-600'}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
              <p className={`text-3xl font-bold ${acceptMessages ? 'text-green-600' : 'text-orange-600'}`}>
                {acceptMessages ? 'Active' : 'Paused'}
              </p>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Copy URL Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Link2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Your Unique Link</h3>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileUrl}
                      disabled
                      className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg font-mono focus:outline-none"
                    />
                    <Button
                      size="sm"
                      onClick={copyToClipboard}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Message Settings Section */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                      Accept Messages
                    </h3>
                    <p className={`text-xs ${acceptMessages ? 'text-green-600' : 'text-gray-500'}`}>
                      {acceptMessages ? 'Messages are being received' : 'Messages are paused'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Section */}
          <MessagesList
            messages={messages}
            isLoading={isLoading}
            onRefresh={() => fetchMessages(true)}
            onDelete={handleDeleteMessage}
          />

          {/* Q&A Mode Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Q&A Questions</h2>
                    {!qaModeEnabled && (
                      <p className="text-sm text-gray-500 mt-0.5">Enable Q&A mode to receive questions</p>
                    )}
                  </div>
                </div>
                {qaModeEnabled && (
                  <Button
                    size="sm"
                    onClick={fetchQAQuestions}
                    disabled={isQaLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    {isQaLoading ? (
                      <Loader size="sm" className="mr-2" />
                    ) : (
                      <RefreshCcw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {!qaModeEnabled ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium mb-1">Q&A Mode is Disabled</p>
                  <p className="text-gray-500 text-sm mb-4">Enable Q&A mode to start receiving questions</p>
                  <Link href="/dashboard/qa">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Go to Q&A Settings
                    </Button>
                  </Link>
                </div>
              ) : isQaLoading ? (
                <div className="text-center py-12">
                  <Loader />
                  <p className="text-gray-500 mt-4 text-sm">Loading questions...</p>
                </div>
              ) : qaQuestions.length > 0 ? (
                <div className="space-y-4">
                  {qaQuestions.map((qna) => (
                    <div
                      key={qna._id}
                      className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="space-y-4">
                        {/* Question */}
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 font-medium text-sm leading-relaxed">
                              {qna.questionText}
                            </p>
                            <p className="text-xs text-gray-500 mt-1.5">
                              Asked on {new Date(qna.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Answer if exists */}
                        {qna.answerText && (
                          <div className="ml-11 pl-4 border-l-2 border-green-200">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                                <MessageSquare className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {qna.answerText}
                                </p>
                                <p className="text-xs text-gray-500 mt-1.5">
                                  Answered on {qna.answeredAt ? new Date(qna.answeredAt).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reply Interface */}
                        {!qna.answerText && (
                          <div className="ml-11 space-y-3">
                            {replyingTo === qna.qnaId ? (
                              <div className="space-y-3">
                                <Textarea
                                  placeholder="Type your reply here..."
                                  value={replyText[qna.qnaId] || ''}
                                  onChange={(e) => setReplyText({ ...replyText, [qna.qnaId]: e.target.value })}
                                  className="min-h-[100px] text-sm bg-white border-gray-300 focus:border-blue-500"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleReply(qna.qnaId)}
                                    disabled={savingReply === qna.qnaId}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    {savingReply === qna.qnaId ? (
                                      <>
                                        <Loader size="sm" className="mr-2" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send Reply
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText({ ...replyText, [qna.qnaId]: '' });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => setReplyingTo(qna.qnaId)}
                                variant="outline"
                                className="text-sm"
                              >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Reply
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium mb-1">No questions yet</p>
                  <p className="text-gray-500 text-sm">Questions will appear here when people ask you in QA mode</p>
                </div>
              )}
            </div>
          </div>

      </div>
    </div>
  );
}

export default Page;
