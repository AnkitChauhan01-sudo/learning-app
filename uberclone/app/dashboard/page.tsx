'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Map from '@/components/Map';
import AutocompleteInput from '@/components/AutocompleteInput';
import { Car, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Ride {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  fare: string | null;
  distance: string | null;
  duration: number | null;
  createdAt: string;
  driver?: {
    vehicleModel: string;
    vehicleColor: string;
    vehiclePlate: string;
  };
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      createUserIfNeeded();
      fetchRides();
    }
  }, [isLoaded, user]);

  const createUserIfNeeded = async () => {
    try {
      await fetch('/api/users', { method: 'POST' });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const fetchRides = async () => {
    try {
      const response = await fetch('/api/rides');
      const data = await response.json();
      if (data.rides) {
        const formattedRides = data.rides.map((item: { ride: Ride; driver?: Ride['driver'] }) => ({
          ...item.ride,
          driver: item.driver,
        }));
        setRides(formattedRides);
        const pendingRide = formattedRides.find((r: Ride) => 
          r.status === 'pending' || r.status === 'accepted' || r.status === 'in_progress'
        );
        if (pendingRide) {
          setActiveRide(pendingRide);
        }
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  };

  const calculateFare = async (pickup: Location, dropoff: Location) => {
    if (typeof google === 'undefined') return;
    try {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickup,
          destination: dropoff,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result && result.routes[0] && result.routes[0].legs[0]) {
            const route = result.routes[0];
            const leg = route.legs[0];
            const distanceInKm = leg.distance?.value ? leg.distance.value / 1000 : 0;
            const durationInMinutes = leg.duration?.value ? Math.ceil(leg.duration.value / 60) : 0;
            
            // Simple fare calculation: $2 base + $1.5 per km + $0.5 per minute
            const calculatedFare = 2 + distanceInKm * 1.5 + durationInMinutes * 0.5;
            
            setDistance(distanceInKm);
            setDuration(durationInMinutes);
            setFare(calculatedFare);
          }
        }
      );
    } catch (error) {
      console.error('Error calculating fare:', error);
    }
  };

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      calculateFare(pickupLocation, dropoffLocation);
    }
  }, [pickupLocation, dropoffLocation]);

  const handleBookRide = async () => {
    if (!pickupLocation || !dropoffLocation || !fare) return;

    setIsBooking(true);
    try {
      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickupLat: pickupLocation.lat,
          pickupLng: pickupLocation.lng,
          pickupAddress: pickupLocation.address,
          dropoffLat: dropoffLocation.lat,
          dropoffLng: dropoffLocation.lng,
          dropoffAddress: dropoffLocation.address,
          fare,
          distance,
          duration,
        }),
      });

      const data = await response.json();
      if (data.ride) {
        setActiveRide(data.ride);
        setPickupLocation(null);
        setDropoffLocation(null);
        setFare(null);
        setDistance(null);
        setDuration(null);
        fetchRides();
      }
    } catch (error) {
      console.error('Error booking ride:', error);
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelRide = async (rideId: string) => {
    try {
      await fetch(`/api/rides/${rideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setActiveRide(null);
      fetchRides();
    } catch (error) {
      console.error('Error cancelling ride:', error);
    }
  };

  if (!isLoaded) {
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
                href="/driver"
                className="text-gray-700 hover:text-black px-4 py-2 rounded-md text-sm font-medium"
              >
                Become a Driver
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Book a Ride</h2>
              
              {!activeRide ? (
                <>
                  <div className="space-y-4 mb-6">
                    <AutocompleteInput
                      label="Pickup Location"
                      value={pickupLocation?.address || ''}
                      onChange={setPickupLocation}
                      placeholder="Enter pickup address"
                    />
                    <AutocompleteInput
                      label="Dropoff Location"
                      value={dropoffLocation?.address || ''}
                      onChange={setDropoffLocation}
                      placeholder="Enter dropoff address"
                    />
                  </div>

                  {pickupLocation && dropoffLocation && fare && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-semibold">{distance?.toFixed(2)} km</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{duration} minutes</span>
                      </div>
                      <div className="flex items-center justify-between border-t pt-2 mt-2">
                        <span className="text-lg font-semibold">Estimated Fare:</span>
                        <span className="text-2xl font-bold text-black">${fare.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBookRide}
                    disabled={!pickupLocation || !dropoffLocation || !fare || isBooking}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {isBooking ? 'Booking...' : 'Book Ride'}
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block bg-yellow-100 rounded-full p-4 mb-4">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {activeRide.status === 'pending' && 'Waiting for driver...'}
                      {activeRide.status === 'accepted' && 'Driver on the way!'}
                      {activeRide.status === 'in_progress' && 'Ride in progress'}
                      {activeRide.status === 'completed' && 'Ride completed'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {activeRide.pickupAddress}
                    </p>
                    <p className="text-gray-600 mb-4">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {activeRide.dropoffAddress}
                    </p>
                    {activeRide.driver && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="font-semibold">Driver Details:</p>
                        <p>{activeRide.driver.vehicleColor} {activeRide.driver.vehicleModel}</p>
                        <p>Plate: {activeRide.driver.vehiclePlate}</p>
                      </div>
                    )}
                    {activeRide.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRide(activeRide.id)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Cancel Ride
                      </button>
                    )}
                    {activeRide.status === 'completed' && (
                      <Link
                        href={`/ride/${activeRide.id}/review`}
                        className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Rate & Review
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Map</h3>
              <Map
                pickupLocation={pickupLocation || undefined}
                dropoffLocation={dropoffLocation || undefined}
                onPickupChange={setPickupLocation}
                onDropoffChange={setDropoffLocation}
              />
            </div>
          </div>

          {/* Ride History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Ride History</h3>
              <div className="space-y-4">
                {rides.slice(0, 10).map((ride) => (
                  <div key={ride.id} className="border-b pb-4 last:border-0">
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
                    <p className="text-xs text-gray-600">
                      <MapPin className="inline h-3 w-3 mr-1" />
                      {ride.dropoffAddress}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </p>
                    {ride.status === 'completed' && (
                      <Link
                        href={`/ride/${ride.id}/review`}
                        className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                      >
                        Rate & Review
                      </Link>
                    )}
                  </div>
                ))}
                {rides.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No rides yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

