"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubscriptionPlans from "@/app/components/SubscriptionPlans";

export default function Settings() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Profile settings
  const [initialProfileData, setInitialProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    website: "",
  });

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    website: "",
  });

  // Notification preferences
  const [initialNotifications, setInitialNotifications] = useState({
    emailUpdates: true,
    menuAnalytics: false,
    newFeatures: true,
    marketingEmails: false,
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    menuAnalytics: false,
    newFeatures: true,
    marketingEmails: false,
  });

  // Menu preferences
  const [initialMenuPreferences, setInitialMenuPreferences] = useState({
    defaultCurrency: "USD",
    timeFormat: "12h",
    theme: "dark",
  });

  const [menuPreferences, setMenuPreferences] = useState({
    defaultCurrency: "USD",
    timeFormat: "12h",
    theme: "dark",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      // Load user data
      const userData = {
        fullName: user.user_metadata?.full_name || "",
        email: user.email || "",
        phone: user.user_metadata?.phone || "",
        businessName: user.user_metadata?.business_name || "",
        businessType: user.user_metadata?.business_type || "",
        website: user.user_metadata?.website || "",
      };
      setInitialProfileData(userData);
      setProfileData(userData);
    }
  }, [user]);

  // Function to check for unsaved changes
  const hasUnsavedChanges = () => {
    const profileChanged =
      JSON.stringify(profileData) !== JSON.stringify(initialProfileData);
    const notificationsChanged =
      JSON.stringify(notifications) !== JSON.stringify(initialNotifications);
    const preferencesChanged =
      JSON.stringify(menuPreferences) !==
      JSON.stringify(initialMenuPreferences);

    return profileChanged || notificationsChanged || preferencesChanged;
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual profile update with Supabase
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Profile updated successfully!");
      // Update initial data to match current data after successful save
      setInitialProfileData({ ...profileData });
    } catch (error) {
      alert("Error updating profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual notification preferences update
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Notification preferences updated!");
      // Update initial notifications to match current notifications after successful save
      setInitialNotifications({ ...notifications });
    } catch (error) {
      alert("Error updating preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMenuPreferences = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual menu preferences update
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Menu preferences updated!");
      // Update initial preferences to match current preferences after successful save
      setInitialMenuPreferences({ ...menuPreferences });
    } catch (error) {
      alert("Error updating preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your menus and data."
      )
    ) {
      if (
        window.confirm(
          "This is your final warning. Your account and all data will be permanently deleted. Are you absolutely sure?"
        )
      ) {
        try {
          // TODO: Implement actual account deletion
          alert(
            "Account deletion feature will be implemented soon. Please contact support for account deletion requests."
          );
        } catch (error) {
          alert("Error deleting account. Please contact support.");
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: "profile", name: "Profile", icon: "👤" },
    { id: "notifications", name: "Notifications", icon: "🔔" },
    { id: "menu-preferences", name: "Menu Preferences", icon: "📋" },
    { id: "subscription", name: "Subscription", icon: "💳" },
    { id: "account", name: "Account", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const hasUnsaved = hasUnsavedChanges();

                  if (hasUnsaved) {
                    const confirmed = window.confirm(
                      "You have unsaved changes. Are you sure you want to leave?"
                    );
                    if (!confirmed) return;
                  }
                  router.push("/dashboard");
                }}
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-gray-700/50 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Dashboard</span>
              </button>
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-[#1F8349]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Settings
              </h2>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#1F8349]/20 text-[#1F8349] border border-[#1F8349]/50"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Profile Information
                  </h3>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          fullName: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full bg-gray-600 text-gray-400 border border-gray-600 rounded-lg px-3 py-2 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessName: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="Enter your business name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Business Type
                    </label>
                    <select
                      value={profileData.businessType}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          businessType: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                    >
                      <option value="">Select business type</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="cafe">Cafe</option>
                      <option value="bar">Bar</option>
                      <option value="food-truck">Food Truck</option>
                      <option value="bakery">Bakery</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          website: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                      placeholder="https://your-website.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Notification Preferences
                  </h3>
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                <div className="space-y-6">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3 border-b border-gray-700 last:border-b-0"
                    >
                      <div>
                        <h4 className="text-white font-medium">
                          {key === "emailUpdates" && "Email Updates"}
                          {key === "menuAnalytics" && "Menu Analytics"}
                          {key === "newFeatures" && "New Features"}
                          {key === "marketingEmails" && "Marketing Emails"}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {key === "emailUpdates" &&
                            "Receive important updates about your account"}
                          {key === "menuAnalytics" &&
                            "Get weekly reports about your menu performance"}
                          {key === "newFeatures" &&
                            "Be notified when new features are available"}
                          {key === "marketingEmails" &&
                            "Receive promotional offers and tips"}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setNotifications({
                              ...notifications,
                              [key]: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1F8349]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1F8349]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "subscription" && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Subscription Management
                  </h3>
                </div>
                <div className="mb-8">
                  <SubscriptionPlans />
                </div>
              </div>
            )}

            {activeTab === "menu-preferences" && (
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    Menu Preferences
                  </h3>
                  <button
                    onClick={handleSaveMenuPreferences}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-[#1F8349] to-[#2ea358] hover:from-[#176e3e] hover:to-[#248a47] text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Currency
                    </label>
                    <select
                      value={menuPreferences.defaultCurrency}
                      onChange={(e) =>
                        setMenuPreferences({
                          ...menuPreferences,
                          defaultCurrency: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Time Format
                    </label>
                    <select
                      value={menuPreferences.timeFormat}
                      onChange={(e) =>
                        setMenuPreferences({
                          ...menuPreferences,
                          timeFormat: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                    >
                      <option value="12h">12-hour (2:30 PM)</option>
                      <option value="24h">24-hour (14:30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Theme
                    </label>
                    <select
                      value={menuPreferences.theme}
                      onChange={(e) =>
                        setMenuPreferences({
                          ...menuPreferences,
                          theme: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1F8349]"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6">
                {/* Password Change */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Change Password
                  </h3>
                  <p className="text-gray-400 mb-6">
                    To change your password, you&apos;ll need to reset it using
                    your email address.
                  </p>
                  <button
                    onClick={() => {
                      // TODO: Implement password reset
                      alert(
                        "Password reset feature will be implemented soon. Please contact support for password changes."
                      );
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Reset Password
                  </button>
                </div>

                {/* Account Stats */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Member Since</p>
                      <p className="text-white font-semibold">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">Email Verified</p>
                      <p className="text-white font-semibold">
                        {user.email_confirmed_at ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-red-400 mb-4">
                    Danger Zone
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
