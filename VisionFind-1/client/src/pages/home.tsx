import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { 
  Activity, 
  Calendar, 
  Clock, 
  Heart, 
  Target, 
  TrendingUp,
  Play,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Home() {
  const DEFAULT_USER_ID = "default-user";
  const today = new Date().toISOString().split('T')[0];

  const { data: coreExercises } = useQuery({
    queryKey: ["/api/exercises", { isCore: true }],
  });

  const { data: reminders } = useQuery({
    queryKey: ["/api/reminders", { userId: DEFAULT_USER_ID }],
  });

  const { data: todayProgress } = useQuery({
    queryKey: ["/api/progress", today, { userId: DEFAULT_USER_ID }],
  });

  const { data: recentProgress } = useQuery({
    queryKey: ["/api/progress", { userId: DEFAULT_USER_ID, limit: 7 }],
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ["/api/exercise-completions", { userId: DEFAULT_USER_ID, date: today }],
  });

  const completedToday = todayCompletions?.length || 0;
  const targetExercises = coreExercises?.length || 4;
  const progressPercentage = Math.round((completedToday / targetExercises) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SoleRelief</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your plantar fasciitis recovery companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/profile">
                <Button variant="outline" size="sm" data-testid="button-profile">
                  Profile
                </Button>
              </Link>
              <Link href="/reminders">
                <Button variant="outline" size="sm" data-testid="button-reminders">
                  <Clock className="h-4 w-4 mr-2" />
                  Reminders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Ready to continue your recovery journey?
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{completedToday}/{targetExercises}</div>
              <p className="text-green-100 mb-3">Exercises completed</p>
              <Progress value={progressPercentage} className="bg-green-400" />
              <p className="text-sm text-green-100 mt-2">{progressPercentage}% complete</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <Activity className="h-5 w-5 mr-2" />
                Pain Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {todayProgress?.painLevel || 'Not logged'}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {todayProgress?.painLevel ? 'out of 10' : 'Log your pain level'}
              </p>
              <Link href="/progress">
                <Button variant="outline" size="sm" data-testid="button-log-pain">
                  {todayProgress?.painLevel ? 'Update' : 'Log Now'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <TrendingUp className="h-5 w-5 mr-2" />
                Weekly Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">5</div>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Days active</p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Great job!
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Today's Core Exercises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Core Exercises</span>
                <Link href="/exercises">
                  <Button variant="ghost" size="sm" data-testid="button-view-all-exercises">
                    View All
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Essential stretches for your plantar fasciitis recovery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {coreExercises?.slice(0, 4).map((exercise) => {
                  const isCompleted = todayCompletions?.some(c => c.exerciseId === exercise.id);
                  return (
                    <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{exercise.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.floor(exercise.duration / 60)} min • {exercise.difficulty}
                          </p>
                        </div>
                      </div>
                      <Link href={`/exercise/${exercise.id}`}>
                        <Button size="sm" variant="ghost" data-testid={`button-exercise-${exercise.id}`}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
              {completedToday < targetExercises && (
                <div className="mt-4 pt-4 border-t">
                  <Link href="/exercises">
                    <Button className="w-full" data-testid="button-start-exercises">
                      Start Today's Session
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Reminders</span>
                <Link href="/reminders">
                  <Button variant="ghost" size="sm" data-testid="button-manage-reminders">
                    Manage
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Your scheduled wellness activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders?.filter(r => r.isActive).slice(0, 4).map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{reminder.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reminder.time} • {reminder.type}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
              {!reminders?.some(r => r.isActive) && (
                <div className="text-center py-6">
                  <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">No active reminders</p>
                  <Link href="/reminders">
                    <Button variant="outline" size="sm" className="mt-2" data-testid="button-setup-reminders">
                      Set Up Reminders
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/exercises">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full mb-3">
                  <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Exercises</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View library</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Progress</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track recovery</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reminders">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full mb-3">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Reminders</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stay consistent</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex flex-col items-center text-center p-6">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full mb-3">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Personal goals</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}