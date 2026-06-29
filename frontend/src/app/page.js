"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "./components/Footer";
import AllMentors from "./components/mentor/AllMentors";
import Navbar from "./components/shared/Navbar";
import { FaAirbnb, FaAmazon, FaSpotify, FaUber, FaMeta, FaMicrosoft } from "react-icons/fa6";
import Image from "next/image";
import { Check, Search } from "lucide-react";

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
      <section className="px-4 pt-20 pb-16 mx-auto sm:px-6 lg:px-8 max-w-7xl md:pt-28 md:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl text-primary">
            Find your
            <br />
            next mentor.
          </h1>

          <p className="max-w-2xl mx-auto mt-6 text-lg leading-8 text-white/50">
            Break through plateaus with honest feedback and guidance from a mentor who has been
            exactly where you are.
          </p>

          {/* SEARCH BOX */}
          <div className="p-5 mt-12 glass-card rounded-3xl md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  placeholder={`${text}|`}
                  className="w-full pl-12 pr-5 py-4 text-sm outline-none rounded-2xl bg-white/[0.04] text-primary placeholder:text-white/30 border border-white/5 focus:border-primary transition-colors"
                />
              </div>

              <button
                onClick={() => router.push("/mentors")}
                className="px-8 py-4 font-semibold transition-all rounded-2xl bg-primary text-white hover:opacity-90 text-sm"
              >
                Find Mentor
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {["Ace Interviews", "Switch Careers", "Lead Teams", "Start a Company"].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 text-xs rounded-full bg-white/[0.06] text-white/60 border border-white/5 hover:bg-white/[0.10] transition-colors cursor-default"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPANIES */}
      <section className="py-10 border-y border-white/10">
        <div className="flex flex-wrap items-center justify-center max-w-6xl gap-10 px-6 mx-auto sm:gap-16">
          {[FaAirbnb, FaAmazon, FaMeta, FaMicrosoft, FaSpotify, FaUber].map((Icon, index) => (
            <Icon
              key={index}
              className="text-4xl transition sm:text-5xl text-white/40 hover:text-primary"
            />
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="grid items-center px-4 py-20 mx-auto gap-14 sm:px-6 lg:px-8 max-w-7xl lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl text-primary">
            At your fingertips:
            <br />a dedicated career coach
          </h2>

          <p className="mt-6 text-base leading-8 text-white/60">
            Learn high-demand skills with guidance from experienced mentors. Start your dream
            career, build your startup, and grow faster with personalized mentorship.
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
                className="flex items-center gap-3 p-4 glass-card rounded-2xl"
              >
                <Check className="p-1 rounded-full shrink-0 bg-primary text-white" />

                <h3 className="text-sm font-medium text-white/70">{item}</h3>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push("/mentors")}
            className="px-6 py-3 mt-8 font-medium transition-all rounded-2xl bg-primary text-white hover:scale-[1.02]"
          >
            Browse Mentors
          </button>
        </div>

        <div className="relative h-[300px] sm:h-[450px] overflow-hidden rounded-3xl shadow-2xl">
          <Image src="/explainer.webp" alt="explainer" fill className="object-cover" />
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
              className="p-8 text-center glass-card rounded-3xl shadow-xl"
            >
              <h2 className="text-4xl font-bold text-primary">{number}</h2>

              <p className="mt-3 text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* REVIEW */}
      <section className="max-w-4xl px-4 py-20 mx-auto text-center sm:px-6 lg:px-8">
        <p className="text-3xl text-yellow-500">★★★★★</p>

        <h2 className="mt-8 text-2xl leading-10 sm:text-3xl text-primary/90">
          “Having access to experienced mentors helped me finally land my dream role at Tesla.”
        </h2>

        <div className="flex items-center justify-center gap-4 mt-10">
          <div className="relative overflow-hidden rounded-full w-14 h-14">
            <Image src="/user3.jpg" alt="user" fill className="object-cover" />
          </div>

          <div className="text-left">
            <h3 className="font-semibold text-primary">Michele Verrielo</h3>

            <p className="text-sm text-white/60">Software Engineer at Tesla</p>
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

                <div className="grid items-center gap-8 p-6 glass-card rounded-3xl shadow-xl lg:grid-cols-2">
                  <div className="relative h-64 overflow-hidden rounded-2xl bg-background">
                    <Image src={item.image} alt="step" fill className="object-contain p-6" />
                  </div>

                  <div>
                    <span className="text-sm font-medium text-white/40">Step {index + 1}</span>

                    <h3 className="mt-3 text-2xl font-semibold text-primary">{item.text}</h3>

                    <p className="mt-4 leading-8 text-white/60">
                      Personalized mentorship designed to help you move faster and make smarter
                      career decisions.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENTORS */}
      <section className="px-4 py-24 mx-auto sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl text-primary">
            Explore 7,000+ available mentors
          </h2>

          <p className="mt-4 text-white/50">Learn from experienced industry professionals.</p>
        </div>

        <AllMentors />

        <div className="mt-12 text-center">
          <button
            onClick={() => router.push("/mentors")}
            className="px-8 py-3.5 font-semibold transition-all rounded-2xl glass-card text-primary hover:bg-white/[0.08] text-sm"
          >
            View all mentors →
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}
