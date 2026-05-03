import Link from "next/link";

export default function MentorCard({ mentor }) {
  return (
    <div>
      <h3>{mentor.userId?.name}</h3>
      <p>{mentor.bio}</p>
      <p>${mentor.hourlyRate}/hr</p>
      <p>⭐ {mentor.averageRating || "No ratings yet"}</p>
      <p>{mentor.skills?.join(", ")}</p>
      <Link href={`/mentors/${mentor._id}`}>View Profile</Link>
    </div>
  );
}
