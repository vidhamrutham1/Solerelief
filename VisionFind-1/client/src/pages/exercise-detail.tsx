import { useState } from "react";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  Target,
  CheckCircle,
  Star,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExerciseDetail() {
  const { id } = useParams();
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const DEFAULT_USER_ID = "default-user";
  const today = new Date().toISOString().split('T')[0];

  const { data: exercise } = useQuery({
    queryKey: ["/api/exercises", id],
    queryFn: () => fetch(`/api/exercises/${id}`).then(res => res.json()),
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ["/api/exercise-completions", { userId: DEFAULT_USER_ID, date: today }],
  });

  const completionMutation = useMutation({
    mutationFn: (data: { exerciseId: string; userId: string; duration?: number }) =>
      apiRequest("/api/exercise-completions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise-completions"] });
      toast({
        title: "Exercise Completed!",
        description: "Great job! Your progress has been logged.",
      });
      setIsActive(false);
      setTimeRemaining(0);
    },
  });

  const isCompleted = todayCompletions?.some(c => c.exerciseId === id);

  const startExercise = () => {
    if (!exercise) return;
    setTimeRemaining(exercise.duration);
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseExercise = () => {
    setIsPaused(true);
  };

  const resumeExercise = () => {
    setIsPaused(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(exercise?.duration || 0);
  };

  const completeExercise = () => {
    if (!exercise) return;
    
    const actualDuration = exercise.duration - timeRemaining;
    completionMutation.mutate({
      exerciseId: exercise.id,
      userId: DEFAULT_USER_ID,
      duration: actualDuration
    });
  };

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((time) => {
          if (time <= 1) {
            setIsActive(false);
            completeExercise();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isPaused, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = exercise ? 
    Math.round(((exercise.duration - timeRemaining) / exercise.duration) * 100) : 0;

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading exercise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/exercises">
              <Button variant="ghost" size="sm" data-testid="button-back-to-exercises">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Exercises
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              {exercise.isCore && (
                <Badge className="bg-blue-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Core Exercise
                </Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed Today
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Exercise Image and Timer */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="relative">
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  className="w-full h-64 md:h-80 object-cover rounded-t-lg"
                />
                {exercise.videoUrl && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-black/50 text-white">
                      Video Available
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl">{exercise.name}</CardTitle>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="capitalize">
                    {exercise.category}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {exercise.difficulty}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {Math.floor(exercise.duration / 60)} min
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  {exercise.description}
                </p>

                {/* Timer Section */}
                {isActive && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-6">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {formatTime(timeRemaining)}
                      </div>
                      <Progress value={progressPercentage} className="mb-4" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {progressPercentage}% complete
                      </p>
                    </div>

                    <div className="flex justify-center space-x-4">
                      {isPaused ? (
                        <Button onClick={resumeExercise} data-testid="button-resume">
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      ) : (
                        <Button onClick={pauseExercise} data-testid="button-pause">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button variant="outline" onClick={resetExercise} data-testid="button-reset">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button onClick={completeExercise} data-testid="button-complete">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Now
                      </Button>
                    </div>
                  </div>
                )}

                {/* Start Button */}
                {!isActive && (
                  <div className="text-center mb-6">
                    <Button 
                      onClick={startExercise} 
                      size="lg" 
                      className="bg-green-600 hover:bg-green-700"
                      data-testid="button-start-exercise"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Start Exercise
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions and Info */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line">{exercise.instructions}</p>
                </div>
              </CardContent>
            </Card>

            {/* Exercise Tags */}
            {exercise.tags.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {exercise.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercise Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Exercise Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="font-medium">{Math.floor(exercise.duration / 60)} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <Badge variant="outline" className="capitalize">
                    {exercise.difficulty}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category:</span>
                  <Badge variant="outline" className="capitalize">
                    {exercise.category}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Core Exercise:</span>
                  <span className="font-medium">
                    {exercise.isCore ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}