import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VisualSearchProps {
  onResults?: (results: any) => void;
}

export default function VisualSearch({ onResults }: VisualSearchProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest('POST', '/api/visual-search', formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Search Complete",
        description: `Found ${data.results.length} similar products`,
      });
      onResults?.(data);
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
      console.error('Visual search error:', error);
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start search
    searchMutation.mutate(file);
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className={`upload-area transition-all duration-200 ${dragActive ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-8">
          {searchMutation.isPending ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Image</h3>
              <p className="text-gray-600">Searching for similar products...</p>
            </div>
          ) : uploadedImage ? (
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded for search" 
                  className="max-h-48 rounded-lg"
                  data-testid="img-uploaded"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2"
                  onClick={clearImage}
                  data-testid="button-clear-image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Image Uploaded</h3>
              <p className="text-gray-600">Search completed! Check results below.</p>
            </div>
          ) : (
            <div
              className="text-center cursor-pointer"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={openFileDialog}
              data-testid="upload-area"
            >
              <div className="mb-6">
                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Product Image</h3>
                <p className="text-gray-600">Drag and drop an image or click to browse</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  type="button"
                  className="inline-flex items-center"
                  data-testid="button-choose-image"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <span>or</span>
                </div>
                
                <Button 
                  variant="outline" 
                  type="button"
                  className="inline-flex items-center"
                  data-testid="button-take-photo"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                Supported formats: PNG, JPG, WebP • Max size: 10MB
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
        data-testid="input-file"
      />
    </div>
  );
}
