"use client";

import React, { useState } from "react";
import ReactPlayer from "react-player";
import { Skeleton, Pagination, ThemeButton } from "@/app/components";
import { useQuery, useMutation } from "@apollo/client";
import { ALL_VIDEOS } from "@/lib/graphql/queries";
import { MARK_ALL_VIDEOS_AS_VIEWED, MARK_VIDEO_AS_VIEWED } from "@/lib/graphql/mutations";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setUser } from "@/lib/store/slices/authSlice";

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
  const [viewedVideos, setViewedVideos] = useState<Set<string>>(new Set());
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

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

  const [markVideoAsViewed] = useMutation(MARK_VIDEO_AS_VIEWED, {
    onError: (error) => {
      console.error("Failed to mark video as viewed:", error);
    },
  });

  const [markAllVideosAsViewed, { loading: markAllLoading }] = useMutation(
    MARK_ALL_VIDEOS_AS_VIEWED,
    {
      onCompleted: (data) => {
        if (data?.markVideoAsViewed?.success) {
          if (user) {
            dispatch(
              setUser({
                ...user,
                hasViewedAllVideos: true,
              })
            );
          }
        }
      },
      onError: (error) => {
        console.error("Failed to mark all videos as viewed:", error);
      },
    }
  );

  const handleMarkAllAsViewed = () => {
    markAllVideosAsViewed({
      variables: {
        viewedAll: true,
      },
    });
  };

  const handleVideoView = async (videoId: string) => {
    // Only mark as viewed if not already viewed in this session
    if (!viewedVideos.has(videoId)) {
      setViewedVideos((prev) => new Set(prev).add(videoId));
      try {
        await markVideoAsViewed({
          variables: {
            videoId: videoId,
          },
        });
      } catch (error) {
        console.error("Error marking video as viewed:", error);
        // Remove from viewed set if mutation failed so it can be retried
        setViewedVideos((prev) => {
          const newSet = new Set(prev);
          newSet.delete(videoId);
          return newSet;
        });
      }
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

  // Convert video URL to embeddable URL
  // (react-player handles YouTube/Vimeo/etc directly)

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
        {user?.hasViewedAllVideos === false && (
          <ThemeButton
            label={markAllLoading ? "Marking..." : "Mark All as Viewed"}
            onClick={handleMarkAllAsViewed}
            variant="outline"
            heightClass="h-10"
            disabled={markAllLoading}
          />
        )}
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
                      {user?.hasViewedAllVideos === false && (
                        <ThemeButton
                          label="Mark as viewed"
                          onClick={() => handleVideoView(video.id)}
                          variant="outline"
                          heightClass="h-8"
                          className="shrink-0 text-sm"
                          disabled={viewedVideos.has(video.id)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="relative w-full aspect-video bg-black max-h-[300px]">
                    <ReactPlayer
                      src={video.url}
                      controls
                      width="100%"
                      height="100%"
                      light={activeVideoId !== video.id}
                      playIcon={null}
                      playing={activeVideoId === video.id}
                      onClickPreview={() => setActiveVideoId(video.id)}
                      onPause={() => setActiveVideoId(null)}
                      onStart={() => handleVideoView(video.id)}
                    />
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
