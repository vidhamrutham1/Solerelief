import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Clock, 
  Plus,
  Edit,
  Trash2,
  Bell,
  BellOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reminders() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "stretch",
    title: "",
    message: "",
    time: "",
    days: [] as string[],
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const DEFAULT_USER_ID = "default-user";

  const { data: reminders } = useQuery({
    queryKey: ["/api/reminders", { userId: DEFAULT_USER_ID }],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/reminders", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Reminder created successfully!" });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/reminders/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Reminder updated successfully!" });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/reminders/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({ title: "Reminder deleted successfully!" });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "stretch",
      title: "",
      message: "",
      time: "",
      days: [],
      isActive: true
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message || !formData.time || formData.days.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const data = {
      ...formData,
      userId: DEFAULT_USER_ID
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (reminder: any) => {
    setFormData({
      type: reminder.type,
      title: reminder.title,
      message: reminder.message,
      time: reminder.time,
      days: reminder.days,
      isActive: reminder.isActive
    });
    setEditingId(reminder.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const weekDays = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" }
  ];

  const reminderTypes = [
    { value: "stretch", label: "Stretch Session" },
    { value: "walk", label: "Walking Reminder" },
    { value: "check-in", label: "Progress Check-in" }
  ];

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reminders</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your wellness notifications
                </p>
              </div>
            </div>
            <Button onClick={() => setIsCreating(true)} data-testid="button-add-reminder">
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingId ? "Edit Reminder" : "Create New Reminder"}
              </CardTitle>
              <CardDescription>
                Set up personalized wellness notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="type">Reminder Type</Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                      data-testid="select-type"
                    >
                      {reminderTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      className="mt-2"
                      data-testid="input-time"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Morning Stretch Session"
                    className="mt-2"
                    data-testid="input-title"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="e.g., Time for your daily stretches!"
                    className="mt-2"
                    data-testid="input-message"
                  />
                </div>

                <div>
                  <Label>Days of Week</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {weekDays.map(day => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={formData.days.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDay(day.value)}
                        data-testid={`button-day-${day.value}`}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    data-testid="switch-active"
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-reminder"
                  >
                    {editingId ? "Update" : "Create"} Reminder
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reminders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reminders?.map((reminder) => (
            <Card key={reminder.id} className={`${reminder.isActive ? '' : 'opacity-60'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{reminder.title}</CardTitle>
                  <div className="flex items-center space-x-1">
                    {reminder.isActive ? (
                      <Bell className="h-4 w-4 text-green-500" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <CardDescription>{reminder.message}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                    <Badge variant="outline" className="font-mono">
                      {reminder.time}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Type:</span>
                    <Badge variant="secondary" className="capitalize">
                      {reminder.type}
                    </Badge>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-2">Days:</span>
                    <div className="flex flex-wrap gap-1">
                      {reminder.days.map(day => (
                        <Badge key={day} variant="outline" className="text-xs capitalize">
                          {day.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <Badge variant={reminder.isActive ? "default" : "secondary"}>
                      {reminder.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(reminder)}
                        data-testid={`button-edit-${reminder.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(reminder.id)}
                        data-testid={`button-delete-${reminder.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reminders?.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Reminders Set
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first reminder to stay on track with your recovery
            </p>
            <Button onClick={() => setIsCreating(true)} data-testid="button-create-first-reminder">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Reminder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}