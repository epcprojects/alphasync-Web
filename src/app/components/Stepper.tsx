import React from "react";
import clsx from "clsx";
import { SuccessCheckIcon, ToastSuccessIcon } from "@/icons";

type Step = {
  label: string;
};

interface StepperProps {
  activeStep: number; // 1-based index for the active step
  steps: Step[];
}

const Stepper: React.FC<StepperProps> = ({ activeStep, steps }) => {
  return (
    <ol className="flex items-center w-full mb-6 md:mb-10">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isPrev = stepNumber < activeStep;
        const isCurrent = stepNumber === activeStep;
        const isLast = index === steps.length - 1;

        return (
          <li
            key={index}
            className={clsx(
              "flex relative items-center w-full",
              !isLast &&
                "after:content-[''] after:w-full after:border after:inline-block after:border-dashed after:border-gray-200"
            )}
          >
            <div
              className={clsx(
                "flex items-center justify-center shrink-0 w-3 h-3 md:w-6 md:h-6 lg:w-6 lg:h-6 rounded-full text-xs",
                isCurrent
                  ? "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
                  : "bg-gray-100 text-gray-500"
              )}
            >
              {isPrev ? (
                <ToastSuccessIcon fill="#17B26A" width="24" height="24" />
              ) : (
                stepNumber
              )}
            </div>
            <h2
              className={clsx(
                "absolute -bottom-8 text-xs md:text-sm",
                isPrev || isCurrent ? "text-gray-700" : "text-gray-500"
              )}
            >
              {step.label}
            </h2>
          </li>
        );
      })}
    </ol>
  );
};

export default Stepper;
