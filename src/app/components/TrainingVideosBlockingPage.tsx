"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ThemeButton } from "@/app/components";
import { DashboardIcon } from "@/icons";

interface TrainingVideosBlockingPageProps {
  onMarkAllAsViewed?: () => void;
  isLoading?: boolean;
}

const TrainingVideosBlockingPage: React.FC<TrainingVideosBlockingPageProps> = ({
  onMarkAllAsViewed,
  isLoading = false,
}) => {
  const router = useRouter();

  const handleGoToVideos = () => {
    router.push("/training-videos");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl w-full p-6 md:p-8 lg:p-12">
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">
          {/* Icon */}
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-blue-100 flex items-center justify-center">
            <DashboardIcon fill="#3B82F6" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">
            Complete Training Videos
          </h1>

          {/* Message */}
          <div className="flex flex-col gap-3">
            <p className="text-base md:text-lg text-gray-700">
              You haven't viewed all training videos yet.
            </p>
            <p className="text-sm md:text-base text-gray-600">
              Please watch all training videos to continue using the platform, or you can mark them all as viewed if you prefer.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full sm:w-auto">
            <ThemeButton
              label="Go to Training Videos"
              onClick={handleGoToVideos}
              variant="filled"
              heightClass="h-11 md:h-12"
              className="w-full sm:w-auto sm:min-w-[200px]"
              icon={<DashboardIcon fill="currentColor" />}
            />
            {onMarkAllAsViewed && (
              <ThemeButton
                label={isLoading ? "Marking..." : "Mark All as Viewed"}
                onClick={onMarkAllAsViewed}
                variant="outline"
                heightClass="h-11 md:h-12"
                className="w-full sm:w-auto sm:min-w-[200px]"
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingVideosBlockingPage;
