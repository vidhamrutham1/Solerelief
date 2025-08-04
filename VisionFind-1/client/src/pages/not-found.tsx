import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-green-200 dark:text-green-800 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto" data-testid="button-home">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}