
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import ProductCard from '@/components/public/ProductCard';
import { Award, Clock, Shield, ArrowRight } from 'lucide-react';
import { getLatestProducts } from '@/api/productApi';
import { IProduct } from '@/types';
import HomePageHeroSection from '@/components/public/HomePageHeroSection';

export default function HomePage() {
const [latestProducts, setLatestProducts] = useState<IProduct[]>([]);

  useEffect(() => {
    getLatestProducts(4).then(setLatestProducts);
  }, []);

  return (
    <div className="">
      {/* Hero Section */}
      <section className="">
        <HomePageHeroSection />
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Featured Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Discover our most popular frames, carefully crafted to showcase your precious memories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {latestProducts.map((product, index) => (
              <div
                key={product._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Why Choose Shakthi Picture Framing?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              We combine traditional craftsmanship with modern techniques to deliver exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Premium Quality */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-4">Premium Quality</CardTitle>
                <p className="text-gray-600 leading-relaxed">
                  We use only the finest materials and archival-quality components to ensure your frames last for generations.
                </p>
              </CardContent>
            </Card>

            {/* Expert Craftsmanship */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up animation-delay-200">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-4">Expert Craftsmanship</CardTitle>
                <p className="text-gray-600 leading-relaxed">
                  Our skilled artisans bring over 20 years of experience to every frame, ensuring perfect results every time.
                </p>
              </CardContent>
            </Card>

            {/* Fast Turnaround */}
            <Card className="text-center p-8 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up animation-delay-400">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-4">Fast Turnaround</CardTitle>
                <p className="text-gray-600 leading-relaxed">
                  Most custom frames are completed within 5-7 business days, so you can enjoy your memories sooner.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
            Ready to Frame Your Memories?
          </h2>
          <p className="text-xl mb-8 opacity-90 animate-fade-in-up animation-delay-200">
            Visit our showroom or browse our collection online to get started
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button variant="secondary" size="lg" asChild className="text-gray-800 border-white hover:bg-white hover:text-primary">
              <Link to="/products">Shop Now</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-gray-800 border-white hover:bg-white hover:text-primary">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}