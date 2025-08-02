import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

import { IProduct } from '@/types';
import { getProductById } from '@/api/productApi';
import { LoadingPage } from '@/components/shared/LoadingPage';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  // --- STATE MANAGEMENT FOR LIVE DATA ---
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- DATA FETCHING LOGIC ---
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setIsLoading(true);
        try {
          const fetchedProduct = await getProductById(id);
          setProduct(fetchedProduct);
        } catch (error) {
          console.error("Failed to fetch product details:", error);
          // Product will remain null, triggering the "Not Found" UI
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]); // Re-run this effect if the ID in the URL changes

  const handleAddToCart = () => {
    if (!product) return; // Should not happen, but a good safeguard

    if (!isLoggedIn) {
      toast.error('Please log in to add items to your cart');
      navigate('/auth/login');
      return;
    }

    // NOTE: Your addToCart in the store might expect a different shape.
    // Ensure it can handle the IProduct object.
    addToCart(product, 1); // Assuming addToCart takes product and quantity
    toast.success(`${product.name} added to cart!`);
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <LoadingPage />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or may have been removed.</p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  // Use correct property names from IProduct
  const isInStock = product.stockStatus === 'In Stock';
  const imageUrl = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/600';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... Breadcrumb (no changes) ... */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-square overflow-hidden rounded-lg">
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.category}</Badge>
              {isInStock ? (
                <Badge variant="outline" className="text-green-600 border-green-600">In Stock</Badge>
              ) : (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-4xl font-bold text-primary mb-6">${product.price.toFixed(2)}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button onClick={handleAddToCart} disabled={!isInStock} className="w-full h-12 text-lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            {/* ... Other buttons ... */}
          </div>

          {/* Additional Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-medium">SPF-{product._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className={`font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stockStatus}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}