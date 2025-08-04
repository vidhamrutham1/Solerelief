import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SEOHead from "@/components/seo-head";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-xl"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
                <Link href="/">
                  <Button>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.imageUrl];

  return (
    <>
      <SEOHead 
        title={`${product.name} - ${product.category} | VisualFind Pro`}
        description={product.description}
        keywords={`${product.name}, ${product.category}, ${product.tags?.join(', ')}`}
        image={product.imageUrl}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Product Images */}
                <div className="p-6">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                    <img 
                      src={images[selectedImageIndex]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      data-testid="img-product-main"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <div 
                        key={index}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${
                          selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                        data-testid={`img-thumbnail-${index}`}
                      >
                        <img 
                          src={image} 
                          alt={`${product.name} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6 space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-product-name">
                      {product.name}
                    </h1>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <i 
                            key={i} 
                            className={`fas fa-star text-sm ${
                              i < Math.floor(parseFloat(product.rating || "0")) ? '' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600" data-testid="text-reviews">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl font-bold text-gray-900" data-testid="text-price">
                        ${product.price}
                      </span>
                      <Badge variant={product.inStock ? "default" : "destructive"} data-testid="badge-stock">
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600" data-testid="text-description">
                      {product.description}
                    </p>
                  </div>

                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                        <div className="space-y-2">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-medium text-gray-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex space-x-4">
                    <Button 
                      className="flex-1" 
                      disabled={!product.inStock}
                      data-testid="button-request-quote"
                    >
                      Request Quote
                    </Button>
                    <Button variant="outline" size="icon" data-testid="button-favorite">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" data-testid="button-share">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {product.brand && (
                    <div className="text-sm text-gray-500" data-testid="text-brand">
                      Brand: {product.brand}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </>
  );
}
