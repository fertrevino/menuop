import { useEffect, useState } from "react";

export interface SubscriptionDetails {
  id: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  product: {
    name: string;
    description: string;
  };
  price: {
    amount: number;
    currency: string;
    formattedAmount: string;
    interval: string;
    intervalCount: number;
  };
}

interface SubscriptionData {
  currentSubscription: SubscriptionDetails | null;
  plans: any[];
  isLoading: boolean;
  error: string | null;
}

// Cache subscription data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedData: SubscriptionData | null = null;
let cacheTimestamp: number | null = null;

export function useSubscriptionData() {
  const [data, setData] = useState<SubscriptionData>({
    currentSubscription: null,
    plans: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Check if we have valid cached data
      if (
        cachedData &&
        cacheTimestamp &&
        Date.now() - cacheTimestamp < CACHE_DURATION
      ) {
        setData(cachedData);
        return;
      }

      try {
        const [plansResponse, subscriptionResponse] = await Promise.all([
          fetch("/api/stripe/subscription-plans"),
          fetch("/api/stripe/current-subscription"),
        ]);

        const plansData = await plansResponse.json();
        const subscriptionData = await subscriptionResponse.json();

        const newData = {
          currentSubscription: subscriptionData.success
            ? subscriptionData.subscription
            : null,
          plans: plansData.success ? plansData.products : [],
          isLoading: false,
          error: null,
        };

        // Update cache
        cachedData = newData;
        cacheTimestamp = Date.now();

        setData(newData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setData({
          currentSubscription: null,
          plans: [],
          isLoading: false,
          error: errorMessage,
        });
      }
    };

    fetchData();
  }, []);

  // Method to force refresh the data
  const refreshData = async () => {
    cachedData = null;
    cacheTimestamp = null;
    setData((prev) => ({ ...prev, isLoading: true }));

    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        fetch("/api/stripe/subscription-plans"),
        fetch("/api/stripe/current-subscription"),
      ]);

      const plansData = await plansResponse.json();
      const subscriptionData = await subscriptionResponse.json();

      const newData = {
        currentSubscription: subscriptionData.success
          ? subscriptionData.subscription
          : null,
        plans: plansData.success ? plansData.products : [],
        isLoading: false,
        error: null,
      };

      cachedData = newData;
      cacheTimestamp = Date.now();

      setData(newData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setData({
        currentSubscription: null,
        plans: [],
        isLoading: false,
        error: errorMessage,
      });
    }
  };

  return {
    ...data,
    refreshData,
  };
}
