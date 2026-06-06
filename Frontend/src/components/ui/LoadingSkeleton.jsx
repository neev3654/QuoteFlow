export default function LoadingSkeleton({ rows = 5, columns = 4 }) {
  const widths = ['w-1/2', 'w-2/3', 'w-3/4', 'w-full', 'w-4/5'];

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden w-full">
      <div className="w-full">
        {/* Header Skeleton */}
        <div className="bg-bg-tertiary border-b border-border-primary flex">
          {Array.from({ length: columns }).map((_, idx) => (
            <div key={`header-${idx}`} className="px-6 py-3 flex-1">
              <div className="skeleton h-4 w-20 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Rows Skeleton */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="border-b border-border-primary flex last:border-0">
            {Array.from({ length: columns }).map((_, colIndex) => {
              const widthClass = widths[(rowIndex + colIndex) % widths.length];
              const heightStr = `${16 + ((rowIndex + colIndex) % 5)}px`;
              return (
                <div key={`cell-${colIndex}`} className="px-6 py-4 flex-1 flex items-center">
                  <div className={`skeleton rounded ${widthClass}`} style={{ height: heightStr }}></div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
