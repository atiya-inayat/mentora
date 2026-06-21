"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";
import AllMentors from "./components/mentor/AllMentors";
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
  const router = useRouter();
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
    <main className="min-h-screen overflow-hidden bg-background text-primary">
      <Navbar />

      {/* HERO */}
      <section className="px-4 py-16 mx-auto sm:px-6 lg:px-8 max-w-7xl md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-flex px-4 py-2 text-xs border rounded-full sm:text-sm bg-surface/60 border-primary/20 text-primary/80">
            Trusted by thousands of learners worldwide
          </span>

          <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl text-primary">
            What do you want to
            <br className="hidden sm:block" />
            achieve next?
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-base leading-7 sm:text-lg text-primary/70">
            Get practical guidance from mentors who have already done it. Build
            confidence, grow faster, and unlock your next opportunity.
          </p>

          {/* SEARCH BOX */}
          <div className="p-4 mt-10 border shadow-xl rounded-3xl bg-primary border-primary/30 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <input
                type="text"
                placeholder={`${text}|`}
                className="w-full px-5 py-4 text-sm outline-none rounded-2xl bg-background/90 text-primary placeholder:text-primary/60"
              />

              <button onClick={() => router.push("/mentors")} className="px-6 py-4 font-medium transition-all rounded-2xl bg-surface text-primary hover:scale-[1.02] hover:shadow-lg">
                Find Mentor
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {[
                "Ace Interviews",
                "Switch Careers",
                "Lead Teams",
                "Start a Company",
              ].map((item) => (
                <span
                  key={item}
                  className="px-4 py-2 text-sm rounded-full bg-background/20 text-background"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPANIES */}
      <section className="py-10 border-y border-primary/10">
        <div className="flex flex-wrap items-center justify-center max-w-6xl gap-10 px-6 mx-auto sm:gap-16">
          {[FaAirbnb, FaAmazon, FaMeta, FaMicrosoft, FaSpotify, FaUber].map(
            (Icon, index) => (
              <Icon
                key={index}
                className="text-4xl transition sm:text-5xl text-primary/60 hover:text-primary"
              />
            ),
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section className="grid items-center px-4 py-20 mx-auto gap-14 sm:px-6 lg:px-8 max-w-7xl lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl text-primary">
            At your fingertips:
            <br />a dedicated career coach
          </h2>

          <p className="mt-6 text-base leading-8 text-primary/70">
            Learn high-demand skills with guidance from experienced mentors.
            Start your dream career, build your startup, and grow faster with
            personalized mentorship.
          </p>

          <div className="grid gap-4 mt-10 sm:grid-cols-2">
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
                className="flex items-center gap-3 p-4 border rounded-2xl bg-surface/70 border-primary/10"
              >
                <Check className="p-1 rounded-full shrink-0 bg-primary text-background" />

                <h3 className="text-sm font-medium text-primary/80">{item}</h3>
              </div>
            ))}
          </div>

          <button onClick={() => router.push("/mentors")} className="px-6 py-3 mt-8 font-medium transition-all rounded-2xl bg-primary text-background hover:scale-[1.02]">
            Browse Mentors
          </button>
        </div>

        <div className="relative h-[300px] sm:h-[450px] overflow-hidden rounded-3xl shadow-2xl">
          <Image
            src="/explainer.webp"
            alt="explainer"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid max-w-6xl gap-6 mx-auto md:grid-cols-3">
          {[
            ["7,000+", "Available mentors"],
            ["39,600+", "Matches made"],
            ["130+", "Countries represented"],
          ].map(([number, label]) => (
            <div
              key={label}
              className="p-8 text-center border shadow-xl rounded-3xl bg-surface border-primary/10"
            >
              <h2 className="text-4xl font-bold text-primary">{number}</h2>

              <p className="mt-3 text-primary/70">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEW */}
      <section className="max-w-4xl px-4 py-20 mx-auto text-center sm:px-6 lg:px-8">
        <p className="text-3xl text-yellow-500">★★★★★</p>

        <h2 className="mt-8 text-2xl leading-10 sm:text-3xl text-primary/90">
          “Having access to experienced mentors helped me finally land my dream
          role at Tesla.”
        </h2>

        <div className="flex items-center justify-center gap-4 mt-10">
          <div className="relative overflow-hidden rounded-full w-14 h-14">
            <Image src="/user3.jpg" alt="user" fill className="object-cover" />
          </div>

          <div className="text-left">
            <h3 className="font-semibold text-primary">Michele Verrielo</h3>

            <p className="text-sm text-primary/70">
              Software Engineer at Tesla
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-6xl px-4 py-20 mx-auto sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl text-primary">
            Long-term mentorship isn't just better — it's faster
          </h2>
        </div>

        <div className="relative mt-20">
          <div className="absolute hidden w-px h-full md:block left-6 bg-primary/20" />

          <div className="space-y-10">
            {steps.map((item, index) => (
              <div key={index} className="relative md:pl-20">
                <div className="absolute hidden w-5 h-5 border-4 rounded-full md:block left-4 top-10 bg-primary border-background" />

                <div className="grid items-center gap-8 p-6 border shadow-xl rounded-3xl bg-surface border-primary/10 lg:grid-cols-2">
                  <div className="relative h-64 overflow-hidden rounded-2xl bg-background">
                    <Image
                      src={item.image}
                      alt="step"
                      fill
                      className="object-contain p-6"
                    />
                  </div>

                  <div>
                    <span className="text-sm font-medium text-primary/50">
                      Step {index + 1}
                    </span>

                    <h3 className="mt-3 text-2xl font-semibold text-primary">
                      {item.text}
                    </h3>

                    <p className="mt-4 leading-8 text-primary/70">
                      Personalized mentorship designed to help you move faster
                      and make smarter career decisions.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="max-w-4xl px-4 py-20 mx-auto text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl text-primary">
          Explore 7,000+ available mentors
        </h2>

        <form className="flex flex-col gap-4 mt-10 md:flex-row">
          <input
            type="text"
            placeholder="Search by company, skills or role"
            className="flex-1 px-5 py-4 border shadow-lg outline-none rounded-2xl bg-surface/60 border-primary/20 placeholder:text-primary/50"
          />

          <button onClick={() => router.push("/mentors")} className="px-6 py-4 font-medium transition-all rounded-2xl bg-primary text-background hover:scale-[1.02]">
            Find Mentors
          </button>
        </form>
      </section>

      {/* MENTORS */}
      <section className="px-4 py-20 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl font-semibold sm:text-4xl text-primary">
            All Mentors
          </h2>

          <p className="mt-3 text-primary/70">
            Learn from experienced industry professionals.
          </p>
        </div>

        <AllMentors />
      </section>

      {/* FINAL CTA */}
      <section className="px-4 py-20 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="relative overflow-hidden border shadow-2xl rounded-3xl bg-surface border-primary/20">
          <div className="absolute top-0 right-0 rounded-full w-72 h-72 bg-primary/10 blur-3xl" />

          <div className="relative z-10 p-6 md:p-12">
            <div className="max-w-3xl">
              <span className="inline-flex px-4 py-2 text-sm border rounded-full bg-background border-primary/20 text-primary">
                Trusted by thousands of learners
              </span>

              <h2 className="mt-6 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl text-primary">
                An arsenal of industry veterans and mentoring packages
              </h2>

              <p className="mt-6 leading-8 text-primary/70">
                Pick from a curated collection of mentors and services. Grow
                faster with personalized mentorship.
              </p>
            </div>

            <div className="overflow-hidden mt-14">
              <AllMentors />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
