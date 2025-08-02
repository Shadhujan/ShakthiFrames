// ----------------- START OF FINAL FILE -----------------

import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

import { IProduct } from '@/types';
import { getProducts, deleteProduct } from '@/api/productApi';
import { useAuthStore } from '@/store/authStore';
import { LoadingPage } from '@/components/shared/LoadingPage';

export default function AdminProductsPage() {
  // --- STATE MANAGEMENT ---
  const [allProducts, setAllProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const { token } = useAuthStore.getState();

  // --- DATA FETCHING & DELETION ---
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setAllProducts(data);
    } catch (error) {
      console.error("Failed to fetch products for admin page", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        if (!token) throw new Error('Authentication token not found.');
        await deleteProduct(productId, token);
        alert('Product deleted successfully!');
        fetchProducts(); // Refresh the list after deletion
      } catch (error) {
        alert('Failed to delete product.');
        console.error(error);
      }
    }
  };

  // --- MEMOIZED FILTERING & PAGINATION ---
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // --- RENDER LOGIC ---
  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Products Management</h1>
          <p className="text-lg text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <Button onClick={() => navigate('/admin/products/new')}>
          <Plus className="h-4 w-4" /> Add New Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader><CardTitle className="text-xl">Product Filters</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader><CardTitle className="text-xl">All Products</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Image</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Stock Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product._id} className="hover:bg-gray-50">
                  <TableCell>
                    <img
                      src={product.images[0] || '/placeholder.jpg'} // Use first image or placeholder
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-semibold text-primary">${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.stockStatus === 'In Stock' ? 'default' : 'destructive'}>
                      {product.stockStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/products/edit/${product._id}`}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {paginatedProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
