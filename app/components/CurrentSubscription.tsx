import { Card, CardHeader, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useSubscriptionData } from "@/hooks/useSubscriptionData";

export function CurrentSubscription() {
  const {
    currentSubscription: subscription,
    isLoading: loading,
    error,
  } = useSubscriptionData();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-0 px-6 pb-6">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !subscription) {
    return (
      <Card>
        <CardContent className="pt-0 px-6 pb-6">
          <p className="text-sm text-gray-500">
            {error || "No active subscription found"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Current Subscription</h3>
          <Badge
            variant={subscription.status === "active" ? "success" : "secondary"}
          >
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-6 pb-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{subscription.product.name}</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {subscription.price.formattedAmount}
            </span>
            <span className="text-gray-500">
              /{" "}
              {subscription.price.intervalCount > 1
                ? `${subscription.price.intervalCount} `
                : ""}
              {subscription.price.interval}
            </span>
          </div>
          {subscription.cancelAtPeriodEnd && (
            <div className="text-sm text-amber-600">
              Your subscription will end on{" "}
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
