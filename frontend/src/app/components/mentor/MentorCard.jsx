// import Link from "next/link";

// export default function MentorCard({ mentor }) {
//   if (!mentor) {
//     return null;
//   }

//   return (
//     <div className="w-full p-5 border rounded-lg text-background bg-primary border-primary/50 ">
//       <h3 className="text-3xl text-white font-fugaz">{mentor.userId?.name}</h3>
//       <p className="font-mono text-lg">{mentor.bio}</p>
//       <p>${mentor.hourlyRate}/hr</p>
//       <p>⭐ {mentor.averageRating || "No ratings yet"}</p>
//       <p className="px-2 py-3 my-2 border border-background rounded-3xl bg-background/50 text-primary/90 ">
//         {mentor.skills?.join(", ")}
//       </p>

//       <button className="px-4 py-2 border rounded-full shadow-lg cursor-pointer hover:bg-background/20 bg-background/50">
//         {mentor._id ? (
//           <Link href={`/mentors/${mentor._id}`}>View Profile</Link>
//         ) : (
//           <span>Profile Unavailable</span>
//         )}
//       </button>
//     </div>
//   );
// }

import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

export default function MentorCard({ mentor }) {
  if (!mentor) return null;

  return (
    <div className="group w-full max-w-sm overflow-hidden rounded-2xl border border-primary/20 bg-surface p-6 shadow-[inset_0_-2px_8px_-3px_#93A57E] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      {" "}
      {/* top section */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl text-primary font-fugaz">
            {mentor.userId?.name}
          </h3>

          <p className="mt-2 text-sm leading-7 text-primary/80">{mentor.bio}</p>
        </div>

        {/* hourly rate */}
        <div className="px-3 py-2 text-sm rounded-xl bg-primary text-background whitespace-nowrap">
          ${mentor.hourlyRate}/hr
        </div>
      </div>
      {/* rating */}
      <div className="flex items-center gap-2 mt-5">
        <div className="flex items-center gap-1 px-3 py-1 border rounded-full bg-background border-primary/20">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />

          <span className="text-sm font-medium text-primary">
            {mentor.averageRating || "No ratings yet"}
          </span>
        </div>
      </div>
      {/* skills */}
      <div className="flex flex-wrap gap-2 mt-5">
        {mentor.skills?.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 text-sm border rounded-full border-primary/20 bg-background text-primary/80"
          >
            {skill}
          </span>
        ))}
      </div>
      {/* button */}
      <div className="mt-6">
        {mentor._id ? (
          <Link
            href={`/mentors/${mentor._id}`}
            className="inline-flex items-center gap-2 px-5 py-2 transition rounded-full bg-primary text-background hover:opacity-90"
          >
            View Profile
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button className="px-5 py-2 rounded-full cursor-not-allowed bg-primary/50 text-background">
            Profile Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
