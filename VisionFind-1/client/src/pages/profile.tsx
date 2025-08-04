import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  User, 
  Target,
  Calendar,
  Save,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    injuryDate: "",
    severityLevel: "moderate",
    goals: [] as string[],
    preferredReminderTimes: [] as string[]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const DEFAULT_USER_ID = "default-user";

  const { data: profile } = useQuery({
    queryKey: ["/api/profile", DEFAULT_USER_ID],
    queryFn: () => fetch(`/api/profile/${DEFAULT_USER_ID}`).then(res => res.json()),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/profile/${DEFAULT_USER_ID}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ title: "Profile updated successfully!" });
      setIsEditing(false);
    },
  });

  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        name: profile.name || "",
        injuryDate: profile.injuryDate || "",
        severityLevel: profile.severityLevel || "moderate",
        goals: profile.goals || [],
        preferredReminderTimes: profile.preferredReminderTimes || []
      });
    }
  }, [profile, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, ""]
    }));
  };

  const updateGoal = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => i === index ? value : goal)
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const addReminderTime = () => {
    setFormData(prev => ({
      ...prev,
      preferredReminderTimes: [...prev.preferredReminderTimes, ""]
    }));
  };

  const updateReminderTime = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      preferredReminderTimes: prev.preferredReminderTimes.map((time, i) => i === index ? value : time)
    }));
  };

  const removeReminderTime = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preferredReminderTimes: prev.preferredReminderTimes.filter((_, i) => i !== index)
    }));
  };

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Personalize your recovery journey
                </p>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Edit Profile
                </CardTitle>
                <CardDescription>
                  Update your personal information and recovery goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className="mt-2"
                      data-testid="input-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="injuryDate">Injury Start Date (Optional)</Label>
                    <Input
                      id="injuryDate"
                      type="date"
                      value={formData.injuryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, injuryDate: e.target.value }))}
                      className="mt-2"
                      data-testid="input-injury-date"
                    />
                  </div>

                  <div>
                    <Label htmlFor="severityLevel">Current Severity Level</Label>
                    <select
                      id="severityLevel"
                      value={formData.severityLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, severityLevel: e.target.value }))}
                      className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                      data-testid="select-severity"
                    >
                      <option value="mild">Mild - Occasional discomfort</option>
                      <option value="moderate">Moderate - Daily pain that affects activities</option>
                      <option value="severe">Severe - Significant pain limiting mobility</option>
                    </select>
                  </div>

                  {/* Recovery Goals */}
                  <div>
                    <Label>Recovery Goals</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                      What do you hope to achieve in your recovery?
                    </p>
                    <div className="space-y-2">
                      {formData.goals.map((goal, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={goal}
                            onChange={(e) => updateGoal(index, e.target.value)}
                            placeholder="Enter a recovery goal..."
                            data-testid={`input-goal-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeGoal(index)}
                            data-testid={`button-remove-goal-${index}`}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addGoal}
                        data-testid="button-add-goal"
                      >
                        + Add Goal
                      </Button>
                    </div>
                  </div>

                  {/* Preferred Reminder Times */}
                  <div>
                    <Label>Preferred Reminder Times</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3">
                      When would you like to receive wellness reminders?
                    </p>
                    <div className="space-y-2">
                      {formData.preferredReminderTimes.map((time, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => updateReminderTime(index, e.target.value)}
                            data-testid={`input-reminder-time-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeReminderTime(index)}
                            data-testid={`button-remove-time-${index}`}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addReminderTime}
                        data-testid="button-add-reminder-time"
                      >
                        + Add Time
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      data-testid="button-save-profile"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      data-testid="button-cancel-edit"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Profile Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</Label>
                      <p className="mt-1 text-lg">{profile?.name || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity Level</Label>
                      <p className="mt-1 text-lg capitalize">{profile?.severityLevel || "Not set"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Injury Date</Label>
                      <p className="mt-1 text-lg">
                        {profile?.injuryDate ? new Date(profile.injuryDate).toLocaleDateString() : "Not set"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</Label>
                      <p className="mt-1 text-lg">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Recovery Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.goals && profile.goals.length > 0 ? (
                    <ul className="space-y-2">
                      {profile.goals.map((goal: string, index: number) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{goal}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No goals set yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Preferred Reminder Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Preferred Reminder Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profile?.preferredReminderTimes && profile.preferredReminderTimes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.preferredReminderTimes.map((time: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-mono"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">No preferred times set</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}