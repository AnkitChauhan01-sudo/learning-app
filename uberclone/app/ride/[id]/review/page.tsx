'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ArrowLeft } from 'lucide-react';

interface Ride {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  fare: string | null;
  status: string;
  driver?: {
    vehicleModel: string;
    vehicleColor: string;
    vehiclePlate: string;
  };
}

export default function ReviewPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const rideId = params.id as string;
  const [ride, setRide] = useState<Ride | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReview, setExistingReview] = useState<{ rating: number; comment?: string | null } | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchRide();
      fetchReview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, rideId]);

  const fetchRide = async () => {
    try {
      const response = await fetch('/api/rides');
      const data = await response.json();
      if (data.rides) {
        const foundRide = data.rides.find((item: { ride: Ride; driver?: Ride['driver'] }) => item.ride.id === rideId);
        if (foundRide) {
          setRide({
            ...foundRide.ride,
            driver: foundRide.driver,
          });
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching ride:', error);
      setIsLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      const response = await fetch(`/api/reviews?rideId=${rideId}`);
      const data = await response.json();
      if (data.review) {
        setExistingReview(data.review);
        setRating(data.review.rating);
        setComment(data.review.comment || '');
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId,
          rating,
          comment,
        }),
      });

      const data = await response.json();
      if (data.review) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!ride) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ride not found</h2>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Go back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-700 hover:text-black">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6">Rate Your Ride</h2>

          {existingReview ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You&apos;ve already reviewed this ride.</p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {comment && (
                <p className="text-gray-700 mb-4 italic">&quot;{comment}&quot;</p>
              )}
              <Link
                href="/dashboard"
                className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Ride Details</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>From:</strong> {ride.pickupAddress}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>To:</strong> {ride.dropoffAddress}
                </p>
                {ride.driver && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Vehicle:</strong> {ride.driver.vehicleColor}{' '}
                      {ride.driver.vehicleModel}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Plate:</strong> {ride.driver.vehiclePlate}
                    </p>
                  </>
                )}
                {ride.fare && (
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Fare:</strong> ${parseFloat(ride.fare).toFixed(2)}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-10 w-10 transition ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Share your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

