import { useState } from "react";
import Link from "next/link";
import { User, ArrowRight } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function AvatarWithSkeleton({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-background">
        <User className="w-10 h-10 text-white/15" />
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 bg-background">
          <div className="w-full h-full bg-gradient-to-br from-white/[0.02] via-white/[0.04] to-white/[0.01] animate-pulse" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover object-center ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

export default function LandingMentorCard({ mentor }) {
  if (!mentor) return null;

  const photoUrl = mentor.userId?.photo
    ? mentor.userId.photo.startsWith("http")
      ? mentor.userId.photo
      : `${baseUrl}${mentor.userId.photo}`
    : null;

  return (
    <div className="flex flex-col h-full card overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start gap-4 p-4 flex-1">
        <div className="relative shrink-0 w-[120px] h-[120px] rounded-xl overflow-hidden bg-background">
          <AvatarWithSkeleton src={photoUrl} alt={mentor.userId?.name} />
        </div>

        <div className="min-w-0 flex-1 flex flex-col">
          <h3 className="text-base font-semibold text-foreground truncate">
            {mentor.userId?.name}
          </h3>
          <p className="mt-1 text-sm text-muted line-clamp-2">
            {mentor.bio || "Experienced mentor ready to help you grow."}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2.5">
            {mentor.skills?.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-white/[0.05] text-muted border border-border"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-foreground">${mentor.hourlyRate}</span>
          <span className="text-sm text-muted">/hr</span>
        </div>
        <Link
          href={`/mentors/${mentor._id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
        >
          View Profile
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
