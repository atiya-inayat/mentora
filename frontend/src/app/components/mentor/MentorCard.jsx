import Link from "next/link";
import { Star, User } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function MentorCard({ mentor }) {
  if (!mentor) return null;

  const photoUrl = mentor.userId?.photo
    ? mentor.userId.photo.startsWith("http")
      ? mentor.userId.photo
      : `${baseUrl}${mentor.userId.photo}`
    : null;

  return (
    <Link
      href={`/mentors/${mentor._id}`}
      className="card overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={mentor.userId?.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <User className="w-16 h-16 text-muted" />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-muted-foreground">
            {mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"}
          </span>
        </div>

        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {mentor.userId?.name}
        </h3>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {mentor.skills?.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-xs rounded-full bg-white/[0.05] text-muted border border-border"
            >
              {skill}
            </span>
          ))}
          {mentor.skills?.length > 3 && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-white/[0.04] text-muted border border-border">
              +{mentor.skills.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mt-4 pt-4 border-t border-border">
          <span className="text-lg font-semibold text-foreground">
            ${mentor.hourlyRate}
          </span>
          <span className="text-sm text-muted">/hr</span>
        </div>
      </div>
    </Link>
  );
}
