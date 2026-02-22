import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ClipboardList, Heart, Utensils, Activity, CheckCircle2, AlertCircle, Info, Share2, Copy, Check } from 'lucide-react';
import { SiFacebook } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { useSaveLifestyleSurveyResult, useGetLifestyleSurveyResult } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { LifestyleSurveyResult } from '../backend';

interface SurveyAnswers {
  smokes: string;
  smokesPerDay: string;
  drinksAlcohol: string;
  drinksPerWeek: string;
  sleepHours: string;
  exercisePerWeek: string;
  balancedDiet: string;
  waterIntake: string;
  frequentStress: string;
}

interface NormalizedResult {
  category: string;
  score: number;
  recommendations: string[];
}

export default function LifestyleSurveyPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { resultId?: string };
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [shareResultId, setShareResultId] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [answers, setAnswers] = useState<SurveyAnswers>({
    smokes: '',
    smokesPerDay: '',
    drinksAlcohol: '',
    drinksPerWeek: '',
    sleepHours: '',
    exercisePerWeek: '',
    balancedDiet: '',
    waterIntake: '',
    frequentStress: '',
  });

  const saveResultMutation = useSaveLifestyleSurveyResult();
  const { data: sharedResult, isLoading: isLoadingSharedResult } = useGetLifestyleSurveyResult(search.resultId);

  // Load shared result if resultId is in URL
  useEffect(() => {
    if (sharedResult) {
      setShowResults(true);
      setShareResultId(sharedResult.id);
    }
  }, [sharedResult]);

  const sections = [
    { id: 0, title: 'Habits', icon: ClipboardList },
    { id: 1, title: 'Nutrition', icon: Utensils },
    { id: 2, title: 'Physical Activity', icon: Activity },
  ];

  const updateAnswer = (key: keyof SurveyAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const calculateResults = (): NormalizedResult => {
    let score = 0;
    const recommendations: string[] = [];

    // Smoking (0-20 points)
    if (answers.smokes === 'no') {
      score += 20;
    } else if (answers.smokes === 'yes') {
      const smokesPerDay = parseInt(answers.smokesPerDay) || 0;
      if (smokesPerDay > 10) {
        score += 0;
        recommendations.push('Reduce smoking significantly or consider quitting for better health');
      } else if (smokesPerDay > 5) {
        score += 5;
        recommendations.push('Try to reduce your smoking intake');
      } else {
        score += 10;
        recommendations.push('Consider quitting smoking to improve your health');
      }
    }

    // Alcohol (0-15 points)
    if (answers.drinksAlcohol === 'no') {
      score += 15;
    } else if (answers.drinksAlcohol === 'yes') {
      const drinksPerWeek = parseInt(answers.drinksPerWeek) || 0;
      if (drinksPerWeek > 7) {
        score += 0;
        recommendations.push('Reduce alcohol intake to improve overall health');
      } else if (drinksPerWeek > 3) {
        score += 7;
        recommendations.push('Consider moderating your alcohol consumption');
      } else {
        score += 12;
      }
    }

    // Sleep (0-20 points)
    const sleepHours = parseFloat(answers.sleepHours) || 0;
    if (sleepHours >= 7 && sleepHours <= 9) {
      score += 20;
    } else if (sleepHours >= 6 && sleepHours < 7) {
      score += 12;
      recommendations.push('Try to get at least 7 hours of sleep for optimal recovery');
    } else if (sleepHours > 9) {
      score += 15;
      recommendations.push('Maintain a consistent sleep schedule');
    } else {
      score += 5;
      recommendations.push('Get at least 7-9 hours of sleep daily for better health');
    }

    // Exercise (0-20 points)
    const exercisePerWeek = parseFloat(answers.exercisePerWeek) || 0;
    if (exercisePerWeek >= 4) {
      score += 20;
    } else if (exercisePerWeek >= 2) {
      score += 12;
      recommendations.push('Try to exercise at least 4 times per week for optimal fitness');
    } else if (exercisePerWeek >= 1) {
      score += 7;
      recommendations.push('Increase your exercise frequency to at least 3-4 times per week');
    } else {
      score += 0;
      recommendations.push('Start exercising regularly - aim for at least 3 times per week');
    }

    // Balanced Diet (0-10 points)
    if (answers.balancedDiet === 'yes') {
      score += 10;
    } else {
      score += 0;
      recommendations.push('Focus on eating a balanced diet with plenty of fruits and vegetables');
    }

    // Water Intake (0-10 points)
    if (answers.waterIntake === 'more-than-2l') {
      score += 10;
    } else if (answers.waterIntake === '1-2l') {
      score += 7;
      recommendations.push('Try to drink more than 2 liters of water daily');
    } else {
      score += 0;
      recommendations.push('Increase your water intake to at least 2 liters per day');
    }

    // Stress (0-5 points)
    if (answers.frequentStress === 'no') {
      score += 5;
    } else {
      score += 0;
      recommendations.push('Practice stress management techniques like meditation or yoga');
    }

    // Determine category based on score (out of 100)
    let category: string;
    if (score >= 75) {
      category = 'Healthy Lifestyle';
    } else if (score >= 50) {
      category = 'Average Lifestyle';
    } else {
      category = 'Needs Improvement';
    }

    return { category, score, recommendations };
  };

  const handleSubmit = async () => {
    const result = calculateResults();
    
    // Generate unique ID and save to backend
    const resultId = `survey-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const summaryMessage = `I scored ${result.score}/100 on the SuperWorkout Lifestyle Survey! My lifestyle is: ${result.category}`;

    const surveyResult: LifestyleSurveyResult = {
      id: resultId,
      score: BigInt(result.score),
      category: result.category,
      recommendations: result.recommendations,
      summaryMessage,
    };

    try {
      await saveResultMutation.mutateAsync(surveyResult);
      setShareResultId(resultId);
      setShowResults(true);
    } catch (error) {
      console.error('Error saving survey result:', error);
      // Still show results even if save fails
      setShowResults(true);
    }
  };

  const handleRetake = () => {
    setAnswers({
      smokes: '',
      smokesPerDay: '',
      drinksAlcohol: '',
      drinksPerWeek: '',
      sleepHours: '',
      exercisePerWeek: '',
      balancedDiet: '',
      waterIntake: '',
      frequentStress: '',
    });
    setCurrentSection(0);
    setShowResults(false);
    setShareResultId(null);
    navigate({ to: '/lifestyle-survey', search: {} });
  };

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/lifestyle-survey?resultId=${shareResultId}`;
  };

  const handleCopyLink = async () => {
    if (!shareResultId) return;
    
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleShareFacebook = () => {
    if (!shareResultId) return;
    
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleShareTwitter = () => {
    if (!shareResultId) return;
    
    const result = normalizeResult(sharedResult || calculateResults());
    const text = encodeURIComponent(`I scored ${result.score}/100 on the SuperWorkout Lifestyle Survey! Check out your lifestyle health:`);
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  // Normalize result to have consistent structure
  const normalizeResult = (result: LifestyleSurveyResult | NormalizedResult): NormalizedResult => {
    if ('score' in result && typeof result.score === 'bigint') {
      // It's a LifestyleSurveyResult from backend
      return {
        category: result.category,
        score: Number(result.score),
        recommendations: result.recommendations,
      };
    }
    // It's already a NormalizedResult
    return result as NormalizedResult;
  };

  const isCurrentSectionComplete = (): boolean => {
    if (currentSection === 0) {
      // Habits section
      if (answers.smokes === '') return false;
      if (answers.smokes === 'yes' && answers.smokesPerDay === '') return false;
      if (answers.drinksAlcohol === '') return false;
      if (answers.drinksAlcohol === 'yes' && answers.drinksPerWeek === '') return false;
      if (answers.sleepHours === '') return false;
      if (answers.frequentStress === '') return false;
      return true;
    } else if (currentSection === 1) {
      // Nutrition section
      return answers.balancedDiet !== '' && answers.waterIntake !== '';
    } else if (currentSection === 2) {
      // Physical Activity section
      return answers.exercisePerWeek !== '';
    }
    return false;
  };

  const isAllComplete = (): boolean => {
    return (
      answers.smokes !== '' &&
      (answers.smokes === 'no' || answers.smokesPerDay !== '') &&
      answers.drinksAlcohol !== '' &&
      (answers.drinksAlcohol === 'no' || answers.drinksPerWeek !== '') &&
      answers.sleepHours !== '' &&
      answers.exercisePerWeek !== '' &&
      answers.balancedDiet !== '' &&
      answers.waterIntake !== '' &&
      answers.frequentStress !== ''
    );
  };

  const progress = ((currentSection + 1) / sections.length) * 100;

  if (isLoadingSharedResult && search.resultId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-pulse">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground">Loading survey results...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const rawResult = sharedResult || calculateResults();
    const result = normalizeResult(rawResult);
    
    const categoryConfig = {
      'Healthy Lifestyle': {
        title: 'Healthy Lifestyle',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        icon: CheckCircle2,
        description: 'Great job! You maintain excellent lifestyle habits.',
      },
      'Average Lifestyle': {
        title: 'Average Lifestyle',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        icon: Info,
        description: 'You have a decent lifestyle with room for improvement.',
      },
      'Needs Improvement': {
        title: 'Needs Improvement',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: AlertCircle,
        description: 'Consider making some changes to improve your health.',
      },
    };

    const config = categoryConfig[result.category as keyof typeof categoryConfig];
    const Icon = config.icon;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Your Lifestyle Results</h1>
              <p className="text-lg text-muted-foreground">
                Based on your responses, here's your lifestyle assessment
              </p>
            </div>

            {/* Results Card */}
            <Card className={`${config.borderColor} ${config.bgColor}`}>
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Icon className={`h-16 w-16 ${config.color}`} />
                </div>
                <CardTitle className="text-3xl">{config.title}</CardTitle>
                <CardDescription className="text-base mt-2">{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score */}
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{result.score}/100</div>
                  <p className="text-sm text-muted-foreground">Overall Lifestyle Score</p>
                </div>

                <Separator />

                {/* Suggestions */}
                {result.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Personalized Recommendations</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground flex-1">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.recommendations.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Excellent! Keep up your healthy lifestyle habits.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Share Results Section */}
                {shareResultId && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Share Your Results</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Share your lifestyle assessment with friends and family
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="flex-1 gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              Copy Link
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleShareFacebook}
                          variant="outline"
                          className="flex-1 gap-2"
                        >
                          <SiFacebook className="h-4 w-4" />
                          Facebook
                        </Button>
                        <Button
                          onClick={handleShareTwitter}
                          variant="outline"
                          className="flex-1 gap-2"
                        >
                          <FaXTwitter className="h-4 w-4" />
                          Twitter/X
                        </Button>
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button onClick={handleRetake} variant="outline" className="flex-1">
                    Retake Survey
                  </Button>
                  <Button onClick={() => navigate({ to: '/' })} className="flex-1">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="mt-6 border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> This lifestyle survey provides general guidance and should not replace
                  professional medical advice. The results are based on self-reported information and general health
                  guidelines. Consult with a healthcare provider for personalized health recommendations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const CurrentSectionIcon = sections[currentSection].icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Lifestyle Survey</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Answer these questions to get personalized insights about your health and lifestyle
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Section {currentSection + 1} of {sections.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Section Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {sections.map((section) => {
              const SectionIcon = section.icon;
              const isActive = currentSection === section.id;
              const isCompleted = section.id < currentSection;

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isCompleted
                        ? 'bg-muted border-border hover:bg-muted/80'
                        : 'bg-background border-border hover:bg-muted/50'
                  }`}
                >
                  <SectionIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                  {isCompleted && <CheckCircle2 className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          {/* Survey Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrentSectionIcon className="h-5 w-5" />
                {sections[currentSection].title}
              </CardTitle>
              <CardDescription>Answer the following questions honestly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Habits Section */}
              {currentSection === 0 && (
                <>
                  {/* Smoking */}
                  <div className="space-y-3">
                    <Label className="text-base">Do you smoke?</Label>
                    <RadioGroup value={answers.smokes} onValueChange={(val) => updateAnswer('smokes', val)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="smokes-yes" />
                        <Label htmlFor="smokes-yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="smokes-no" />
                        <Label htmlFor="smokes-no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Follow-up: Cigarettes per day */}
                  {answers.smokes === 'yes' && (
                    <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                      <Label htmlFor="smokesPerDay">How many cigarettes per day?</Label>
                      <Input
                        id="smokesPerDay"
                        type="number"
                        placeholder="e.g., 5"
                        value={answers.smokesPerDay}
                        onChange={(e) => updateAnswer('smokesPerDay', e.target.value)}
                        min="0"
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Alcohol */}
                  <div className="space-y-3">
                    <Label className="text-base">Do you drink alcohol?</Label>
                    <RadioGroup
                      value={answers.drinksAlcohol}
                      onValueChange={(val) => updateAnswer('drinksAlcohol', val)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="drinks-yes" />
                        <Label htmlFor="drinks-yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="drinks-no" />
                        <Label htmlFor="drinks-no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Follow-up: Drinks per week */}
                  {answers.drinksAlcohol === 'yes' && (
                    <div className="space-y-2 pl-6 border-l-2 border-primary/20">
                      <Label htmlFor="drinksPerWeek">How often per week?</Label>
                      <Input
                        id="drinksPerWeek"
                        type="number"
                        placeholder="e.g., 2"
                        value={answers.drinksPerWeek}
                        onChange={(e) => updateAnswer('drinksPerWeek', e.target.value)}
                        min="0"
                      />
                    </div>
                  )}

                  <Separator />

                  {/* Sleep */}
                  <div className="space-y-2">
                    <Label htmlFor="sleepHours" className="text-base">
                      How many hours do you sleep daily?
                    </Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      placeholder="e.g., 7"
                      value={answers.sleepHours}
                      onChange={(e) => updateAnswer('sleepHours', e.target.value)}
                      min="0"
                      max="24"
                      step="0.5"
                    />
                  </div>

                  <Separator />

                  {/* Stress */}
                  <div className="space-y-3">
                    <Label className="text-base">Do you experience frequent stress?</Label>
                    <RadioGroup
                      value={answers.frequentStress}
                      onValueChange={(val) => updateAnswer('frequentStress', val)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="stress-yes" />
                        <Label htmlFor="stress-yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="stress-no" />
                        <Label htmlFor="stress-no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              {/* Nutrition Section */}
              {currentSection === 1 && (
                <>
                  {/* Balanced Diet */}
                  <div className="space-y-3">
                    <Label className="text-base">Do you follow a balanced diet?</Label>
                    <RadioGroup
                      value={answers.balancedDiet}
                      onValueChange={(val) => updateAnswer('balancedDiet', val)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="diet-yes" />
                        <Label htmlFor="diet-yes" className="font-normal cursor-pointer">
                          Yes
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="diet-no" />
                        <Label htmlFor="diet-no" className="font-normal cursor-pointer">
                          No
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Water Intake */}
                  <div className="space-y-2">
                    <Label htmlFor="waterIntake" className="text-base">
                      How much water do you drink daily?
                    </Label>
                    <Select value={answers.waterIntake} onValueChange={(val) => updateAnswer('waterIntake', val)}>
                      <SelectTrigger id="waterIntake">
                        <SelectValue placeholder="Select water intake" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="less-than-1l">Less than 1 liter</SelectItem>
                        <SelectItem value="1-2l">1-2 liters</SelectItem>
                        <SelectItem value="more-than-2l">More than 2 liters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Physical Activity Section */}
              {currentSection === 2 && (
                <>
                  {/* Exercise Frequency */}
                  <div className="space-y-2">
                    <Label htmlFor="exercisePerWeek" className="text-base">
                      How often do you exercise weekly?
                    </Label>
                    <Input
                      id="exercisePerWeek"
                      type="number"
                      placeholder="e.g., 3"
                      value={answers.exercisePerWeek}
                      onChange={(e) => updateAnswer('exercisePerWeek', e.target.value)}
                      min="0"
                      max="7"
                    />
                    <p className="text-xs text-muted-foreground">Enter the number of days per week</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {currentSection > 0 && (
              <Button onClick={() => setCurrentSection(currentSection - 1)} variant="outline" className="flex-1">
                Previous
              </Button>
            )}
            {currentSection < sections.length - 1 ? (
              <Button
                onClick={() => setCurrentSection(currentSection + 1)}
                disabled={!isCurrentSectionComplete()}
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isAllComplete()} className="flex-1">
                Submit Survey
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
