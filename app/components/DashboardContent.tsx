"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, {session?.user?.name}!</h1>
            <p className="text-gray-600 mb-6">
              This is your personalized dashboard. Here you can view and manage your account.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DashboardCard title="Profile" description="View and edit your profile information" />
              <DashboardCard title="Settings" description="Manage your account settings" />
              <DashboardCard title="Activity" description="See your recent activity" />
              <DashboardCard title="Support" description="Get help and support" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}