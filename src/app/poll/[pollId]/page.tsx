'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { Vote, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PollPage() {
  const params = useParams<{ pollId: string }>();
  const pollId = params.pollId;
  const { toast } = useToast();

  const [poll, setPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pollId) {
      fetchPoll();
      // Check if user has already voted (using localStorage)
      const voteKey = `poll_vote_${pollId}`;
      const voted = localStorage.getItem(voteKey);
      if (voted) {
        setHasVoted(true);
        setSelectedOption(voted);
      }
    }
  }, [pollId]);

  const fetchPoll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(`/api/polls/results?pollId=${pollId}`);
      if (response.data.success) {
        setPoll(response.data.data);
      } else {
        setError(response.data.message || 'Poll not found');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      setError(axiosError.response?.data.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (hasVoted || voting) return;
    
    setVoting(true);
    try {
      // Generate anonymous visitor ID
      let anonVisitorId = localStorage.getItem('anon_visitor_id');
      if (!anonVisitorId) {
        anonVisitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('anon_visitor_id', anonVisitorId);
      }

      const response = await axios.post<ApiResponse>('/api/polls/vote', {
        pollId,
        optionId,
        anonVisitorId
      });

      if (response.data.success) {
        setHasVoted(true);
        setSelectedOption(optionId);
        localStorage.setItem(`poll_vote_${pollId}`, optionId);
        
        // Update poll results
        setPoll({
          ...poll,
          totalVotes: response.data.data.totalVotes,
          results: response.data.data.results
        });
        
        toast({
          title: 'Success',
          description: 'Your vote has been recorded',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to vote',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
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

  if (error || !poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{
        background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 60%, #0f172a 100%)',
      }}>
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Poll Not Available</h1>
        <p className="text-white/70 mb-4">{error || 'This poll is not available'}</p>
      </div>
    );
  }

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          25% { transform: translateX(10px) translateY(-10px) rotate(2deg); }
          50% { transform: translateX(-10px) translateY(10px) rotate(-2deg); }
          75% { transform: translateX(5px) translateY(-5px) rotate(1deg); }
        }
      `}} />
      
      <div 
        className="min-h-screen relative overflow-hidden py-16 px-4"
        style={{
          background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 60%, #0f172a 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none', zIndex: 0 }}>
          <div className="absolute w-full h-full" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            animation: 'wave 20s ease-in-out infinite',
          }} />
        </div>

        <div className="max-w-2xl mx-auto relative z-10">
          <Card
            className="rounded-2xl shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Vote className="w-6 h-6 text-white" />
                <CardTitle className="text-white text-2xl font-heading">Anonymous Poll</CardTitle>
              </div>
              {isExpired && (
                <p className="text-red-300 text-sm">This poll has expired</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">{poll.question}</h2>
                <p className="text-white/60 text-sm">
                  {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
                </p>
              </div>

              <div className="space-y-3">
                {poll.results.map((result: any, index: number) => {
                  const isSelected = selectedOption === result.optionId;
                  const isWinning = poll.results.every((r: any) => r.votes <= result.votes || r.optionId === result.optionId);
                  
                  return (
                    <div key={result.optionId}>
                      <button
                        onClick={() => !hasVoted && !isExpired && handleVote(result.optionId)}
                        disabled={hasVoted || isExpired || voting}
                        className={`w-full p-4 rounded-xl transition-all text-left ${
                          hasVoted || isExpired
                            ? 'cursor-default'
                            : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                        } ${
                          isSelected
                            ? 'ring-2 ring-green-400'
                            : ''
                        }`}
                        style={{
                          background: isSelected
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${isSelected ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{result.label}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            )}
                            {hasVoted && isWinning && result.votes > 0 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                                Leading
                              </span>
                            )}
                          </div>
                          {hasVoted && (
                            <span className="text-white font-semibold">{result.percentage}%</span>
                          )}
                        </div>
                        {hasVoted && (
                          <div className="mt-2">
                            <Progress 
                              value={result.percentage} 
                              className="h-2 bg-white/10"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              }}
                            />
                            <p className="text-white/60 text-xs mt-1">{result.votes} votes</p>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {hasVoted && (
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <BarChart3 className="w-4 h-4" />
                    <span>You have voted. Results are shown above.</span>
                  </div>
                </div>
              )}

              {!hasVoted && !isExpired && (
                <p className="text-white/60 text-sm text-center">
                  Click on an option to vote anonymously
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

