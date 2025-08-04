import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import ExerciseLibrary from "@/pages/exercise-library";
import ExerciseDetail from "@/pages/exercise-detail";
import Progress from "@/pages/progress";
import Reminders from "@/pages/reminders";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/exercises" component={ExerciseLibrary} />
      <Route path="/exercise/:id" component={ExerciseDetail} />
      <Route path="/progress" component={Progress} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
