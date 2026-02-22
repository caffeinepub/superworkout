import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle2, Dumbbell, Heart, Users, Zap } from 'lucide-react';
import { useGetGalleryImages, useGetLikeCount, useHasCallerLiked, useLikeWebsite } from '../hooks/useQueries';
import { toast } from 'sonner';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: galleryImages = [] } = useGetGalleryImages();
  const { data: likeCount = BigInt(0) } = useGetLikeCount();
  const { data: hasLiked = false } = useHasCallerLiked();
  const likeWebsite = useLikeWebsite();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like the website');
      return;
    }

    if (hasLiked) {
      toast.error('You have already liked the website');
      return;
    }

    try {
      await likeWebsite.mutateAsync();
      toast.success('Thanks for the love!');
    } catch (error: any) {
      if (error.message?.includes('already liked')) {
        toast.error('You have already liked the website');
      } else if (error.message?.includes('Unauthorized')) {
        toast.error('Please login to like the website');
      } else {
        toast.error('Failed to like');
      }
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Transform Your Body with{' '}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Calisthenics
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Master the art of bodyweight training and unlock your true potential with expert guidance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/booking' })} className="text-lg px-8">
                  Book Your Session
                </Button>
                <Button
                  size="lg"
                  variant={hasLiked ? 'secondary' : 'outline'}
                  onClick={handleLike}
                  disabled={likeWebsite.isPending || hasLiked}
                  className="text-lg px-8"
                >
                  <Heart className={`mr-2 h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
                  Like ({Number(likeCount)})
                </Button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/generated/trainer-hero.dim_800x600.jpg"
                alt="Calisthenics Training"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Calisthenics?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the incredible benefits of bodyweight training
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: 'No Equipment Needed',
                description: 'Train anywhere, anytime with just your bodyweight',
              },
              {
                icon: Dumbbell,
                title: 'Build Real Strength',
                description: 'Develop functional strength that translates to everyday life',
              },
              {
                icon: Users,
                title: 'For Everyone',
                description: 'Suitable for all fitness levels, from beginners to advanced',
              },
              {
                icon: CheckCircle2,
                title: 'Proven Results',
                description: 'Achieve incredible physique and performance gains',
              },
            ].map((benefit, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trainer Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl order-2 lg:order-1">
              <img
                src="/assets/photomania-f0948f99794bc2be344abdb49e680e88.jpg"
                alt="Professional Trainer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold">Meet Your Coach</h2>
              <p className="text-lg text-muted-foreground">
                With over 10 years of experience in calisthenics and bodyweight training, I've helped hundreds of clients achieve their fitness goals. My approach combines proven techniques with personalized guidance to ensure you get the results you deserve.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Certified Professional</h4>
                    <p className="text-muted-foreground">
                      Multiple certifications in fitness training and nutrition
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Proven Track Record</h4>
                    <p className="text-muted-foreground">Hundreds of successful client transformations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Personalized Approach</h4>
                    <p className="text-muted-foreground">Custom programs tailored to your goals and abilities</p>
                  </div>
                </div>
              </div>
              <Button size="lg" onClick={() => navigate({ to: '/about' })} className="mt-4">
                Learn More About Me
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Makes Our Programs Special</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience training that's designed specifically for your success
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Progressive Training',
                description: 'Structured programs that gradually increase in difficulty, ensuring consistent progress without plateaus.',
              },
              {
                title: 'Skill Development',
                description: 'Master impressive calisthenics skills like muscle-ups, handstands, and human flags with expert guidance.',
              },
              {
                title: 'Holistic Approach',
                description: 'Combine strength training with mobility work and nutrition guidance for complete body transformation.',
              },
            ].map((program, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{program.title}</h3>
                  <p className="text-muted-foreground">{program.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Gallery</h2>
              <p className="text-lg text-muted-foreground">See our training in action</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image) => (
                <div key={image.id} className="relative h-64 rounded-xl overflow-hidden shadow-lg group">
                  <img
                    src={image.image.getDirectURL()}
                    alt={image.description}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {image.description && (
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
                      <p className="text-sm font-medium">{image.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-background">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Book your first training session today and take the first step towards your fitness goals.
          </p>
          <Button size="lg" onClick={() => navigate({ to: '/booking' })} className="text-lg px-8">
            Book Your Session Now
          </Button>
        </div>
      </section>
    </div>
  );
}
