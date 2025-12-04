import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getInitials } from '@/components/ui/avatar-group';
import { authClient } from '@/lib/authClient';
import { Camera, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { apiBase } from '@/lib/api';

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(session?.user?.name || '');

  // Update local state when session loads
  if (session?.user?.name && name === '' && !isPending) {
    setName(session.user.name);
  }

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const { data: presignedData } = await apiBase.get(`/files/presigned-url`);

      const { url, key } = presignedData;

      // 2. Upload file to S3
      await axios.put(url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      // 3. Update user profile
      await authClient.updateUser({
        image: key,
      });

      toast.success('Profile picture updated');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await authClient.updateUser({
        name: name,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative group">
                <Avatar
                  className="w-24 h-24 border-2 cursor-pointer border-border"
                  onClick={handleImageClick}
                >
                  <AvatarImage
                    src={session.user.image || undefined}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-xl">
                    {getInitials(session.user.name)}
                  </AvatarFallback>
                  <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/50 rounded-full opacity-0 group-hover:opacity-100">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-medium">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  Click the image to upload a new photo. JPG, GIF or PNG. Max
                  size of 5MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={session.user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Your email address is managed by your organization and cannot
                  be changed.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
