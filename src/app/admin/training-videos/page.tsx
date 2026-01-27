"use client";

import React, { useState, useEffect } from "react";
import { ThemeButton, ThemeInput, AppModal } from "@/app/components";
import { PlusIcon, DashboardIcon } from "@/icons";
import * as Yup from "yup";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_VIDEO } from "@/lib/graphql/mutations";
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

const videoSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  url: Yup.string()
    .url("Please enter a valid URL")
    .required("Video link is required"),
});

const AdminTrainingVideosPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const {
    data: videosData,
    loading: videosLoading,
    error: videosError,
    refetch: refetchVideos,
  } = useQuery<AllVideosResponse>(ALL_VIDEOS, {
    variables: {
      perPage: null,
      page: null,
    },
    fetchPolicy: "network-only",
  });

  const [createVideo, { loading: createVideoLoading }] = useMutation(CREATE_VIDEO, {
    onCompleted: (data) => {
      if (data?.createVideo?.success) {
        showSuccessToast("Training video added successfully");
        resetForm();
        setIsModalOpen(false);
        // Refetch videos to get the updated list
        refetchVideos();
      }
    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to create training video");
    },
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

  useEffect(() => {
    const validateForm = async () => {
      try {
        await videoSchema.validate(formData, { abortEarly: false });
        setErrors({});
        setIsFormValid(true);
      } catch (err: any) {
        const newErrors: Record<string, string> = {};
        if (err.inner) {
          err.inner.forEach((error: any) => {
            // Only show errors for touched fields or if submit was attempted
            if (hasAttemptedSubmit || touchedFields.has(error.path)) {
              newErrors[error.path] = error.message;
            }
          });
        }
        setErrors(newErrors);
        setIsFormValid(false);
      }
    };

    validateForm();
  }, [formData, touchedFields, hasAttemptedSubmit]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Mark field as touched when user starts typing
    if (!touchedFields.has(field)) {
      setTouchedFields((prev) => new Set(prev).add(field));
    }
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string) => {
    // Mark field as touched when user leaves the field
    if (!touchedFields.has(field)) {
      setTouchedFields((prev) => new Set(prev).add(field));
    }
  };

  const handleConfirm = async () => {
    setHasAttemptedSubmit(true);
    
    // Validate form
    try {
      await videoSchema.validate(formData, { abortEarly: false });
      // Form is valid, proceed with submission
      await createVideo({
        variables: {
          title: formData.title,
          videoUrl: formData.url,
        },
      });
    } catch (err: any) {
      // Show all errors when submit is attempted
      const newErrors: Record<string, string> = {};
      if (err.inner) {
        err.inner.forEach((error: any) => {
          newErrors[error.path] = error.message;
        });
      }
      setErrors(newErrors);
      setIsFormValid(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      url: "",
    });
    setErrors({});
    setTouchedFields(new Set());
    setHasAttemptedSubmit(false);
    setIsFormValid(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      resetForm();
    }
  }, [isModalOpen]);

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
        <ThemeButton
          label="Add Training Video"
          onClick={() => setIsModalOpen(true)}
          icon={<PlusIcon />}
          variant="filled"
          heightClass="h-10"
        />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {videosLoading ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-200 p-6 md:p-12 text-center text-gray-500 text-sm">
            Loading training videos...
          </div>
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
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="p-4 md:p-5 flex flex-col gap-3">
                  <h3 className="text-black font-semibold text-base md:text-lg">
                    {video.title}
                  </h3>
                  {video.createdAt && (
                    <p className="text-gray-500 text-xs md:text-sm">
                      {formatDate(video.createdAt)}
                    </p>
                  )}
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
      </section>

      <AppModal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title="Add Training Video"
        onConfirm={handleConfirm}
        confirmLabel={createVideoLoading ? "Adding..." : "Add Video"}
        icon={<DashboardIcon fill="#374151" />}
        size="medium"
        outSideClickClose={!createVideoLoading}
        confimBtnDisable={!isFormValid || createVideoLoading}
        disableCloseButton={createVideoLoading}
        onCancel={handleCancel}
        cancelLabel="Cancel"
      >
        <div className="flex flex-col gap-4 md:gap-5">
          <ThemeInput
            required
            label="Title"
            placeholder="Enter video title"
            name="title"
            error={!!errors.title}
            errorMessage={errors.title}
            id="title"
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            type="text"
            value={formData.title}
          />

          <ThemeInput
            required
            label="Video Link"
            placeholder="https://example.com/video"
            name="url"
            error={!!errors.url}
            errorMessage={errors.url}
            id="url"
            onChange={(e) => handleChange("url", e.target.value)}
            onBlur={() => handleBlur("url")}
            type="url"
            value={formData.url}
          />
        </div>
      </AppModal>
    </div>
  );
};

export default AdminTrainingVideosPage;
