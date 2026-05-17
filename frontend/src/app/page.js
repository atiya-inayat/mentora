"use client";

import { useEffect, useState } from "react";
import Footer from "./components/Footer";
import AllMentors from "./components/mentor/AllMentors";
import MentorCard from "./components/mentor/MentorCard";
import Navbar from "./components/shared/Navbar";
import {
  FaAirbnb,
  FaAmazon,
  FaSpotify,
  FaUber,
  FaMeta,
  FaMicrosoft,
} from "react-icons/fa6";
import Image from "next/image";
import { Check } from "lucide-react";

export default function Home() {
  const placeholders = [
    "I want to break into database engineering",
    "Help me become a frontend developer",
    "I want to learn AI engineering",
    "Guide me into cybersecurity",
  ];

  const [text, setText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentText = placeholders[lineIndex];

    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + currentText[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 60);

      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setText("");
        setCharIndex(0);
        setLineIndex((prev) => (prev + 1) % placeholders.length);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [charIndex, lineIndex]);

  const steps = [
    {
      text: "Explore a curated network of vetted mentors.",
      image: "/discover.svg",
    },
    {
      text: "Choose a flexible mentoring plan.",
      image: "/start.svg",
    },
    {
      text: "Get ongoing support through regular calls.",
      image: "/meet.svg",
    },
    {
      text: "Reach your goals 2x faster with mentorship.",
      image: "/grow.svg",
    },
  ];

  return (
    <main className="min-h-screen text-gray-800 bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="px-6 py-20 mx-auto text-center max-w-7xl">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl text-primary">
          What do you want to <br /> achieve next?
        </h1>

        <p className="max-w-2xl mx-auto mt-5 text-base leading-7 text-gray-600">
          Get practical guidance from a mentor who has already done it.
        </p>

        <div className="flex flex-col items-center justify-center gap-3 py-3 mt-10 rounded-md shadow-sm bg-primary">
          <div>
            <input
              type="text"
              placeholder={`${text}|`}
              className="w-full md:w-[500px] px-4 py-3 text-lg border rounded-md bg-primary  border-primary/20 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-background"
            />
          </div>

          <div className="flex items-center justify-center gap-5 ">
            <div>
              <span className="px-2 py-1 mx-2 font-mono border rounded-lg cursor-pointer text-background bg-surface/40 ">
                Ace Interviews
              </span>
              <span className="px-2 py-1 mx-2 font-mono border rounded-lg cursor-pointer text-background bg-surface/40 ">
                Switch Careers
              </span>
              <span className="px-2 py-1 mx-2 font-mono border rounded-lg cursor-pointer text-background bg-surface/40 ">
                Lead teams
              </span>
              <span className="px-2 py-1 mx-2 font-mono border rounded-lg cursor-pointer text-background bg-surface/40 ">
                Start a company
              </span>
            </div>

            <div>
              <button className="px-4 py-2 rounded-md text-background bg-surface/40 hover:opacity-60">
                Find Mentor
              </button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <MentorCard />
        </div>
      </section>

      <hr className="text-primary" />
      {/* Companies */}
      <section className="py-10 border-y border-primary/10">
        <div className="flex flex-wrap justify-center max-w-6xl gap-16 px-6 mx-auto text-lg font-medium text-gray-600">
          <h2>
            <FaAirbnb className="text-5xl transition text-primary hover:text-surface" />{" "}
          </h2>
          <h2>
            <FaAmazon className="text-5xl transition text-primary hover:text-surface" />
          </h2>
          <h2>
            <FaMeta className="text-5xl transition text-primary hover:text-surface " />
          </h2>
          <h2>
            <FaMicrosoft className="text-5xl transition text-primary hover:text-surface" />
          </h2>
          <h2>
            <FaSpotify className="text-5xl transition text-primary hover:text-surface" />
          </h2>
          <h2>
            <FaUber className="text-5xl transition text-primary hover:text-surface" />
          </h2>
        </div>
      </section>

      {/* About */}
      <section className="grid items-center gap-16 px-6 py-24 mx-auto max-w-7xl md:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold leading-tight text-primary">
            At your fingertips:
            <br />a dedicated career coach
          </h2>

          <p className="mt-6 leading-8 text-gray-600">
            Want to start a new dream career? Successfully build your startup?
            Learn high-demand skills with guidance from experienced mentors.
            Become unstoppable using Mentora.
          </p>

          <div className="grid grid-cols-1 gap-4 mt-10 sm:grid-cols-2">
            {[
              "Thousands of mentors available",
              "Flexible program structure",
              "Free trial",
              "Personal chats",
              "1-on-1 calls",
              "97% satisfaction rate",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-4 border rounded-2xl bg-surface border-primary/10"
              >
                <span className="text-primary">
                  <Check className="p-1 rounded-full text-surface shrink-0 bg-primary" />{" "}
                </span>

                <h3 className="text-sm font-medium text-gray-700">{item}</h3>
              </div>
            ))}
          </div>

          <button className="px-5 py-3 mt-8 text-sm font-medium text-white transition rounded-3xl bg-primary hover:opacity-90">
            Browse mentors
          </button>
        </div>

        <div className="relative  rounded-xl h-[450px] overflow-hidden  ">
          <Image
            src="/explainer.webp"
            alt="image"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="grid max-w-5xl grid-cols-1 gap-6 px-6 py-16 mx-auto text-center bg-surface shadow-[inset_0_2px_10px_-6px_#93A57E] rounded-md bg-primary/80 md:grid-cols-3">
        {[
          ["7,000+", "Available mentors"],
          ["39,600+", "Matches made"],
          ["130+", "Countries represented"],
        ].map(([number, label]) => (
          <div
            key={label}
            className="p-8 border rounded-lg shadow-2xl bg-surface/80 border-primary/10"
          >
            <h1 className="text-4xl font-semibold text-primary">{number}</h1>

            <h3 className="mt-3 text-sm text-gray-600">{label}</h3>
          </div>
        ))}
      </section>

      {/* Review */}
      <section className="max-w-4xl px-6 py-24 mx-auto text-center">
        <p className="text-3xl text-yellow-500">★★★★★</p>

        <p className="mt-8 text-2xl leading-10 text-gray-700">
          "Having access to the knowledge and experience of mentors on Mentora
          was an opportunity I couldn't miss. Thanks to my mentor, I managed to
          reach my goal of joining Tesla."
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          {/* Avatar */}
          <div className="relative overflow-hidden rounded-full w-14 h-14 bg-primary/30">
            <Image src="/user3.jpg" alt="user" fill className="object-cover" />
          </div>

          {/* Text */}
          <div className="text-left">
            <h3 className="font-medium text-primary">Michele Verrielo</h3>

            <p className="text-sm text-primary/70">
              Software Engineer at Tesla
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="flex items-start max-w-6xl px-6 py-24 mx-auto">
        <div className="sticky top-0 z-50">
          <h2 className="max-w-3xl mx-auto text-4xl font-semibold leading-tight text-center text-primary">
            Long-term mentorship isn't just better — it's faster
          </h2>
        </div>

        <div className="relative mt-16">
          {/* vertical line */}
          <div className="absolute top-0 bottom-0 w-px left-4 bg-primary/30" />

          <div className="grid gap-10 md:grid-cols-1">
            {steps.map((item, index) => (
              <div key={index} className="relative pl-14">
                {/* dot */}
                <div className="absolute w-4 h-4 border-2 rounded-full left-2 top-6 bg-primary border-background" />

                {/* card */}
                <div className="p-6 border rounded-lg bg-surface border-primary/10">
                  {/* image */}
                  <div className="relative h-40 mb-6 overflow-hidden border rounded-md bg-background border-primary/10">
                    <Image
                      src={item.image}
                      alt="step image"
                      fill
                      className="object-contain p-4"
                    />
                  </div>

                  {/* text */}
                  <p className="leading-7 text-primary/80">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore */}
      <section className="max-w-4xl px-6 py-24 mx-auto text-center">
        <h2 className="text-4xl font-semibold text-primary">
          Explore 7,000+ available mentors
        </h2>

        <form className="flex flex-col gap-4 mt-10 md:flex-row">
          <input
            type="text"
            placeholder="Search by company, skills or role"
            className="flex-1 px-4 py-3 text-sm border rounded-md outline-none bg-surface border-primary/20 focus:ring-1 focus:ring-primary focus:border-primary"
          />

          <button className="px-5 py-3 text-sm font-medium text-white transition rounded-md bg-primary hover:opacity-90">
            Find Mentors
          </button>
        </form>
      </section>

      {/* Mentors */}
      <section className="px-6 py-20 mx-auto max-w-7xl">
        <div className="mb-10">
          <h2 className="text-4xl font-semibold text-primary">All Mentors</h2>

          <p className="mt-3 text-gray-600">
            Learn from experienced industry professionals.
          </p>
        </div>

        <AllMentors />
      </section>

      {/* Second Review */}
      <section className="max-w-4xl px-6 py-24 mx-auto text-center">
        <p className="text-2xl text-primary">★★★★★</p>

        <h3 className="mt-8 text-2xl leading-10 text-gray-700">
          "After years of self-studying with books and courses, I finally joined
          MentorCruise. After a few sessions, my feelings changed completely."
        </h3>

        <div className="flex items-center justify-center gap-4 mt-10">
          <div className="rounded-full w-14 h-14 bg-primary/30" />

          <div className="text-left">
            <h2 className="font-medium text-gray-800">Mauro Bandra</h2>

            <p className="text-sm text-gray-600">Data Scientist at Printify</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl px-6 py-24 mx-auto">
        <div className="p-10 border rounded-xl bg-surface border-primary/10">
          <h2 className="text-4xl font-semibold leading-tight text-primary">
            An arsenal of industry veterans and mentoring packages
          </h2>

          <p className="max-w-3xl mt-6 leading-8 text-gray-600">
            Pick from a curated collection of mentors and services. Try them out
            with no obligation and grow faster with personalized mentorship.
          </p>

          <div className="mt-12">
            <AllMentors />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import Footer from "./components/Footer";
// import AllMentors from "./components/mentor/AllMentors";
// import MentorCard from "./components/mentor/MentorCard";
// import Navbar from "./components/shared/Navbar";
// import {
//   FaAirbnb,
//   FaAmazon,
//   FaSpotify,
//   FaUber,
//   FaMeta,
//   FaMicrosoft,
// } from "react-icons/fa6";

// export default function Home() {
//   const placeholders = [
//     "I want to break into database engineering",
//     "Help me become a frontend developer",
//     "I want to learn AI engineering",
//     "Guide me into cybersecurity",
//   ];

//   const [text, setText] = useState("");
//   const [lineIndex, setLineIndex] = useState(0);
//   const [charIndex, setCharIndex] = useState(0);

//   useEffect(() => {
//     const currentText = placeholders[lineIndex];

//     if (charIndex < currentText.length) {
//       const timeout = setTimeout(() => {
//         setText((prev) => prev + currentText[charIndex]);
//         setCharIndex((prev) => prev + 1);
//       }, 60);

//       return () => clearTimeout(timeout);
//     } else {
//       const timeout = setTimeout(() => {
//         setText("");
//         setCharIndex(0);
//         setLineIndex((prev) => (prev + 1) % placeholders.length);
//       }, 2000);

//       return () => clearTimeout(timeout);
//     }
//   }, [charIndex, lineIndex]);

//   return (
//     <main className="min-h-screen bg-background text-primary">
//       <Navbar />

//       {/* Hero Section */}
//       <section className="px-6 py-20 mx-auto text-center max-w-7xl">
//         <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
//           What do you want to <br /> achieve next?
//         </h1>

//         <p className="max-w-2xl mx-auto mt-5 text-base leading-7 opacity-80">
//           Get practical guidance from a mentor who has already done it.
//         </p>

//         {/* Search Box */}
//         <div className="flex flex-col items-center gap-4 p-6 mt-10 border rounded-lg shadow-lg bg-surface border-primary/20">
//           <input
//             type="text"
//             placeholder={`${text}|`}
//             className="w-full md:w-[500px] px-4 py-3 text-lg rounded-md bg-background border border-primary/20 outline-none focus:ring-1 focus:ring-primary placeholder:text-primary/60"
//           />

//           <div className="flex flex-wrap items-center justify-center gap-3">
//             {[
//               "Ace Interviews",
//               "Switch Careers",
//               "Lead teams",
//               "Start a company",
//             ].map((item) => (
//               <span
//                 key={item}
//                 className="px-3 py-1 text-sm border rounded-lg cursor-pointer bg-background border-primary/20 hover:border-primary/60"
//               >
//                 {item}
//               </span>
//             ))}

//             <button className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-background hover:opacity-90">
//               Find Mentor
//             </button>
//           </div>
//         </div>

//         <div className="mt-16">
//           <MentorCard />
//         </div>
//       </section>

//       {/* Companies */}
//       <section className="py-10 border-y border-primary/20">
//         <div className="flex flex-wrap justify-center gap-10 text-primary/70">
//           <FaAirbnb className="text-5xl hover:text-primary" />
//           <FaAmazon className="text-5xl hover:text-primary" />
//           <FaMeta className="text-5xl hover:text-primary" />
//           <FaMicrosoft className="text-5xl hover:text-primary" />
//           <FaSpotify className="text-5xl hover:text-primary" />
//           <FaUber className="text-5xl hover:text-primary" />
//         </div>
//       </section>

//       {/* About */}
//       <section className="grid items-center gap-16 px-6 py-24 mx-auto max-w-7xl md:grid-cols-2">
//         <div>
//           <h2 className="text-4xl font-semibold leading-tight">
//             At your fingertips:
//             <br />a dedicated career coach
//           </h2>

//           <p className="mt-6 leading-8 opacity-80">
//             Want to start a new dream career? Build startups? Learn high-demand
//             skills with guidance from experienced mentors.
//           </p>

//           <div className="grid grid-cols-1 gap-4 mt-10 sm:grid-cols-2">
//             {[
//               "Thousands of mentors available",
//               "Flexible program structure",
//               "Free trial",
//               "Personal chats",
//               "1-on-1 calls",
//               "97% satisfaction rate",
//             ].map((item) => (
//               <div
//                 key={item}
//                 className="flex items-center gap-3 p-4 border rounded-lg bg-surface border-primary/20"
//               >
//                 <span>✔</span>
//                 <h3 className="text-sm opacity-90">{item}</h3>
//               </div>
//             ))}
//           </div>

//           <button className="px-5 py-3 mt-8 text-sm font-medium rounded-md bg-primary text-background hover:opacity-90">
//             Browse mentors
//           </button>
//         </div>

//         <div className="border rounded-xl h-[450px] flex items-center justify-center opacity-70 bg-surface border-primary/20">
//           Image / Illustration
//         </div>
//       </section>

//       {/* Stats */}
//       <section className="grid max-w-5xl grid-cols-1 gap-6 px-6 py-16 mx-auto text-center md:grid-cols-3">
//         {[
//           ["7,000+", "Available mentors"],
//           ["39,600+", "Matches made"],
//           ["130+", "Countries represented"],
//         ].map(([number, label]) => (
//           <div
//             key={label}
//             className="p-8 border rounded-lg bg-surface border-primary/20"
//           >
//             <h1 className="text-4xl font-semibold">{number}</h1>
//             <h3 className="mt-3 text-sm opacity-80">{label}</h3>
//           </div>
//         ))}
//       </section>

//       {/* Review */}
//       <section className="max-w-4xl px-6 py-24 mx-auto text-center">
//         <p className="text-2xl">★★★★★</p>

//         <p className="mt-8 text-2xl leading-10 opacity-90">
//           "Having access to mentors on Mentora helped me reach my goal of
//           joining Tesla."
//         </p>

//         <div className="flex items-center justify-center gap-4 mt-10">
//           <div className="rounded-full w-14 h-14 bg-primary/30" />

//           <div className="text-left">
//             <h3 className="font-medium">Michele Verrielo</h3>
//             <p className="text-sm opacity-80">Software Engineer at Tesla</p>
//           </div>
//         </div>
//       </section>

//       {/* Process */}
//       <section className="max-w-6xl px-6 py-24 mx-auto">
//         <h2 className="max-w-3xl mx-auto text-4xl font-semibold leading-tight text-center">
//           Long-term mentorship is faster
//         </h2>

//         <div className="grid gap-8 mt-16 md:grid-cols-2">
//           {[
//             "Explore vetted mentors",
//             "Choose flexible plans",
//             "Get ongoing support",
//             "Reach goals faster",
//           ].map((text, index) => (
//             <div
//               key={index}
//               className="p-6 border rounded-lg bg-surface border-primary/20"
//             >
//               <div className="flex items-center justify-center h-40 mb-6 border rounded-md bg-background border-primary/20 opacity-70">
//                 Image
//               </div>

//               <p className="opacity-90">{text}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <Footer />
//     </main>
//   );
// }
