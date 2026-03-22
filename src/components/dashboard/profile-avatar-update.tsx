'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { updateProfilePhoto } from '@/app/actions/profile';
import { useToast } from '@/hooks/use-toast';

interface ProfileAvatarUpdateProps {
  initialUrl?: string | null;
  initials: string;
}

export function ProfileAvatarUpdate({ initialUrl, initials }: ProfileAvatarUpdateProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Error', description: 'Image size should be less than 2MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await updateProfilePhoto(formData);
      if (result.error) {
        toast({ title: 'Upload Failed', description: result.error, variant: 'destructive' });
      } else if (result.success && result.url) {
        setUrl(result.url);
        toast({ title: 'Success', description: 'Profile photo updated successfully.' });
        router.refresh();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
        <AvatarImage src={url ?? undefined} className="object-cover" />
        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>

      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
