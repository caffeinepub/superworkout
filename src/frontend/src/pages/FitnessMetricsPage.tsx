import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, RotateCcw } from 'lucide-react';

export default function FitnessMetricsPage() {
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [bmi, setBmi] = useState<number | null>(null);
  const [bodyFat, setBodyFat] = useState<number | null>(null);

  // Calculate BMI and Body Fat whenever inputs change
  useEffect(() => {
    if (height && weight && age && gender) {
      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);
      const ageNum = parseFloat(age);

      if (heightNum > 0 && weightNum > 0 && ageNum > 0) {
        // Calculate BMI: weight (kg) / (height (m))^2
        const heightInMeters = heightNum / 100;
        const calculatedBmi = weightNum / (heightInMeters * heightInMeters);
        setBmi(calculatedBmi);

        // Calculate Body Fat % using standard formulas
        let calculatedBodyFat: number;
        if (gender === 'M') {
          // Male formula: (1.20 × BMI) + (0.23 × Age) - 16.2
          calculatedBodyFat = 1.2 * calculatedBmi + 0.23 * ageNum - 16.2;
        } else {
          // Female formula: (1.20 × BMI) + (0.23 × Age) - 5.4
          calculatedBodyFat = 1.2 * calculatedBmi + 0.23 * ageNum - 5.4;
        }
        setBodyFat(Math.max(0, calculatedBodyFat)); // Ensure non-negative
      } else {
        setBmi(null);
        setBodyFat(null);
      }
    } else {
      setBmi(null);
      setBodyFat(null);
    }
  }, [height, weight, age, gender]);

  const getBmiCategory = (bmiValue: number): { category: string; color: string } => {
    if (bmiValue < 18.5) {
      return { category: 'Underweight', color: 'text-blue-500' };
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      return { category: 'Normal weight', color: 'text-green-500' };
    } else if (bmiValue >= 25 && bmiValue < 30) {
      return { category: 'Overweight', color: 'text-yellow-500' };
    } else {
      return { category: 'Obese', color: 'text-red-500' };
    }
  };

  const getBodyFatCategory = (bodyFatValue: number, genderValue: string): { category: string; color: string } => {
    if (genderValue === 'M') {
      if (bodyFatValue < 6) {
        return { category: 'Essential fat', color: 'text-blue-500' };
      } else if (bodyFatValue >= 6 && bodyFatValue < 14) {
        return { category: 'Athletes', color: 'text-green-500' };
      } else if (bodyFatValue >= 14 && bodyFatValue < 18) {
        return { category: 'Fitness', color: 'text-green-500' };
      } else if (bodyFatValue >= 18 && bodyFatValue < 25) {
        return { category: 'Average', color: 'text-yellow-500' };
      } else {
        return { category: 'Obese', color: 'text-red-500' };
      }
    } else {
      if (bodyFatValue < 14) {
        return { category: 'Essential fat', color: 'text-blue-500' };
      } else if (bodyFatValue >= 14 && bodyFatValue < 21) {
        return { category: 'Athletes', color: 'text-green-500' };
      } else if (bodyFatValue >= 21 && bodyFatValue < 25) {
        return { category: 'Fitness', color: 'text-green-500' };
      } else if (bodyFatValue >= 25 && bodyFatValue < 32) {
        return { category: 'Average', color: 'text-yellow-500' };
      } else {
        return { category: 'Obese', color: 'text-red-500' };
      }
    }
  };

  const handleReset = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setGender('');
    setBmi(null);
    setBodyFat(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Fitness Metrics Calculator</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Calculate your Body Mass Index (BMI) and Body Fat Percentage to track your fitness journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Measurements</CardTitle>
                <CardDescription>Enter your details to calculate your fitness metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="e.g., 30"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleReset} variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </CardContent>
            </Card>

            {/* Results Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Results</CardTitle>
                <CardDescription>Calculated fitness metrics based on your measurements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {bmi !== null && bodyFat !== null ? (
                  <>
                    {/* BMI Result */}
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Body Mass Index (BMI)</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">{bmi.toFixed(1)}</div>
                        <div className={`text-sm font-medium ${getBmiCategory(bmi).color}`}>
                          {getBmiCategory(bmi).category}
                        </div>
                      </div>
                    </div>

                    {/* Body Fat Result */}
                    <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Body Fat Percentage</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">{bodyFat.toFixed(1)}%</div>
                        <div className={`text-sm font-medium ${getBodyFatCategory(bodyFat, gender).color}`}>
                          {getBodyFatCategory(bodyFat, gender).category}
                        </div>
                      </div>
                    </div>

                    {/* BMI Categories Reference */}
                    <div className="space-y-2 pt-4 border-t">
                      <h4 className="text-sm font-semibold">BMI Categories</h4>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Underweight:</span>
                          <span>&lt; 18.5</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Normal weight:</span>
                          <span>18.5 - 24.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Overweight:</span>
                          <span>25 - 29.9</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Obese:</span>
                          <span>≥ 30</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calculator className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Enter your measurements to see your fitness metrics
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <Card className="mt-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Disclaimer:</strong> These calculations provide general estimates and should not replace
                professional medical advice. BMI and body fat percentage are screening tools and may not accurately
                reflect health status for all individuals, especially athletes or those with high muscle mass. Consult
                with a healthcare provider for personalized health assessments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
