import Link from "next/link";
import { User, ArrowRight } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function LandingMentorCard({ mentor }) {
  if (!mentor) return null;

  const photoUrl = mentor.userId?.photo
    ? mentor.userId.photo.startsWith("http")
      ? mentor.userId.photo
      : `${baseUrl}${mentor.userId.photo}`
    : null;

  return (
    <div className="glass-card rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start gap-5 p-5">
        <div className="shrink-0 w-[140px] h-[140px] rounded-2xl overflow-hidden bg-surface">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={mentor.userId?.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <User className="w-12 h-12 text-white/10" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-primary truncate">
            {mentor.userId?.name}
          </h3>
          <p className="mt-1 text-sm text-white/60 line-clamp-2">
            {mentor.bio || "Experienced mentor ready to help you grow."}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {mentor.skills?.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs rounded-full bg-white/[0.06] text-white/60 border border-white/5"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-primary">${mentor.hourlyRate}</span>
          <span className="text-sm text-white/40">/hr</span>
        </div>
        <Link
          href={`/mentors/${mentor._id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-primary text-white hover:opacity-90 transition-opacity"
        >
          View Profile
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
