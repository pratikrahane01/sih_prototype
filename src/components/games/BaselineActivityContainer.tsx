import React from 'react';

interface BaselineActivityContainerProps {
  title: string;
  instructions: string;
  children: React.ReactNode;
}

export const BaselineActivityContainer: React.FC<BaselineActivityContainerProps> = ({
  title,
  instructions,
  children
}) => {
  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto text-center w-full">
      <h2 className="text-3xl font-bold text-primary-teal mb-4">{title}</h2>
      <p className="text-xl text-text-charcoal/80 mb-10 max-w-lg">
        {instructions}
      </p>
      
      <div className="w-full bg-white p-8 rounded-2xl shadow-sm border-2 border-secondary-sage/20 min-h-[300px] flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
