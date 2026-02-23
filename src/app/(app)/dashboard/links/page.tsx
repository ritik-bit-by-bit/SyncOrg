'use client';

import { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { Link2, Plus, Copy, Trash2, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function LinksPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({
    mode: 'message',
    expiresAt: '',
    maxMessages: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    if (session) {
      fetchLinks();
    }
  }, [session]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/links/list');
      if (response.data.success && response.data.data) {
        const linksData = Array.isArray(response.data.data) ? response.data.data : [];
        setLinks(linksData);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/links/create', newLink);
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Link created successfully! Share it to receive messages.',
        });
        setIsDialogOpen(false);
        setNewLink({ mode: 'message', expiresAt: '', maxMessages: '', title: '', description: '' });
        fetchLinks();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to create link',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Link copied to clipboard',
    });
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  if (!session) {
    return <div></div>;
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="w-full p-6 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Link Management
            </h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 shadow-sm hover:shadow">
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Create New Link</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new link with optional expiration and message limits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900 font-medium">Title (Optional)</Label>
                  <Input
                    value={newLink.title}
                    onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="My Feedback Link"
                  />
                </div>
                <div>
                  <Label className="text-gray-900 font-medium">Description (Optional)</Label>
                  <Input
                    value={newLink.description}
                    onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Description"
                  />
                </div>
                <div>
                  <Label className="text-gray-900 font-medium">Expires In (Hours, Optional)</Label>
                  <Input
                    type="number"
                    value={newLink.expiresAt}
                    onChange={(e) => setNewLink({...newLink, expiresAt: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="24"
                  />
                </div>
                <div>
                  <Label className="text-gray-900 font-medium">Max Messages (Optional)</Label>
                  <Input
                    type="number"
                    value={newLink.maxMessages}
                    onChange={(e) => setNewLink({...newLink, maxMessages: e.target.value})}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="100"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateLink}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Create Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-600">Loading links...</p>
          </div>
        ) : links.length === 0 ? (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="py-20 text-center">
              <Link2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 mb-4 font-medium">No links created yet</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {links.map((link) => {
              const linkUrl = `${baseUrl}/l/${link.linkId}`;
              return (
                <Card
                  key={link._id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center justify-between font-semibold">
                      <span>{link.title || 'Untitled Link'}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        link.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {link.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {link.description && (
                      <p className="text-gray-600 text-sm">{link.description}</p>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <code className="text-gray-900 text-sm font-mono flex-1 truncate">{linkUrl}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(linkUrl)}
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Expires: {formatDate(link.expiresAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-gray-500" />
                        <span>Messages: {link.messagesCount} / {link.maxMessages || '∞'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                        <span>Mode: {link.mode}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
