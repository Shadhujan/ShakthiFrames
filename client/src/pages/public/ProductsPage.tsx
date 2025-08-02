import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
//import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import ProductCard from '@/components/public/ProductCard';
import { IProduct } from '@/types';
import { getProducts } from '@/api/productApi';
import { Filter } from 'lucide-react';
import { LoadingPage } from '@/components/shared/LoadingPage';

export default function ProductsPage() {
  // --- STATE MANAGEMENT FOR REAL DATA ---
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // <-- 2. ADD loading state

  // --- FILTER STATE (No change needed) ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]); // Start with a default range

  // --- API DATA FETCHING ---
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsFromApi = await getProducts();
        setAllProducts(productsFromApi);

        // Dynamically set price range from fetched data
        if (productsFromApi.length > 0) {
          const prices = productsFromApi.map(p => p.price);
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceRange([min, max]);
        }
      } catch (error) {
        console.error("Failed to load products on page", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty array ensures this runs only once on mount

  // --- DERIVE DATA FROM STATE DYNAMICALLY ---
  const minPrice = useMemo(() => allProducts.length > 0 ? Math.floor(Math.min(...allProducts.map(p => p.price))) : 0, [allProducts]);
  const maxPrice = useMemo(() => allProducts.length > 0 ? Math.ceil(Math.max(...allProducts.map(p => p.price))) : 1000, [allProducts]);
  const availableCategories = useMemo(() => [...new Set(allProducts.map(p => p.category))], [allProducts]);

  // Filter products based on selected criteria
  const filteredProducts = useMemo(() => {
    // <-- 3. CHANGE: Filter 'allProducts' instead of 'mockProducts'
    return allProducts.filter(product => {
      const categoryMatch = selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

      return categoryMatch && priceMatch;
    });
  }, [selectedCategories, priceRange, allProducts]); // <-- 4. ADD 'allProducts' to dependency array

  // --- Helper function (No change needed) ---
  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, category]);
    } else {
      setSelectedCategories(prev => prev.filter(c => c !== category));
    }
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <LoadingPage />; // <-- 5. ADD loading state check
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Collection</h1>
        <p className="text-lg text-gray-600">
          Discover our premium selection of picture frames and framing solutions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-xl" />
                <Label className="text-xl font-semibold mb-3 block">
                  Filter
              </Label>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Label className="text-base font-semibold mb-3 block">
                  Category
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      handleCategoryChange(category, !selectedCategories.includes(category))
                    }
                    className={`px-3 py-1 rounded-full border-white text-sm ${
                      selectedCategories.includes(category)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 '
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <Separator />

              {/* Price Range Filter */}
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Price Range
                </Label>
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={maxPrice}
                    min={minPrice}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategories.length > 0 || priceRange[0] > minPrice || priceRange[1] < maxPrice) && (
                <div>
                  <Separator className="mb-3" />
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setPriceRange([minPrice, maxPrice]);
                    }}
                    className="text-base text-amber-50 hover:text-primary/80 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Content - Product Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Products ({filteredProducts.length})
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters to see more results.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}