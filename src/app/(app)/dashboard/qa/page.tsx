'use client';

import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { HelpCircle, ArrowLeft, MessageSquare, Send, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from '@/components/ui/loader';
import Link from 'next/link';

interface QnAItem {
  _id: string;
  qnaId: string;
  questionText: string;
  answerText?: string;
  createdAt: Date;
  answeredAt?: Date;
  anonVisitorId?: string;
}

export default function QAPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [qaEnabled, setQaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qaQuestions, setQaQuestions] = useState<QnAItem[]>([]);
  const [isQaLoading, setIsQaLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [savingReply, setSavingReply] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchQASettings();
    }
  }, [session]);

  const fetchQASettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/settings/get');
      if (response.data.success && response.data.data) {
        setQaEnabled(response.data.data.qaModeEnabled || false);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch Q&A settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQAQuestions = useCallback(async () => {
    if (!qaEnabled) return;
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
  }, [qaEnabled]);

  const handleToggle = async (enabled: boolean) => {
    setSaving(true);
    try {
      const response = await axios.post<ApiResponse>('/api/qa/enable', { enabled });
      if (response.data.success) {
        setQaEnabled(enabled);
        toast({
          title: 'Success',
          description: `Q&A mode ${enabled ? 'enabled' : 'disabled'}`,
        });
        if (enabled) {
          fetchQAQuestions();
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update Q&A mode',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

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
    if (qaEnabled) {
      fetchQAQuestions();
    }
  }, [qaEnabled, fetchQAQuestions]);

  if (!session) {
    return <div></div>;
  }

  return (
    <div className="w-full p-6 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Q&A Mode
          </h1>
        </div>
        <p className="text-gray-500 text-sm mb-8 ml-14">Manage your Q&A settings and questions</p>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
            <Loader />
            <p className="text-gray-500 mt-4 text-sm">Loading settings...</p>
          </div>
        ) : (
          <>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-200">
                <CardTitle className="text-gray-900 flex items-center gap-2 text-lg font-semibold">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  Q&A Mode Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <Label className="text-gray-900 text-sm font-semibold block mb-1">Enable Q&A Mode</Label>
                    <p className="text-xs text-gray-500">
                      When enabled, messages will be treated as questions that you can answer publicly
                    </p>
                  </div>
                  <Switch
                    checked={qaEnabled}
                    onCheckedChange={handleToggle}
                    disabled={saving}
                    className="data-[state=checked]:bg-blue-600 ml-4"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-gray-200">
                <CardTitle className="text-gray-900 text-lg font-semibold">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <h3 className="text-gray-900 font-semibold mb-1.5 text-sm">1. Enable Q&A Mode</h3>
                    <p className="text-xs text-gray-500">Toggle the switch above to enable Q&A mode for your profile.</p>
                  </div>
                  <div className="pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                    <h3 className="text-gray-900 font-semibold mb-1.5 text-sm">2. Receive Questions</h3>
                    <p className="text-xs text-gray-500">People can send you questions anonymously through your link.</p>
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1.5 text-sm">3. Answer Questions</h3>
                    <p className="text-xs text-gray-500">View questions below and provide public answers. Only signed-up users will see your replies.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Q&A Questions Section */}
            {qaEnabled && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      Q&A Questions
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={fetchQAQuestions}
                      disabled={isQaLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isQaLoading ? (
                        <Loader size="sm" className="mr-2" />
                      ) : (
                        <RefreshCcw className="w-4 h-4 mr-2" />
                      )}
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isQaLoading ? (
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
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}


