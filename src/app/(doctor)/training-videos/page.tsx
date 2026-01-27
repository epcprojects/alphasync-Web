"use client";

import React, { useState } from "react";
import { Skeleton, Pagination } from "@/app/components";
import { useQuery } from "@apollo/client";
import { ALL_VIDEOS } from "@/lib/graphql/queries";

interface TrainingVideo {
  id: string;
  title: string;
  url: string;
  createdAt: string;
}

interface AllVideosResponse {
  allVideos: {
    count: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
    allData: Array<{
      id: string;
      title: string;
      videoUrl: string;
      createdAt: string;
      uploadedBy: {
        fullName: string;
        firstName: string;
        imageUrl: string | null;
      };
    }>;
  };
}

const DoctorTrainingVideosPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9; // 3 columns x 3 rows

  const {
    data: videosData,
    loading: videosLoading,
    error: videosError,
  } = useQuery<AllVideosResponse>(ALL_VIDEOS, {
    variables: {
      perPage: itemsPerPage,
      page: currentPage + 1, // GraphQL uses 1-based pagination
    },
    fetchPolicy: "network-only",
  });

  // Convert video URL to embeddable URL
  const getEmbedUrl = (url: string): string => {
    try {
      // YouTube URLs
      if (url.includes("youtube.com/watch")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      
      // Vimeo URLs
      if (url.includes("vimeo.com/")) {
        const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
        return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
      }
      
      // Direct video URLs (mp4, webm, etc.)
      if (url.match(/\.(mp4|webm|ogg|mov)$/i)) {
        return url;
      }
      
      // If it's already an embed URL, return as is
      if (url.includes("/embed/") || url.includes("/video/")) {
        return url;
      }
      
      // Default: return original URL (will try to embed as iframe)
      return url;
    } catch {
      return url;
    }
  };

  // Format date helper function
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Check if date is today
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      
      // Check if date is yesterday
      const isYesterday =
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear();
      
      if (isToday) {
        return `Today at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else if (isYesterday) {
        return `Yesterday at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        // Show date and time for older dates
        return date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
        }) + ` at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
    } catch {
      return "";
    }
  };

  // Transform GraphQL data to TrainingVideo format
  const trainingVideos: TrainingVideo[] =
    videosData?.allVideos?.allData?.map((video) => ({
      id: video.id,
      title: video.title,
      url: video.videoUrl,
      createdAt: video.createdAt,
    })) || [];

  const totalPages = videosData?.allVideos?.totalPages || 1;

  const handlePageChange = (selectedPage: number) => {
    setCurrentPage(selectedPage);
  };

  return (
    <div className="lg:max-w-7xl md:max-w-6xl w-full mx-auto flex flex-col gap-4 md:gap-6 pt-2">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-black font-semibold text-xl md:text-3xl">
            Training Videos
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-1 max-w-2xl">
            Learn how to use the platform with our training videos.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-4 md:gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {videosLoading ? (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 md:p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="w-full aspect-video max-h-[300px] bg-gray-200" />
                </article>
              ))}
            </>
          ) : videosError ? (
            <div className="col-span-full bg-white rounded-xl border border-red-200 p-6 md:p-12 text-center text-red-500 text-sm">
              Failed to load training videos. Please try again.
            </div>
          ) : trainingVideos.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-200 p-6 md:p-12 text-center text-gray-500 text-sm">
              No training videos available at this time.
            </div>
          ) : (
            trainingVideos.map((video) => {
              const embedUrl = getEmbedUrl(video.url);
              const isDirectVideo = video.url.match(/\.(mp4|webm|ogg|mov)$/i);
              
              return (
                <article
                  key={video.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 md:p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-black font-semibold text-base md:text-lg">
                          {video.title}
                        </h3>
                        {video.createdAt && (
                          <p className="text-gray-500 text-xs md:text-sm mt-1">
                            {formatDate(video.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative w-full aspect-video bg-black max-h-[300px]">
                    {isDirectVideo ? (
                      <video
                        controls
                        className="w-full h-full object-contain"
                        src={embedUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                      />
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default DoctorTrainingVideosPage;
