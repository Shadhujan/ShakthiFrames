import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IProduct } from "@/types"; // We get our data shape from here
import { Badge } from '@/components/ui/badge';

// Define the props: this component expects one prop named 'product' of type 'IProduct'
interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Use the first image from the 'images' array, or a default placeholder if the array is empty.
  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://via.placeholder.com/400';

  // Determine if the product is in stock based on the 'stockStatus' property
  const isInStock = product.stockStatus === 'In Stock';

  return (
    // The entire card links to the detail page using the product's '_id' from the database.
    <Link to={`/products/${product._id}`} className="group">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img
              src={imageUrl} // Use the derived imageUrl
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardContent>

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
            {/* Conditionally render the "Out of Stock" badge */}
            {!isInStock && (
              <Badge variant="secondary" className="text-sm">
                Out of Stock
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground">{product.category}</p>
        </CardHeader>

        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            {/* Conditionally render the "In Stock" badge */}
            {isInStock && (
              <Badge variant="outline" className="text-green-600 border-green-600 text-sm">
                In Stock
              </Badge>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}