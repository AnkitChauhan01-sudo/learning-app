import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Car, MapPin, Star, Shield, Clock, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-black" />
              <span className="ml-2 text-2xl font-bold text-black">RideShare</span>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="text-gray-700 hover:text-black px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-black px-4 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/driver"
                  className="text-gray-700 hover:text-black px-4 py-2 rounded-md text-sm font-medium"
                >
                  Driver
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Ride, Your Way
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book a ride in minutes. Safe, reliable, and affordable transportation at your fingertips.
          </p>
          <SignedOut>
            <div className="flex gap-4 justify-center">
              <Link
                href="/sign-up"
                className="bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
              >
                Get Started
              </Link>
              <Link
                href="/sign-in"
                className="border-2 border-black text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
              >
                Sign In
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800 transition"
            >
              Book a Ride
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose RideShare?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book your ride in just a few taps. Track your driver in real-time.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
              <p className="text-gray-600">
                All drivers are verified and background checked for your safety.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Pickup</h3>
              <p className="text-gray-600">
                Get picked up quickly with our network of nearby drivers.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rated Drivers</h3>
              <p className="text-gray-600">
                Rate and review your experience to help maintain quality service.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reliable Vehicles</h3>
              <p className="text-gray-600">
                Travel in comfort with our well-maintained fleet of vehicles.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-black rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Our support team is always ready to help you with any questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of satisfied riders today.
          </p>
          <SignedOut>
            <Link
              href="/sign-up"
              className="inline-block bg-white text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Sign Up Now
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-block bg-white text-black px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition"
            >
              Book Your First Ride
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Car className="h-6 w-6 text-white" />
              <span className="ml-2 text-xl font-bold text-white">RideShare</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} RideShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
