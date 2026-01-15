import React from "react";

const PageShell = ({ title, subtitle, right }) => {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {right && <div className="flex gap-2">{right}</div>}
      </div>

      <div className="divider mt-6" />
    </div>
  );
};

export default PageShell;
