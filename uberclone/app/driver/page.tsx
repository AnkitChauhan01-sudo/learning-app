'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, MapPin, Star } from 'lucide-react';

interface Driver {
  id: string;
  licenseNumber: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  isAvailable: boolean;
  rating: string | null;
  totalRides: number | null;
}

interface Ride {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: string;
  pickupLng: string;
  dropoffLat: string;
  dropoffLng: string;
  status: string;
  fare: string | null;
  distance: string | null;
  duration: number | null;
  createdAt: string;
  rider?: {
    name: string;
    email: string;
  };
}

export default function DriverDashboard() {
  const { user, isLoaded } = useUser();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRides, setPendingRides] = useState<Ride[]>([]);
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [formData, setFormData] = useState({
    licenseNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    vehiclePlate: '',
  });

  useEffect(() => {
    if (isLoaded && user) {
      createUserIfNeeded();
      fetchDriver();
      fetchPendingRides();
      fetchMyRides();
    }
  }, [isLoaded, user]);

  const createUserIfNeeded = async () => {
    try {
      await fetch('/api/users', { method: 'POST' });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const fetchDriver = async () => {
    try {
      const response = await fetch('/api/drivers');
      const data = await response.json();
      if (data.driver) {
        setDriver(data.driver);
        setFormData({
          licenseNumber: data.driver.licenseNumber,
          vehicleModel: data.driver.vehicleModel,
          vehicleColor: data.driver.vehicleColor,
          vehiclePlate: data.driver.vehiclePlate,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching driver:', error);
      setIsLoading(false);
    }
  };

  const fetchPendingRides = async () => {
    try {
      const response = await fetch('/api/drivers/pending');
      const data = await response.json();
      if (data.rides) {
        setPendingRides(data.rides);
      }
    } catch (error) {
      console.error('Error fetching pending rides:', error);
    }
  };

  const fetchMyRides = async () => {
    try {
      const response = await fetch('/api/drivers/rides');
      const data = await response.json();
      if (data.rides) {
        const formattedRides = data.rides.map((item: { ride: Ride; rider?: Ride['rider'] }) => ({
          ...item.ride,
          rider: item.rider,
        }));
        setMyRides(formattedRides);
      }
    } catch (error) {
      console.error('Error fetching my rides:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const response = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.driver) {
        setDriver(data.driver);
        fetchPendingRides();
      }
    } catch (error) {
      console.error('Error registering driver:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAcceptRide = async (rideId: string) => {
    try {
      const response = await fetch('/api/drivers/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rideId }),
      });

      const data = await response.json();
      if (data.ride) {
        fetchPendingRides();
        fetchMyRides();
        fetchDriver();
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
    }
  };

  const handleUpdateStatus = async (rideId: string, status: string) => {
    try {
      await fetch(`/api/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchMyRides();
      fetchDriver();
    } catch (error) {
      console.error('Error updating ride status:', error);
    }
  };

  const toggleAvailability = async () => {
    if (!driver) return;
    try {
      const response = await fetch('/api/drivers/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !driver.isAvailable }),
      });

      const data = await response.json();
      if (data.driver) {
        setDriver(data.driver);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  if (!isLoaded || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Car className="h-8 w-8 text-black" />
              <span className="ml-2 text-2xl font-bold text-black">RideShare</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-black px-4 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-black px-4 py-2 rounded-md text-sm font-medium"
              >
                Book a Ride
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!driver ? (
          /* Driver Registration Form */
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-6">Become a Driver</h2>
            <p className="text-gray-600 mb-8">
              Register your vehicle and start earning with RideShare.
            </p>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Model
                </label>
                <input
                  type="text"
                  required
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                  placeholder="e.g., Toyota Camry"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Color
                </label>
                <input
                  type="text"
                  required
                  value={formData.vehicleColor}
                  onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                  placeholder="e.g., Black"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Plate Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.vehiclePlate}
                  onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                  placeholder="e.g., ABC-1234"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isRegistering ? 'Registering...' : 'Register as Driver'}
              </button>
            </form>
          </div>
        ) : (
          /* Driver Dashboard */
          <div className="space-y-6">
            {/* Driver Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Driver Dashboard</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">
                        {driver.rating ? parseFloat(driver.rating).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      {driver.totalRides || 0} rides completed
                    </span>
                  </div>
                </div>
                <button
                  onClick={toggleAvailability}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    driver.isAvailable
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  {driver.isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold">
                    {driver.vehicleColor} {driver.vehicleModel}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plate</p>
                  <p className="font-semibold">{driver.vehiclePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">License</p>
                  <p className="font-semibold">{driver.licenseNumber}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Rides */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Available Rides</h3>
                <div className="space-y-4">
                  {pendingRides.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No pending rides</p>
                  ) : (
                    pendingRides.map((ride) => (
                      <div key={ride.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold capitalize">{ride.status}</span>
                          {ride.fare && (
                            <span className="text-sm font-bold">${parseFloat(ride.fare).toFixed(2)}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {ride.pickupAddress}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {ride.dropoffAddress}
                        </p>
                        {driver.isAvailable && (
                          <button
                            onClick={() => handleAcceptRide(ride.id)}
                            className="w-full bg-black text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                          >
                            Accept Ride
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* My Rides */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">My Rides</h3>
                <div className="space-y-4">
                  {myRides.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No rides yet</p>
                  ) : (
                    myRides.slice(0, 10).map((ride) => (
                      <div key={ride.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold capitalize">{ride.status}</span>
                          {ride.fare && (
                            <span className="text-sm font-bold">${parseFloat(ride.fare).toFixed(2)}</span>
                          )}
                        </div>
                        {ride.rider && (
                          <p className="text-xs text-gray-600 mb-1">Rider: {ride.rider.name}</p>
                        )}
                        <p className="text-xs text-gray-600 mb-1">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {ride.pickupAddress}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          <MapPin className="inline h-3 w-3 mr-1" />
                          {ride.dropoffAddress}
                        </p>
                        <div className="flex gap-2">
                          {ride.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(ride.id, 'in_progress')}
                              className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-blue-600 transition"
                            >
                              Start Ride
                            </button>
                          )}
                          {ride.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateStatus(ride.id, 'completed')}
                              className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xs font-semibold hover:bg-green-600 transition"
                            >
                              Complete Ride
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(ride.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

