import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import frame1 from '@/assets/frames/frame1.png';
import frame2 from '@/assets/frames/frame2.png';
import frame3 from '@/assets/frames/frame3.png';

const frames = [frame1, frame2, frame3];

const words = ['Moments', 'Passion', 'Memories'];

export default function HomePageHeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000); // change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen w-full bg-black text-white overflow-hidden">
  {/* Background Overlay */}
  <div
    className="absolute inset-0 bg-cover bg-center opacity-40"
    style={{
      backgroundImage:
        'url(https://images.pexels.com/photos/1579708/pexels-photo-1579708.jpeg?auto=compress&cs=tinysrgb&w=1920)',
    }}
  />

  {/* Main Content */}
  <div className="relative z-10 container mx-auto px-6 h-full grid grid-cols-1 md:grid-cols-2 animate-fade-in-left animation-delay-600">
    {/* Left: Centered text */}
    <div className="flex flex-col justify-center items-start h-full space-y-6">
      <h2 className="text-4xl md:text-6xl font-bold leading-tight">
        We Frame Your
        <span className="block text-primary transition-all ">
          {words[index]}
        </span>
      </h2>
      <p className="text-lg md:text-xl text-gray-300 max-w-md">
        Premium picture framing services with over 20 years of craftsmanship excellence.
      </p>
      <Button size="lg" asChild className="text-2xl py-7 border-l-gold hover:backdrop-brightness-50 hover:text-white ">
        <Link to="/products">
          Browse Our Collection
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
    </div>

    {/* Right: Centered image */}
    <div className="flex justify-center items-center h-full m-7">
      <div className="relative w-90 h-90 overflow-hidden shadow-lg p-4">
        <img
          key={frames[index]}
          src={frames[index]}
          alt="Frame"
        className="w-full h-full object-contain p-4 transition-opacity"/>
      </div>
    </div>
  </div>
</section>

  );
}
