import React from "react";

const PageShell = ({ title, subtitle, right }) => {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {right && <div className="flex items-center gap-3">{right}</div>}
      </div>
      
      {/* Subtle divider instead of border */}
      <div className="h-px bg-gray-100 w-full mt-6" />
    </div>
  );
};

export default PageShell;
