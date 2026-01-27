"use client";

import React, { useState, useEffect } from "react";
import { ThemeButton, ThemeInput, AppModal } from "@/app/components";
import { PlusIcon, DashboardIcon } from "@/icons";
import * as Yup from "yup";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { useMutation } from "@apollo/client";
import { CREATE_VIDEO } from "@/lib/graphql/mutations";

interface TrainingVideo {
  id: string;
  title: string;
  url: string;
}

const initialVideos: TrainingVideo[] = [
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

const videoSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  url: Yup.string()
    .url("Please enter a valid URL")
    .required("Video link is required"),
});

const AdminTrainingVideosPage: React.FC = () => {
  const [trainingVideos, setTrainingVideos] = useState<TrainingVideo[]>(initialVideos);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isFormValid, setIsFormValid] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const [createVideo, { loading: createVideoLoading }] = useMutation(CREATE_VIDEO, {
    onCompleted: (data) => {
      if (data?.createVideo?.success) {
        const newVideo: TrainingVideo = {
          id: `video-${Date.now()}`,
          title: formData.title,
          url: formData.url,
        };

        setTrainingVideos((prev) => [...prev, newVideo]);
        showSuccessToast("Training video added successfully");
        resetForm();
        setIsModalOpen(false);
      }
    },
    onError: (error) => {
      showErrorToast(error.message || "Failed to create training video");
    },
  });

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
