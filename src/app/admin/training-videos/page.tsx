"use client";

import React from "react";
import { ThemeButton } from "@/app/components";

interface TrainingVideo {
  id: string;
  title: string;
  url: string;
}

const trainingVideos: TrainingVideo[] = [
    {
        id: "getting-started",
        title: "Getting Started with the Platform",
        url: "https://example.com/training/getting-started",
      },
      {
        id: "creating-orders",
        title: "Creating and Managing Orders",
        url: "https://example.com/training/creating-orders",
      },
      {
        id: "customer-management",
        title: "Customer Management",
        url: "https://example.com/training/customer-management",
      },
      {
        id: "inventory-overview",
        title: "Inventory Overview",
        url: "https://example.com/training/inventory-overview",
      },
];

const AdminTrainingVideosPage: React.FC = () => {
  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full mx-auto flex flex-col gap-4 md:gap-6 pt-2">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-black font-semibold text-xl md:text-3xl">
            Training Videos
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-1 max-w-2xl">
            Training videos for doctors. Share these with your team to help them learn the platform.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {trainingVideos.map((video) => (
          <article
            key={video.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-5 flex items-center justify-between gap-4"
          >
            <h3 className="text-black font-semibold text-base md:text-lg flex-1">
              {video.title}
            </h3>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <ThemeButton
                label="Watch video"
                size="small"
                heightClass="h-9"
                className="whitespace-nowrap"
              />
            </a>
          </article>
        ))}

        {trainingVideos.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-6 md:p-12 text-center text-gray-500 text-sm">
            No training videos available at this time.
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminTrainingVideosPage;
