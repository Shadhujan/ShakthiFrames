import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import logo from '@/assets/SPF-Logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { Shield } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = getTotalItems();


  return (
    <>
      {/* 1. Conditionally render the Admin Bar only if an admin is logged in */}
      {isLoggedIn && user?.role === 'admin' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-400 text-black p-2 flex items-center justify-between text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>You are viewing the site as an Administrator.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="font-bold hover:underline">
              Go to Admin Dashboard
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout} // Use the correct logout handler
              className="h-auto p-1 text-black hover:bg-yellow-500"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm rounded-b-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src={logo}
                alt="Shakthi Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
                Shakthi Picture Framing
              </span>
            </Link>
          </div>

          {/* Center Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/products"
                    className="text-zinc-600 group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-xl font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 "
                  >
                    Products
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/about"
                    className="text-zinc-600 group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-xl font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    About Us
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/contact"
                    className="text-zinc-600 group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-xl font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  >
                    Contact
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Side - Conditional Logic */}
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              // Not logged in - Show Login/Register buttons
              <>
                <Button className="text-xl text-zinc-600" variant="outline" asChild>
                  <Link to="/auth/login">Login</Link>
                </Button>
                <Button asChild className="text-xl hover:backdrop-opacity-60 hover:text-white">
                  <Link to="/auth/register">Register</Link>
                </Button>
              </>
            ) : (
              // Logged in - Show welcome message, cart, and user dropdown
              <>
                <span className="hidden sm:inline text-lg text-gray-600">
                  Welcome, {user?.name}!
                </span>

                {/* Shopping Cart */}
                <Button variant="ghost" size="icon" asChild className="p-3 relative border border-gray-400 hover:bg-gray-100  hover:text-gray-800">
                  <Link to="/cart">
                    <ShoppingCart className="h-5 w-6" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* User Avatar Dropdown */}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className='flex items-center gap-2 border rounded-lg border-gray-400'>
                    <Button variant="ghost" className=" bg-white p-1 hover:bg-gray-100 hover:border-gray-300">
                      <Avatar className="h-5 w-7 ">
                        <AvatarFallback className="bg-white text-lg hover:bg-gray-100">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <UserCircle className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}