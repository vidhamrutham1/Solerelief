import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  Filter, 
  Clock,
  Play,
  ArrowLeft,
  Star,
  CheckCircle
} from "lucide-react";

export default function ExerciseLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const DEFAULT_USER_ID = "default-user";
  const today = new Date().toISOString().split('T')[0];

  const { data: exercises, isLoading } = useQuery({
    queryKey: ["/api/exercises", { 
      category: selectedCategory || undefined,
      difficulty: selectedDifficulty || undefined
    }],
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ["/api/exercise-completions", { userId: DEFAULT_USER_ID, date: today }],
  });

  const filteredExercises = exercises?.filter(exercise => 
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const categories = [
    { value: "", label: "All Categories" },
    { value: "stretching", label: "Stretching" },
    { value: "strengthening", label: "Strengthening" },
    { value: "massage", label: "Massage" }
  ];

  const difficulties = [
    { value: "", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  const isExerciseCompleted = (exerciseId: string) => {
    return todayCompletions?.some(c => c.exerciseId === exerciseId);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exercise Library</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Curated exercises for plantar fasciitis recovery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-exercises"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  data-testid={`button-category-${category.value || 'all'}`}
                >
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Difficulty Filters */}
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty.value}
                  variant={selectedDifficulty === difficulty.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty.value)}
                  data-testid={`button-difficulty-${difficulty.value || 'all'}`}
                >
                  {difficulty.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises?.map((exercise) => (
              <Card key={exercise.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/exercise/${exercise.id}`}>
                      <Button size="sm" className="bg-white/90 text-gray-900 hover:bg-white" data-testid={`button-play-${exercise.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Exercise
                      </Button>
                    </Link>
                  </div>

                  {/* Completed Badge */}
                  {isExerciseCompleted(exercise.id) && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  )}

                  {/* Core Exercise Badge */}
                  {exercise.isCore && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Core
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {exercise.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      {Math.floor(exercise.duration / 60)} min
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {exercise.difficulty}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {exercise.category}
                    </Badge>
                    <Link href={`/exercise/${exercise.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-${exercise.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredExercises?.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No exercises found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {exercises?.length || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Exercises</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {exercises?.filter(e => e.isCore).length || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Core Exercises</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center p-6">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {todayCompletions?.length || 0}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Completed Today</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}