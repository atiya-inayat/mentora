import Navbar from "./Navbar";

export function FullPageSkeleton({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {children || (
          <div className="space-y-6">
            <div className="h-8 rounded bg-white/[0.06] w-48 animate-pulse" />
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="p-6 glass-card rounded-2xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06]" />
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-primary/5 w-16" />
                    <div className="h-6 rounded bg-white/[0.06] w-12" />
                  </div>
                </div>
              </div>
              <div className="p-6 glass-card rounded-2xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06]" />
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-primary/5 w-16" />
                    <div className="h-6 rounded bg-white/[0.06] w-12" />
                  </div>
                </div>
              </div>
              <div className="p-6 glass-card rounded-2xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.06]" />
                  <div className="space-y-2">
                    <div className="h-3 rounded bg-primary/5 w-16" />
                    <div className="h-6 rounded bg-white/[0.06] w-12" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 glass-card rounded-2xl animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 rounded bg-white/[0.06] w-3/4" />
                  <div className="h-3 rounded bg-primary/5 w-1/2" />
                </div>
              </div>
              <div className="h-3 rounded bg-primary/5 w-full mb-2" />
              <div className="h-3 rounded bg-primary/5 w-2/3" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
