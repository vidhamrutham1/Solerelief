import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Save,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Progress() {
  const [painLevel, setPainLevel] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoggingToday, setIsLoggingToday] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const DEFAULT_USER_ID = "default-user";
  const today = new Date().toISOString().split('T')[0];

  const { data: todayProgress } = useQuery({
    queryKey: ["/api/progress", today, { userId: DEFAULT_USER_ID }],
  });

  const { data: recentProgress } = useQuery({
    queryKey: ["/api/progress", { userId: DEFAULT_USER_ID, limit: 30 }],
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ["/api/exercise-completions", { userId: DEFAULT_USER_ID, date: today }],
  });

  const progressMutation = useMutation({
    mutationFn: (data: { 
      userId: string; 
      date: string; 
      painLevel: number; 
      exercisesCompleted: number;
      notes?: string;
    }) => apiRequest("/api/progress", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({
        title: "Progress Logged!",
        description: "Your daily progress has been saved.",
      });
      setIsLoggingToday(false);
      setPainLevel("");
      setNotes("");
    },
  });

  const handleLogProgress = () => {
    if (!painLevel) {
      toast({
        title: "Pain Level Required",
        description: "Please select your current pain level.",
        variant: "destructive",
      });
      return;
    }

    progressMutation.mutate({
      userId: DEFAULT_USER_ID,
      date: today,
      painLevel: parseInt(painLevel),
      exercisesCompleted: todayCompletions?.length || 0,
      notes: notes || undefined
    });
  };

  const painLevelOptions = [
    { value: 1, label: "No Pain", color: "bg-green-500" },
    { value: 2, label: "Very Mild", color: "bg-green-400" },
    { value: 3, label: "Mild", color: "bg-yellow-400" },
    { value: 4, label: "Mild-Moderate", color: "bg-yellow-500" },
    { value: 5, label: "Moderate", color: "bg-orange-400" },
    { value: 6, label: "Moderate-Severe", color: "bg-orange-500" },
    { value: 7, label: "Severe", color: "bg-red-400" },
    { value: 8, label: "Very Severe", color: "bg-red-500" },
    { value: 9, label: "Extremely Severe", color: "bg-red-600" },
    { value: 10, label: "Worst Possible", color: "bg-red-700" }
  ];

  const getProgressTrend = () => {
    if (!recentProgress || recentProgress.length < 2) return null;
    
    const recent = recentProgress.slice(0, 7);
    const avgRecent = recent.reduce((sum, entry) => sum + entry.painLevel, 0) / recent.length;
    
    const older = recentProgress.slice(7, 14);
    if (older.length === 0) return null;
    
    const avgOlder = older.reduce((sum, entry) => sum + entry.painLevel, 0) / older.length;
    
    return avgRecent < avgOlder ? 'improving' : avgRecent > avgOlder ? 'worsening' : 'stable';
  };

  const trend = getProgressTrend();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress Tracking</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor your recovery journey
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Today's Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            {todayProgress ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Today's Progress
                  </CardTitle>
                  <CardDescription>
                    Logged on {new Date(today).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {todayProgress.painLevel}/10
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Pain Level</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {todayProgress.exercisesCompleted}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Exercises Done</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {todayProgress.walkingSteps || 0}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Steps Taken</p>
                    </div>
                  </div>
                  {todayProgress.notes && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Notes:</h4>
                      <p className="text-gray-700 dark:text-gray-300">{todayProgress.notes}</p>
                    </div>
                  )}
                  <div className="mt-4">
                    <Button
                      onClick={() => setIsLoggingToday(true)}
                      variant="outline"
                      data-testid="button-update-progress"
                    >
                      Update Today's Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Log Today's Progress
                  </CardTitle>
                  <CardDescription>
                    How are you feeling today?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setIsLoggingToday(true)}
                    className="w-full"
                    data-testid="button-log-progress"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Progress
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Progress Entry Form */}
            {isLoggingToday && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Log Your Progress</CardTitle>
                  <CardDescription>
                    Please rate your current pain level and add any notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Pain Level (1-10)</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      1 = No pain, 10 = Worst possible pain
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {painLevelOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={painLevel === option.value.toString() ? "default" : "outline"}
                          onClick={() => setPainLevel(option.value.toString())}
                          className="h-auto p-3 flex flex-col"
                          data-testid={`button-pain-${option.value}`}
                        >
                          <div className={`w-4 h-4 rounded-full ${option.color} mb-1`}></div>
                          <div className="text-lg font-bold">{option.value}</div>
                          <div className="text-xs">{option.label}</div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="How are you feeling? Any improvements or concerns?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-2"
                      data-testid="textarea-notes"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={handleLogProgress}
                      disabled={progressMutation.isPending}
                      data-testid="button-save-progress"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {progressMutation.isPending ? "Saving..." : "Save Progress"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsLoggingToday(false);
                        setPainLevel("");
                        setNotes("");
                      }}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Pain Level:</span>
                    <span className="font-medium">
                      {recentProgress?.length ? 
                        (recentProgress.slice(0, 7).reduce((sum, entry) => sum + entry.painLevel, 0) / 
                         Math.min(7, recentProgress.length)).toFixed(1) : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Days Logged:</span>
                    <span className="font-medium">{recentProgress?.slice(0, 7).length || 0}/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trend:</span>
                    <div className="flex items-center">
                      {trend === 'improving' && (
                        <>
                          <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-600">Improving</span>
                        </>
                      )}
                      {trend === 'worsening' && (
                        <>
                          <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-600">Needs Attention</span>
                        </>
                      )}
                      {trend === 'stable' && (
                        <span className="text-gray-600">Stable</span>
                      )}
                      {!trend && (
                        <span className="text-gray-400">Insufficient Data</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {todayCompletions?.length || 0}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">Completed</p>
                  <Link href="/exercises">
                    <Button variant="outline" size="sm" className="mt-3" data-testid="button-view-exercises">
                      View Exercises
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Progress History */}
        <Card>
          <CardHeader>
            <CardTitle>Progress History</CardTitle>
            <CardDescription>
              Your recovery journey over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentProgress?.length ? (
              <div className="space-y-3">
                {recentProgress.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Pain:</span>
                        <Badge variant={entry.painLevel <= 3 ? "default" : entry.painLevel <= 6 ? "secondary" : "destructive"}>
                          {entry.painLevel}/10
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Exercises:</span>
                        <Badge variant="outline">{entry.exercisesCompleted}</Badge>
                      </div>
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Progress Data Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start logging your daily progress to track your recovery
                </p>
                <Button onClick={() => setIsLoggingToday(true)} data-testid="button-start-logging">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}