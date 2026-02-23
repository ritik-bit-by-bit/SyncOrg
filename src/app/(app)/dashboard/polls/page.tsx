'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { Vote, Plus, Copy, ArrowLeft, BarChart3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function PollsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', ''],
    allowMultiple: false,
    expiresAt: ''
  });
  const [createdPollUrl, setCreatedPollUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchPolls();
    }
  }, [session]);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/polls/list');
      if (response.data.success && response.data.data) {
        const pollsData = Array.isArray(response.data.data) ? response.data.data : [];
        setPolls(pollsData);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch polls',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!newPoll.question || newPoll.options.filter(opt => opt.trim()).length < 2) {
      toast({
        title: 'Error',
        description: 'Question and at least 2 options are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await axios.post<ApiResponse>('/api/polls/create', {
        question: newPoll.question,
        options: newPoll.options.filter(opt => opt.trim()),
        allowMultiple: newPoll.allowMultiple,
        expiresAt: newPoll.expiresAt
      });
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Poll created successfully! Share the link to collect votes.',
        });
        setIsDialogOpen(false);
        setNewPoll({ question: '', options: ['', ''], allowMultiple: false, expiresAt: '' });
        // Refresh polls list
        fetchPolls();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to create poll',
        variant: 'destructive',
      });
    }
  };

  const addOption = () => {
    setNewPoll({...newPoll, options: [...newPoll.options, '']});
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newPoll.options];
    newOptions[index] = value;
    setNewPoll({...newPoll, options: newOptions});
  };

  if (!session) {
    return <div></div>;
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="w-full p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Polls
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 shadow-sm hover:shadow">
                <Plus className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Create New Poll</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create an anonymous poll to collect votes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900 font-medium">Question</Label>
                  <Textarea
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="What's your favorite feature?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-gray-900 font-medium">Options</Label>
                  {newPoll.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="bg-white border-gray-300 text-gray-900 mb-2"
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="mt-2 text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <div>
                  <Label className="text-gray-900 font-medium">Expires In (Hours, Optional)</Label>
                  <Input
                    type="number"
                    value={newPoll.expiresAt}
                    onChange={(e) => setNewPoll({...newPoll, expiresAt: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="24"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreatePoll}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Create Poll
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

            {loading ? (
              <div className="text-center py-20">
                <p className="text-gray-600">Loading polls...</p>
              </div>
            ) : polls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {polls.map((poll) => (
                  <Card
                    key={poll._id}
                    className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-900 font-semibold text-base">{poll.question}</CardTitle>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                          poll.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {poll.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-600 text-xs mb-2 font-medium">Poll Link:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-gray-900 text-xs font-mono bg-white p-2 rounded border border-gray-300 truncate">
                            {poll.url}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(poll.url);
                              toast({
                                title: 'Copied',
                                description: 'Poll link copied to clipboard',
                              });
                            }}
                            className="text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-gray-700 text-sm">
                          <span className="font-medium">Total Votes:</span>
                          <span className="font-semibold text-gray-900">{poll.totalVotes || 0}</span>
                        </div>
                        {poll.results && poll.results.length > 0 && (
                          <div className="space-y-2 mt-4">
                            <p className="text-gray-900 text-sm font-semibold">Results:</p>
                            {poll.results.map((result: any, index: number) => (
                              <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-900 font-medium">{result.label}</span>
                                  <span className="text-gray-600 text-xs">{result.votes} votes ({result.percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${result.percentage}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => window.open(poll.url, '_blank')}
                          variant="outline"
                          className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex-1 font-medium"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Poll
                        </Button>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(poll.url);
                            toast({
                              title: 'Copied',
                              description: 'Poll link copied to clipboard',
                            });
                          }}
                          variant="outline"
                          className="border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="py-20 text-center">
                  <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-900 mb-4 font-medium">Create polls to collect anonymous feedback</p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Poll
                  </Button>
                </CardContent>
              </Card>
            )}
      </div>
    </div>
  );
}
