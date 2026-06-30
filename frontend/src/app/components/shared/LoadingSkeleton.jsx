export function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 rounded-full border-white/5 border-t-primary animate-spin" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 card animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded bg-white/[0.06] w-3/4" />
          <div className="h-3 rounded bg-white/[0.04] w-1/2" />
        </div>
      </div>
      <div className="h-3 rounded bg-white/[0.04] w-full mb-2" />
      <div className="h-3 rounded bg-white/[0.04] w-2/3" />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="p-6 card animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-3 rounded bg-white/[0.04] w-16" />
          <div className="h-6 rounded bg-white/[0.06] w-12" />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="p-6 card animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-white/[0.06] mb-4" />
        <div className="h-5 rounded bg-white/[0.06] w-32 mb-2" />
        <div className="h-3 rounded bg-white/[0.04] w-20" />
      </div>
    </div>
  );
}
