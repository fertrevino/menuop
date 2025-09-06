"use client";

import { useSubscriptionData } from "@/hooks/useSubscriptionData";

interface Price {
  id: string;
  currency: string;
  unitAmount: number;
  formattedPrice: string;
  interval: string;
  intervalCount: number;
}

interface MarketingFeature {
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  active: boolean;
  price: Price | null;
  metadata: Record<string, string>;
  marketing_features?: MarketingFeature[];
}

export default function SubscriptionPlans() {
  const {
    plans,
    currentSubscription,
    isLoading: loading,
    error,
    refreshData,
  } = useSubscriptionData();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-start justify-center w-full py-16">
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="relative bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 w-full"
              >
                {/* Popular/Best Value Badge Skeleton */}
                <div className="absolute -top-4 -right-4">
                  <div className="bg-gradient-to-r from-gray-600 to-gray-700 h-6 w-20 rounded-full animate-pulse" />
                </div>

                {/* Title Skeleton */}
                <div className="h-7 bg-gray-600 rounded-md w-3/4 mb-2 animate-pulse" />

                {/* Price Skeleton */}
                <div className="mb-6 space-y-2">
                  <div className="h-9 bg-gray-600 rounded-md w-1/2 animate-pulse" />
                  <div className="h-4 bg-gray-600 rounded-md w-1/3 animate-pulse" />
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-gray-600 rounded-md w-full animate-pulse" />
                  <div className="h-4 bg-gray-600 rounded-md w-5/6 animate-pulse" />
                </div>

                {/* Features Skeleton */}
                <div className="mb-6">
                  <div className="h-5 bg-gray-600 rounded-md w-1/4 mb-3 animate-pulse" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center space-x-2"
                      >
                        <div className="h-5 w-5 bg-gray-600 rounded animate-pulse" />
                        <div className="h-4 bg-gray-600 rounded-md w-5/6 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Skeleton */}
                <div className="h-12 bg-gray-600 rounded-lg w-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading subscription plans: {error}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center text-gray-600 p-4">
        No subscription plans available.
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-start justify-center w-full py-16">
      <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="relative bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600/50 hover:border-[#1F8349]/50 transition-all duration-300 hover:transform hover:-translate-y-1 w-full"
            >
              {plan.metadata.popular && (
                <div className="absolute -top-4 -right-4">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Popular
                  </div>
                </div>
              )}
              {plan.metadata.best_value && (
                <div className="absolute -top-4 -right-4">
                  <div className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Best Value
                  </div>
                </div>
              )}
              {plan.image && (
                <img
                  src={plan.image}
                  alt={plan.name}
                  className="w-full h-32 object-cover rounded-t-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              {plan.price && (
                <div className="mb-6">
                  <p className="text-3xl font-bold text-white">
                    {plan.price.formattedPrice}
                    <span className="text-base font-normal text-gray-300">
                      /{plan.price.interval}
                    </span>
                  </p>
                  {plan.price.intervalCount > 1 && (
                    <p className="text-sm text-gray-400">
                      Billed every {plan.price.intervalCount}{" "}
                      {plan.price.interval}s
                    </p>
                  )}
                </div>
              )}

              {plan.description && (
                <p className="text-gray-300 mb-6">{plan.description}</p>
              )}

              {plan.marketing_features &&
                plan.marketing_features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">
                      Features:
                    </h4>
                    <ul className="space-y-2">
                      {plan.marketing_features.map(
                        (feature: MarketingFeature, index: number) => {
                          const isNegativeFeature =
                            feature.name.startsWith("NOT-");
                          const featureName = isNegativeFeature
                            ? feature.name.substring(4)
                            : feature.name;

                          return (
                            <li
                              key={index}
                              className="flex items-start text-gray-300"
                            >
                              {isNegativeFeature ? (
                                <svg
                                  className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-[#1F8349] mr-2 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                              <span
                                className={`text-sm ${
                                  isNegativeFeature
                                    ? "text-gray-500 line-through"
                                    : "text-gray-300"
                                }`}
                              >
                                {featureName}
                              </span>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </div>
                )}
              {currentSubscription &&
              currentSubscription.product.name === plan.name ? (
                <div className="space-y-2">
                  {currentSubscription.cancelAtPeriodEnd ? (
                    <div className="text-sm text-amber-500 text-center">
                      Active until{" "}
                      {new Date(
                        currentSubscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-sm text-[#1F8349] text-center">
                      Active subscription
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="w-full bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  onClick={async () => {
                    try {
                      if (!plan.price?.id) {
                        return;
                      }

                      const response = await fetch(
                        "/api/stripe/create-checkout-session",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            priceId: plan.price.id,
                          }),
                        }
                      );

                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        throw new Error(
                          data.error || "Failed to create checkout session"
                        );
                      }
                    } catch (error) {
                      alert(
                        "Failed to start checkout process. Please try again."
                      );
                    }
                  }}
                  disabled={loading}
                >
                  {loading
                    ? "Loading..."
                    : currentSubscription
                    ? "Change Plan"
                    : "Select Plan"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
