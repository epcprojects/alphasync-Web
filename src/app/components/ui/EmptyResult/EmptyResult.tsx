import React, { ReactNode } from 'react'
import ThemeButton from '../buttons/ThemeButton';
import { PlusIcon } from '@/icons';

interface EmptyResultProps {
    icon: ReactNode;
    title: string;
    description: ReactNode;
    buttonLabel: string;
    buttonOnClick: ()=>void;
}

const EmptyResult: React.FC<EmptyResultProps> = ({ icon,title,description,buttonLabel,buttonOnClick }) => {
  return (
    <div className="h-full bg-white py-20 flex flex-col justify-center items-center gap-7 text-center rounded-xl">
          {icon}
          <div className="space-y-3">
            <h2 className="font-semibold text-2xl text-gray-900">
             {title}
            </h2>

            {description}
            </div>
            <ThemeButton
            label={buttonLabel}
            icon={<PlusIcon />}
            onClick={buttonOnClick}
          />
          </div>
  )
}

export default EmptyResult
