import React from "react";
import clsx from "clsx";
import { TickIcon } from "@/icons";

type Step = {
  label: string;
};

interface ProfileStepperProps {
  activeStep: number;
  steps: Step[];
}

const ProfileStepper: React.FC<ProfileStepperProps> = ({
  activeStep,
  steps,
}) => {
  return (
    <div className="w-full mb-8">
      <ol className="relative flex items-center justify-between md:px-6">
        <div className="absolute left-7 right-7 h-0.5 bg-slate-200"></div>
        <div
          className="absolute left-7 h-0.5 bg-linear-to-r bg-primary transition-all duration-300"
          style={{
            width: `${((activeStep - 1) / (steps.length - 1)) * 90}%`,
            maxWidth: "calc(100% - 3.5rem)",
          }}
        ></div>

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < activeStep;
          const isActive = stepNumber === activeStep;

          return (
            <li key={index} className="relative flex flex-col items-center">
              <div
                className={clsx(
                  "flex items-center justify-center w-6 h-6 md:h-8 md:w-8 rounded-full text-xs md:text-sm font-semibold border  transition-all duration-300",
                  isCompleted
                    ? "text-primary bg-white border-primary border"
                    : isActive
                      ? "bg-white text-primary"
                      : "bg-white border-slate-200 text-gray-400",
                )}
              >
                {isCompleted ? <TickIcon fill="currentColor" /> : stepNumber}
              </div>
              <span
                className={clsx(
                  "absolute -bottom-7 text-sm md:text-base font-medium whitespace-nowrap text-center transition-colors duration-300 hidden md:block",
                  isCompleted || isActive ? "text-primary" : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProfileStepper;
