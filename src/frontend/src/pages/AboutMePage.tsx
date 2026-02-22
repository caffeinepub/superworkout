import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useGetAboutMeContent, useGetCoachProfilePicture } from '../hooks/useQueries';
import { Skeleton } from '../components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AboutMePage() {
  const { data: aboutMeContent, isLoading: contentLoading } = useGetAboutMeContent();
  const { data: profilePicture, isLoading: pictureLoading } = useGetCoachProfilePicture();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profilePicture) {
      const url = profilePicture.getDirectURL();
      setImageUrl(url);
    } else {
      setImageUrl(null);
    }
  }, [profilePicture]);

  const isLoading = contentLoading || pictureLoading;

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl">About Me</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <>
                {imageUrl && (
                  <div className="flex justify-center mb-8">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                      <AvatarImage src={imageUrl} alt="Coach profile" />
                      <AvatarFallback>
                        <User className="h-16 w-16" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                {aboutMeContent ? (
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{aboutMeContent.content}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No content available yet. The coach will introduce themselves soon!
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
