import React from "react";
import clsx from "clsx";
import { ToastSuccessIcon } from "@/icons";
import { useIsMobile } from "@/hooks/useIsMobile";

type Step = {
  label: string;
};

interface StepperProps {
  activeStep: number; // 1-based index for the active step
  steps: Step[];
}

const Stepper: React.FC<StepperProps> = ({ activeStep, steps }) => {
  const isMobile = useIsMobile();

  return (
    <>
      <ol className="flex items-center w-full justify-between mb-0 md:mb-10">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isPrev = stepNumber < activeStep;
          const isCurrent = stepNumber === activeStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={clsx(
                "flex relative items-center w-full ",
                index === 1 ? "sm:min-w-72" : "",
                index === 2 && isMobile ? "!contents" : "",
                !isLast &&
                  "after:content-[''] after:w-full after:border after:inline-block after:border-dashed after:border-gray-200"
              )}
            >
              <div
                className={clsx(
                  "flex items-center  justify-center shrink-0 w-6 h-6 lg:w-6 lg:h-6 rounded-full text-xs",
                  isCurrent
                    ? "bg-gradient-to-r from-[#3C85F5] to-[#1A407A] text-white"
                    : "bg-white border border-gray-200 text-gray-500"
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
                  "absolute hidden sm:block -bottom-8 text-xs md:text-sm",
                  isPrev || isCurrent ? "text-gray-700" : "text-gray-500"
                )}
              >
                {step.label}
              </h2>
            </li>
          );
        })}
      </ol>
      <h2 className={"text-sm text-black font-semibold"}>
        {steps[activeStep - 1].label}
      </h2>
    </>
  );
};

export default Stepper;
