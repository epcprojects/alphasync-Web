"use client";

import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { ThemeButton, ThemeInput, AppModal, Skeleton, Pagination } from "@/app/components";
import { PlusIcon, DashboardIcon, PencilEditIcon, TrashBinIcon } from "@/icons";
import * as Yup from "yup";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_VIDEO, UPDATE_VIDEO } from "@/lib/graphql/mutations";
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
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 9; // 3 columns x 3 rows
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TrainingVideo | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<TrainingVideo | null>(null);
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
          perPage: itemsPerPage,
          page: currentPage + 1, // GraphQL uses 1-based pagination
    },
    fetchPolicy: "network-only",
  });

  const [createVideo, { loading: createVideoLoading }] = useMutation(CREATE_VIDEO, {
    onCompleted: (data) => {
      if (data?.createVideo?.success) {
        showSuccessToast("Training video added successfully");
        resetForm();
        setIsModalOpen(false);
        setEditingVideo(null);
          setCurrentPage(0); // Reset to first page
        // Refetch videos to get the updated list
        refetchVideos();
      }
    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to create training video");
    },
  });

  const [updateVideo, { loading: updateVideoLoading }] = useMutation(UPDATE_VIDEO, {
    onCompleted: (data) => {
      if (data?.updateVideo?.success) {
        if (deletingVideo) {
          showSuccessToast("Training video deleted successfully");
          setIsDeleteModalOpen(false);
          setDeletingVideo(null);
        } else {
          showSuccessToast("Training video updated successfully");
          resetForm();
          setIsModalOpen(false);
          setEditingVideo(null);
        }
          setCurrentPage(0); // Reset to first page
        // Refetch videos to get the updated list
        refetchVideos();
      }
    },
    onError: (error) => {
      if (deletingVideo) {
        showErrorToast(error.message || "Failed to delete training video");
      } else {
        showErrorToast(error.message || "Failed to update training video");
      }
    },
  });

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

  useEffect(() => {
    const validateForm = async () => {
      try {
        await videoSchema.validate(formData, { abortEarly: false });
        setErrors({});
        setIsFormValid(true);
      } catch (err: unknown) {
        const newErrors: Record<string, string> = {};

        if (err && err instanceof Yup.ValidationError) {
          err.inner.forEach((error) => {
            // Only show errors for touched fields or if submit was attempted
            if (
              error.path &&
              (hasAttemptedSubmit || touchedFields.has(error.path))
            ) {
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
      if (editingVideo) {
        // Update existing video
        await updateVideo({
          variables: {
            id: editingVideo.id,
            title: formData.title,
            videoUrl: formData.url,
          },
        });
      } else {
        // Create new video
        await createVideo({
          variables: {
            title: formData.title,
            videoUrl: formData.url,
          },
        });
      }
    } catch (err: unknown) {
      // Show all errors when submit is attempted
      const newErrors: Record<string, string> = {};

      if (err && err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          if (error.path) {
            newErrors[error.path] = error.message;
          }
        });
      }

      setErrors(newErrors);
      setIsFormValid(false);
    }
  };

  const handleEdit = (video: TrainingVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      url: video.url,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (video: TrainingVideo) => {
    setDeletingVideo(video);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVideo) return;
    
    await updateVideo({
      variables: {
        id: deletingVideo.id,
        archived: true,
      },
    });
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingVideo(null);
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
    setEditingVideo(null);
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (isModalOpen && !editingVideo) {
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
          onClick={handleAddNew}
          icon={<PlusIcon />}
          variant="filled"
          heightClass="h-10"
        />
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
                                          <div className="flex items-center gap-1 shrink-0">
                                              <Skeleton className="h-8 w-8 rounded-lg" />
                                              <Skeleton className="h-8 w-8 rounded-lg" />
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
                                          <div className="flex items-center gap-1 shrink-0">
                                              <button
                                                  onClick={() => handleEdit(video)}
                                                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                                                  aria-label="Edit video"
                                              >
                                                  <PencilEditIcon width="16" height="16" fill="currentColor" />
                                              </button>
                                              <button
                                                  onClick={() => handleDeleteClick(video)}
                                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                                                  aria-label="Delete video"
                                              >
                                                  <TrashBinIcon width="16" height="16" />
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="relative w-full aspect-video bg-black max-h-[300px]">
                                      <ReactPlayer
                                          src={video.url}
                                          controls
                                          width="100%"
                                          height="100%"
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

      <AppModal
        isOpen={isModalOpen}
        onClose={handleCancel}
        title={editingVideo ? "Edit Training Video" : "Add Training Video"}
        onConfirm={handleConfirm}
        confirmLabel={
          editingVideo
            ? updateVideoLoading
              ? "Updating..."
              : "Update Video"
            : createVideoLoading
            ? "Adding..."
            : "Add Video"
        }
        icon={<DashboardIcon fill="#374151" />}
        size="medium"
        outSideClickClose={!createVideoLoading && !updateVideoLoading}
        confimBtnDisable={!isFormValid || createVideoLoading || updateVideoLoading}
        disableCloseButton={createVideoLoading || updateVideoLoading}
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

      <AppModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        title="Delete Training Video"
        onConfirm={handleDeleteConfirm}
        confirmLabel={updateVideoLoading ? "Deleting..." : "Delete"}
        icon={<TrashBinIcon width="20" height="20" />}
        size="small"
        outSideClickClose={!updateVideoLoading}
        confimBtnDisable={updateVideoLoading}
        disableCloseButton={updateVideoLoading}
        onCancel={handleDeleteCancel}
        cancelLabel="Cancel"
        confirmBtnVarient="danger"
      >
        <div className="flex flex-col gap-3">
          <p className="text-gray-700 text-sm md:text-base">
            Are you sure you want to delete this training video?
          </p>
          {deletingVideo && (
            <p className="text-gray-600 text-sm font-medium">
              &quot;{deletingVideo.title}&quot;
            </p>
          )}
          <p className="text-gray-500 text-xs md:text-sm">
            This action cannot be undone.
          </p>
        </div>
      </AppModal>
    </div>
  );
};

export default AdminTrainingVideosPage;
