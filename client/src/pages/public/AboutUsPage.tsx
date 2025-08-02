import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Award, Users, Heart, Star } from 'lucide-react';

export default function AboutUsPage() {
  const teamMembers = [
    {
      name: "Rajesh Kumar",
      role: "Master Craftsman & Founder",
      initials: "RK",
      experience: "25+ years"
    },
    {
      name: "Priya Sharma",
      role: "Design Specialist",
      initials: "PS",
      experience: "12+ years"
    },
    {
      name: "Arjun Patel",
      role: "Custom Framing Expert",
      initials: "AP",
      experience: "8+ years"
    },
    {
      name: "Meera Singh",
      role: "Customer Relations Manager",
      initials: "MS",
      experience: "6+ years"
    }
  ];

  const achievements = [
    {
      icon: Award,
      title: "Excellence Award",
      description: "Chennai Chamber of Commerce 2023"
    },
    {
      icon: Users,
      title: "10,000+ Happy Customers",
      description: "Serving the community since 1999"
    },
    {
      icon: Heart,
      title: "Family Business",
      description: "Passed down through generations"
    },
    {
      icon: Star,
      title: "5-Star Rating",
      description: "Consistently rated by customers"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in-up">
              Our Story & Craftsmanship
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed animate-fade-in-up animation-delay-200">
              For over two decades, Shakthi Picture Framing has been preserving precious memories 
              with unmatched quality and attention to detail. Our journey began with a simple 
              passion for craftsmanship and has evolved into Chennai's most trusted framing service.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 lg:order-1 animate-fade-in-left">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/1579727/pexels-photo-1579727.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Craftsman working on a frame"
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground p-6 rounded-lg shadow-lg">
                  <div className="text-3xl font-bold">25+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 animate-fade-in-right">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                A Legacy of Excellence
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 1999 by master craftsman Rajesh Kumar, Shakthi Picture Framing 
                  began as a small workshop with a big vision: to provide Chennai with the 
                  finest picture framing services available.
                </p>
                <p>
                  What started as a one-man operation has grown into a team of skilled 
                  artisans, each bringing their unique expertise to every project. We've 
                  framed everything from family portraits to priceless artwork, always 
                  with the same commitment to quality and customer satisfaction.
                </p>
                <p>
                  Today, we combine traditional hand-crafting techniques with modern 
                  technology to deliver frames that not only protect your memories but 
                  enhance them for generations to come.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Our Achievements
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Recognition and milestones that reflect our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {achievement.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
              Meet Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              The skilled artisans and professionals who bring your vision to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card 
                key={index} 
                className="text-center p-6 hover:shadow-lg transition-shadow duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="pt-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src="" alt={member.name} />
                    <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {member.role}
                  </p>
                  <Badge variant="outline" className="text-primary border-primary">
                    {member.experience}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 animate-fade-in-up">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="animate-fade-in-up">
                <h3 className="text-2xl font-semibold mb-4">Quality First</h3>
                <p className="opacity-90">
                  We never compromise on materials or craftsmanship, ensuring every frame meets our exacting standards.
                </p>
              </div>
              <div className="animate-fade-in-up animation-delay-200">
                <h3 className="text-2xl font-semibold mb-4">Customer Focus</h3>
                <p className="opacity-90">
                  Your satisfaction is our priority. We listen, understand, and deliver exactly what you envision.
                </p>
              </div>
              <div className="animate-fade-in-up animation-delay-400">
                <h3 className="text-2xl font-semibold mb-4">Innovation</h3>
                <p className="opacity-90">
                  We continuously evolve our techniques and offerings to provide the best possible service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}