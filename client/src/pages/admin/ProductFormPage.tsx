import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save, X } from 'lucide-react';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { LoadingPage } from '@/components/shared/LoadingPage';

import { useAuthStore } from '@/store/authStore';
import { createProduct, getProductById, updateProduct, uploadImage } from '@/api/productApi';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Please enter a category'),
  stockStatus: z.enum(['In Stock', 'Out of Stock']),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore.getState();
  const isEditing = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditing);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: { name: '', description: '', price: 0, category: '', stockStatus: 'In Stock' },
  });

  const { handleSubmit, formState: { isValid, isSubmitting }, reset, control } = form;

useEffect(() => {
    // This 'if' block only runs on the edit page, not the 'new' page
    if (isEditing && id) {
      setIsLoading(true);
      const fetchProductData = async () => {
        try {
          const productData = await getProductById(id);
          console.log("DATA RECEIVED FROM API:", productData);

          reset(productData);

          setExistingImageUrls(productData.images || []);
        } catch (error) {
          toast.error('Product not found or failed to load data.');
          navigate('/admin/products');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProductData();
    }
  }, [id, isEditing, reset, navigate]);

  const handleRemoveExistingImage = (urlToRemove: string) => {
    setExistingImageUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (!token) throw new Error("Authentication Error.");

      let finalImageUrls = [...existingImageUrls];

      if (newImageFiles.length > 0) {
        toast.info("Uploading new images... Please wait.");
        const uploadedUrls = await Promise.all(
          newImageFiles.map(file => uploadImage(file, token))
        );
        finalImageUrls.push(...uploadedUrls);
      }

      if (finalImageUrls.length === 0) {
        toast.error("A product must have at least one image.");
        return;
      }

      const completeData = { ...data, images: finalImageUrls };

      if (isEditing && id) {
        await updateProduct(id, completeData, token);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(completeData, token);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');

    } catch (error) {
      toast.error(`Error: Failed to save product.`);
      console.error(error);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="space-y-8 Px-4 py-8 max-w-6xl mx-auto ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-lg text-gray-600">{isEditing ? `Editing product: ${form.getValues('name')}` : 'Create a new product for your catalog'}</p>
          </div>
          <Button variant="outline" asChild className=''><Link to="/admin/products"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Products</Link></Button>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader><CardTitle className="text-2xl">Product Information</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">

                    {/* --- NAME --- */}
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Classic Gold Frame" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* --- PRICE --- */}
                    <FormField
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* --- CATEGORY --- */}
                    <FormField
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., frames, mats" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* --- STOCK STATUS --- */}
                    <FormField
                      control={control}
                      name="stockStatus"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <FormLabel className="text-base font-medium">In Stock</FormLabel>
                            <p className="text-sm text-muted-foreground">Toggle product availability</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === 'In Stock'}
                              onCheckedChange={(checked) => field.onChange(checked ? 'In Stock' : 'Out of Stock')}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">

                    {/* --- DESCRIPTION --- */}
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter detailed product description..."
                              className="resize-none"
                              rows={6}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ... Your ImageUploader section (no changes needed here) ... */}
                    <div>
                      <FormLabel>Product Images</FormLabel>
                      {isEditing && existingImageUrls.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-2 text-gray-700">Current Images:</p>
                            <div className="flex flex-wrap gap-2">
                                {existingImageUrls.map((url) => (
                                  <div key={url} className="relative group">
                                    <img src={url} alt="Existing product" className="h-24 w-24 rounded-md object-cover" />
                                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100" onClick={() => handleRemoveExistingImage(url)}><X className="h-4 w-4" /></Button>
                                  </div>
                                ))}
                            </div>
                        </div>
                      )}
                      <ImageUploader files={newImageFiles} setFiles={setNewImageFiles} />
                    </div>
                  </div>
                </div>

                {/* Form Actions (no changes needed here) */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => navigate('/admin/products')} disabled={isSubmitting}><X className="h-4 w-4 mr-2" /> Cancel</Button>
                  <Button type="submit" disabled={!isValid || isSubmitting} className="min-w-[140px]">{isSubmitting ? 'Saving...' : <><Save className="h-4 w-4 mr-2" />{isEditing ? 'Update Product' : 'Create Product'}</>}</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}