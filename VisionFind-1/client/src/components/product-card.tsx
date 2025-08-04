import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const rating = parseFloat(product.rating || "0");
  
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="product-card cursor-pointer h-full overflow-hidden" data-testid={`card-product-${product.id}`}>
        <CardContent className="p-0">
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              data-testid={`img-product-${product.id}`}
            />
          </div>
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2" data-testid={`text-name-${product.id}`}>
                {product.name}
              </h3>
              <span className="text-lg font-bold text-gray-900 ml-2" data-testid={`text-price-${product.id}`}>
                ${product.price}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500" data-testid={`text-reviews-${product.id}`}>
                  ({product.reviewCount})
                </span>
              </div>
              <Badge 
                variant={product.inStock ? "default" : "destructive"} 
                className="text-xs"
                data-testid={`badge-stock-${product.id}`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
