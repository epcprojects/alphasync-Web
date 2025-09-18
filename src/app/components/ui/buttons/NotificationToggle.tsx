import React from "react";
import { Switch } from "@headlessui/react";

interface NotificationToggleProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({
  icon,
  title,
  subtitle,
  enabled,
  onChange,
}) => {
  return (
    <div className="flex items-start justify-between border-b last:pb-0 pb-3 md:pb-6 border-b-gray-200 last:border-b-0">
      <div className="flex items-center gap-2 md:gap-4">
        <span className="h-8 w-8 md:w-12 md:h-12 rounded-lg border border-lightGray shadow-sm flex items-center justify-center">
          {icon}
        </span>
        <div>
          <h2 className="font-medium text-sm md:text-lg text-gray-900">
            {title}
          </h2>
          <h3 className="text-xs md:text-base text-gray-800">{subtitle}</h3>
        </div>
      </div>

      <Switch
        checked={enabled}
        onChange={onChange}
        className="group inline-flex cursor-pointer h-6 w-11 items-center rounded-full bg-gray-200 transition data-checked:bg-gradient-to-r data-checked:from-[#3C85F5] data-checked:to-[#1A407A]"
      >
        <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
      </Switch>
    </div>
  );
};

export default NotificationToggle;
