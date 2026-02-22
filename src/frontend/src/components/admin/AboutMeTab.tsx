import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useGetAboutMeContent, useSetAboutMeContent, useGetCoachProfilePicture, useSetCoachProfilePicture } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Save, Upload, User } from 'lucide-react';
import { ExternalBlob } from '../../backend';

export default function AboutMeTab() {
  const { data: aboutMeContent } = useGetAboutMeContent();
  const { data: profilePicture } = useGetCoachProfilePicture();
  const setAboutMeContent = useSetAboutMeContent();
  const setCoachProfilePicture = useSetCoachProfilePicture();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (aboutMeContent) {
      setContent(aboutMeContent.content);
    } else {
      setContent('');
    }
  }, [aboutMeContent]);

  useEffect(() => {
    if (profilePicture) {
      const url = profilePicture.getDirectURL();
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  }, [profilePicture]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      await setAboutMeContent.mutateAsync(content.trim());
      toast.success('About Me content updated successfully');
    } catch (error) {
      toast.error('Failed to update About Me content');
      console.error(error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await setCoachProfilePicture.mutateAsync(blob);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Coach Profile Picture</CardTitle>
          <CardDescription>Upload and manage your profile picture for the About Me page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 border-4 border-primary/20">
              <AvatarImage src={imageUrl || undefined} alt="Coach profile" />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <Label htmlFor="profile-picture" className="cursor-pointer">
                <Button type="button" variant="outline" disabled={isUploading} asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Picture'}
                  </span>
                </Button>
              </Label>
              <Input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Recommended: Square image, at least 400x400px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About Me Content</CardTitle>
          <CardDescription>Manage the content for your About Me page</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Introduce yourself to your clients..."
                rows={15}
                className="resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Share your story, experience, certifications, and what makes your training approach unique.
              </p>
            </div>
            <Button type="submit" disabled={setAboutMeContent.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {setAboutMeContent.isPending ? 'Saving...' : 'Save Content'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
