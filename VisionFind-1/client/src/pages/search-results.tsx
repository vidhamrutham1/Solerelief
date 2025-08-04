import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import SEOHead from "@/components/seo-head";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SearchResults() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedCategory, setSelectedCategory] = useState(category);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/search', { q: query, category: selectedCategory }],
    enabled: !!query,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`Search Results for "${query}" | VisualFind Pro`}
        description={`Find industrial products matching "${query}". Browse our extensive catalog of professional tools and equipment.`}
        keywords={`${query}, industrial products, search results, professional tools`}
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" data-testid="button-back">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-search-title">
              Search Results for "{query}"
            </h1>
            <p className="text-gray-600" data-testid="text-results-count">
              {products.length} products found
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48" data-testid="select-category">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by Relevance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Sort by Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-products">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search terms or browse our categories.
                  </p>
                  <Link href="/">
                    <Button>Browse All Products</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
