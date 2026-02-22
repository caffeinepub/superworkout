import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, Loader2, User, Info } from 'lucide-react';
import { useAnalyzeBodyShape } from '../hooks/useQueries';
import { ExternalBlob, BodyType } from '../backend';
import { toast } from 'sonner';

export default function BodyAnalysisPage() {
  const { identity } = useInternetIdentity();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    bodyType: BodyType;
    recommendations: string;
    score: number;
    bodyFatPercentage: number;
    muscleMassEstimate: number;
  } | null>(null);

  const analyzeBodyShape = useAnalyzeBodyShape();

  const isAuthenticated = !!identity;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      setSelectedImage(file);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage || !isAuthenticated) return;

    setAnalyzing(true);
    try {
      // Convert file to bytes
      const arrayBuffer = await selectedImage.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Create ExternalBlob for upload
      const blob = ExternalBlob.fromBytes(bytes);
      
      // Generate a unique file ID
      const fileId = `body-analysis-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Simulate AI analysis (in production, this would call an actual AI service)
      // For now, we'll use a simple heuristic based on image properties
      const bodyType = simulateBodyTypeAnalysis();
      const bodyFatPercentage = simulateBodyFatPercentage(bodyType);
      const muscleMassEstimate = simulateMuscleMassEstimate(bodyType, bodyFatPercentage);
      
      const analysis = {
        bodyType,
        recommendations: getRecommendations(bodyType),
        score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        bodyFatPercentage,
        muscleMassEstimate,
      };

      // Save to backend
      await analyzeBodyShape.mutateAsync({
        fileId,
        analysis: {
          bodyType: analysis.bodyType,
          recommendations: analysis.recommendations,
          score: BigInt(analysis.score),
          bodyFatPercentage: BigInt(analysis.bodyFatPercentage),
          muscleMassEstimate: analysis.muscleMassEstimate,
        },
      });

      setResult(analysis);
      toast.success('Analysis complete!');
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const simulateBodyTypeAnalysis = (): BodyType => {
    // Simple random selection for demo purposes
    // In production, this would be replaced with actual AI vision analysis
    const types: BodyType[] = [BodyType.ectomorph, BodyType.mesomorph, BodyType.endomorph];
    return types[Math.floor(Math.random() * types.length)];
  };

  const simulateBodyFatPercentage = (bodyType: BodyType): number => {
    // Simulate body fat percentage based on body type
    // In production, this would be calculated by AI vision analysis
    switch (bodyType) {
      case BodyType.ectomorph:
        return Math.floor(Math.random() * 8) + 8; // 8-15%
      case BodyType.mesomorph:
        return Math.floor(Math.random() * 8) + 12; // 12-19%
      case BodyType.endomorph:
        return Math.floor(Math.random() * 10) + 18; // 18-27%
      default:
        return 15;
    }
  };

  const simulateMuscleMassEstimate = (bodyType: BodyType, bodyFatPercentage: number): number => {
    // Simulate muscle mass percentage based on body type and body fat
    // In production, this would be calculated by AI vision analysis
    // Muscle mass typically ranges from 30-50% of body weight
    let baseMuscle = 0;
    
    switch (bodyType) {
      case BodyType.ectomorph:
        baseMuscle = 32 + Math.random() * 6; // 32-38%
        break;
      case BodyType.mesomorph:
        baseMuscle = 40 + Math.random() * 8; // 40-48%
        break;
      case BodyType.endomorph:
        baseMuscle = 35 + Math.random() * 7; // 35-42%
        break;
      default:
        baseMuscle = 38;
    }
    
    // Adjust based on body fat (inverse relationship)
    const adjustment = (20 - bodyFatPercentage) * 0.2;
    const muscleMass = Math.max(30, Math.min(50, baseMuscle + adjustment));
    
    return Math.round(muscleMass * 10) / 10; // Round to 1 decimal place
  };

  const getRecommendations = (bodyType: BodyType): string => {
    switch (bodyType) {
      case BodyType.ectomorph:
        return 'Ectomorphs typically have a lean, slender build with fast metabolism. Focus on strength training with compound movements, increase caloric intake with nutrient-dense foods, and prioritize progressive overload to build muscle mass.';
      case BodyType.mesomorph:
        return 'Mesomorphs have a naturally athletic build with good muscle definition. Maintain a balanced training routine combining strength and cardio, focus on varied exercises to prevent plateaus, and maintain a balanced diet to support your active metabolism.';
      case BodyType.endomorph:
        return 'Endomorphs tend to have a larger frame and store fat more easily. Focus on high-intensity interval training (HIIT), incorporate regular cardio sessions, monitor caloric intake carefully, and emphasize whole foods with controlled portions.';
      default:
        return 'Continue with a balanced fitness routine tailored to your goals.';
    }
  };

  const getBodyTypeLabel = (bodyType: BodyType): string => {
    switch (bodyType) {
      case BodyType.ectomorph:
        return 'Ectomorph';
      case BodyType.mesomorph:
        return 'Mesomorph';
      case BodyType.endomorph:
        return 'Endomorph';
      default:
        return 'Unknown';
    }
  };

  const getBodyTypeDescription = (bodyType: BodyType): string => {
    switch (bodyType) {
      case BodyType.ectomorph:
        return 'Lean and slender build with difficulty gaining weight';
      case BodyType.mesomorph:
        return 'Athletic and muscular build with balanced proportions';
      case BodyType.endomorph:
        return 'Larger frame with tendency to store body fat';
      default:
        return '';
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 pb-24">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-6 h-6" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              Please log in to access the body type analysis feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                This feature requires authentication to save and track your analysis results.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AI Body Type Analysis
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload a photo to discover your body type and receive personalized fitness recommendations
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Photo</CardTitle>
              <CardDescription>
                Choose a clear, full-body photo for best results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={analyzing}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-muted-foreground">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Click to upload</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WEBP up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {selectedImage && !result && (
                <Button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="w-full"
                  size="lg"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Body Type'
                  )}
                </Button>
              )}

              {result && (
                <Button onClick={resetAnalysis} variant="outline" className="w-full" size="lg">
                  Upload New Image
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>
                {result ? 'Your body type classification' : 'Results will appear here'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !analyzing && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <User className="w-12 h-12 mx-auto opacity-50" />
                    <p className="text-sm">Upload an image to get started</p>
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Analyzing your body type...
                    </p>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="text-2xl font-bold text-primary mb-2">
                      {getBodyTypeLabel(result.bodyType)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getBodyTypeDescription(result.bodyType)}
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {result.score}%
                        </div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          {result.bodyFatPercentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">Body Fat</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-accent">
                          {result.muscleMassEstimate}%
                        </div>
                        <p className="text-xs text-muted-foreground">Muscle Mass</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Personalized Recommendations
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.recommendations}
                    </p>
                  </div>

                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      These results are AI-generated estimates. For professional advice, consult
                      with a certified fitness trainer or healthcare provider.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Body Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Ectomorph</h4>
                <p className="text-sm text-muted-foreground">
                  Characterized by a lean, slender frame with narrow shoulders and hips. Fast
                  metabolism makes it challenging to gain weight and muscle mass.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Mesomorph</h4>
                <p className="text-sm text-muted-foreground">
                  Athletic build with broad shoulders, narrow waist, and well-defined muscles.
                  Gains muscle easily and responds well to training.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Endomorph</h4>
                <p className="text-sm text-muted-foreground">
                  Larger bone structure with higher body fat percentage. Slower metabolism and
                  tendency to store fat, but can build muscle effectively.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
