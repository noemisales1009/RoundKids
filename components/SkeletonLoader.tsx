import React from 'react';

const SkeletonLine: React.FC<{ width?: string; height?: string }> = ({ width = 'w-full', height = 'h-4' }) => (
    <div className={`${width} ${height} bg-slate-200 dark:bg-slate-700 rounded animate-pulse`} />
);

export const PatientDetailSkeleton: React.FC = () => (
    <div className="space-y-3">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <SkeletonLine width="w-3/4" height="h-4" />
                        <SkeletonLine width="w-1/2" height="h-3" />
                    </div>
                </div>
            </div>
        ))}
        <div className="flex items-center gap-2 py-2">
            <div className="w-4 h-4 bg-blue-200 dark:bg-blue-800 rounded animate-pulse" />
            <SkeletonLine width="w-32" height="h-3" />
        </div>
    </div>
);
