"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Search, ArrowRight, Quote, Sparkles } from "lucide-react";
import Footer from "./components/Footer";
import AllMentors from "./components/mentor/AllMentors";
import Navbar from "./components/shared/Navbar";
import {
  FaAirbnb,
  FaAmazon,
  FaMeta,
  FaMicrosoft,
  FaSpotify,
  FaUber,
} from "react-icons/fa6";

const placeholders = [
  "I want to break into database engineering",
  "Help me become a frontend developer",
  "I want to learn AI engineering",
  "Guide me into cybersecurity",
];

function TypewriterInput() {
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

  return (
    <motion.input
      type="text"
      placeholder={`${text}|`}
      className="input-field pl-12 pr-5 py-4 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.4 }}
    />
  );
}

function FadeIn({ children, y = 24, delay = 0, duration = 0.6, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ from = 0, to, suffix = "", duration = 2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const step = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const features = [
  {
    title: "Curated mentor network",
    description: "Every mentor is vetted for expertise and communication skills. No noise, just signal.",
    image: "/explainer.png",
  },
  {
    title: "Flexible scheduling",
    description: "Book sessions that fit your calendar. Reschedule anytime.",
  },
  {
    title: "Personalized growth plans",
    description: "Your mentor designs a roadmap based on your goals and current level.",
  },
];

const stats = [
  { value: 7000, label: "Available mentors", suffix: "+" },
  { value: 39600, label: "Matches made", suffix: "+" },
  { value: 130, label: "Countries represented", suffix: "+" },
];

const testimonials = [
  {
    quote: "Having access to experienced mentors helped me finally land my dream role at Tesla. The personalized guidance was invaluable.",
    name: "Michele Verrielo",
    role: "Software Engineer at Tesla",
    image: "/user3.jpg",
  },
  {
    quote: "The structured mentorship program helped me transition from design to engineering in just six months. Life-changing experience.",
    name: "Alex Chen",
    role: "Frontend Engineer at Stripe",
    image: "/user2.jpeg",
  },
];

const steps = [
  {
    number: "01",
    title: "Browse profiles",
    description: "Explore mentors by skill, industry, and experience level.",
  },
  {
    number: "02",
    title: "Book a session",
    description: "Pick a time that works for you and secure your slot.",
  },
  {
    number: "03",
    title: "Meet your mentor",
    description: "Connect via video call and start the conversation.",
  },
  {
    number: "04",
    title: "Grow consistently",
    description: "Ongoing guidance with a personalized roadmap.",
  },
];

export default function Home() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const headline = "Find your next mentor";
  const words = headline.split(" ");

  const browseMentors = () => router.push("/mentors");

  return (
    <main className="min-h-[100dvh] overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 pt-28 md:pt-32 pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div
            className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)",
              animation: "hero-glow 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute top-[30%] left-[30%] w-[300px] h-[300px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 60%)",
              animation: "hero-glow 8s ease-in-out infinite 1s",
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <FadeIn y={16} delay={0.1}>
            <motion.span
              className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 text-xs font-medium rounded-full border text-primary border-primary/20 bg-primary-muted"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={reduce ? false : { opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <Sparkles className="w-3 h-3" />
              Trusted by 7,000+ mentors worldwide
            </motion.span>
          </FadeIn>

          <h1 className="text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl md:text-7xl text-foreground">
            {reduce ? (
              headline
            ) : (
              words.map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + i * 0.12,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                  {i < words.length - 1 ? "\u00A0" : ""}
                </motion.span>
              ))
            )}
          </h1>

          <FadeIn y={16} delay={0.6}>
            <p className="max-w-xl mx-auto mt-5 text-lg leading-relaxed text-muted">
              Break through plateaus with honest feedback and guidance from a
              mentor who has been exactly where you are.
            </p>
          </FadeIn>

          <FadeIn y={16} delay={0.8} className="mt-10">
            <div className="card p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.4 }}
                  >
                    <Search className="absolute w-5 h-5 -translate-y-1/2 left-4 top-1/2 text-muted" />
                  </motion.div>
                  <TypewriterInput />
                </div>
                <motion.button
                  onClick={browseMentors}
                  className="btn-primary px-8 py-4 rounded-xl text-sm shrink-0"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3, duration: 0.4 }}
                  whileHover={reduce ? false : { scale: 1.02 }}
                  whileTap={reduce ? false : { scale: 0.97 }}
                >
                  Browse Mentors
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {["Ace Interviews", "Switch Careers", "Lead Teams", "Start a Company"].map(
                  (item, i) => (
                    <motion.span
                      key={item}
                      onClick={browseMentors}
                      className="px-3 py-1.5 text-xs rounded-full bg-white/[0.04] text-muted border border-border hover:bg-white/[0.08] transition-colors cursor-pointer"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={reduce ? false : { opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + i * 0.08, duration: 0.3 }}
                    >
                      {item}
                    </motion.span>
                  )
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-14 border-y border-border">
        <div className="flex flex-wrap items-center justify-center max-w-5xl gap-12 px-6 mx-auto sm:gap-16">
          {[FaAirbnb, FaAmazon, FaMeta, FaMicrosoft, FaSpotify, FaUber].map(
            (Icon, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
              >
                <Icon className="text-3xl transition sm:text-4xl text-muted hover:text-foreground" />
              </motion.div>
            )
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-28 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl text-foreground max-w-2xl">
              Mentorship that actually works
            </h2>
            <p className="mt-4 text-muted max-w-lg">
              Not another marketplace. A focused network designed for real career acceleration.
            </p>
          </FadeIn>

          <div className="grid gap-4 mt-14 md:grid-cols-3 md:grid-rows-[280px_280px]">
            <FadeIn delay={0.1} className="md:col-span-2 md:row-span-2">
              <div className="card h-full p-6 md:p-8 flex flex-col relative overflow-hidden group">
                <div className="relative flex-1 w-full h-48 md:h-auto rounded-xl overflow-hidden mb-5 md:absolute md:inset-0 md:m-0 md:rounded-none">
                  <Image
                    src={features[0].image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                </div>
                <div className="relative z-10 mt-auto">
                  <h3 className="text-xl font-semibold text-foreground">
                    {features[0].title}
                  </h3>
                  <p className="mt-2 text-sm text-muted max-w-md">
                    {features[0].description}
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="card h-full p-6 flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-muted mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{features[1].title}</h3>
                <p className="mt-2 text-sm text-muted flex-1">{features[1].description}</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="card h-full p-6 flex flex-col">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-muted mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{features[2].title}</h3>
                <p className="mt-2 text-sm text-muted flex-1">{features[2].description}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-28 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-5 md:grid-cols-3">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="card-raised p-10 text-center">
                  <span className="block text-5xl font-bold tracking-tight text-primary">
                    <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="block mt-2 text-sm text-muted">{stat.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-4 py-28 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl text-foreground">
              What our community says
            </h2>
          </FadeIn>

          <div className="grid gap-5 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card-raised p-8 md:p-10 h-full flex flex-col">
                  <Quote className="w-6 h-6 text-primary/30 mb-4" />
                  <blockquote className="text-base leading-relaxed text-foreground/80 flex-1">
                    {t.quote}
                  </blockquote>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border">
                    <div className="relative overflow-hidden rounded-full w-10 h-10 ring-2 ring-border shrink-0">
                      <Image
                        src={t.image}
                        alt={t.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="px-4 py-28 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl text-foreground">
              Four steps to your next breakthrough
            </h2>
            <p className="mt-4 text-muted max-w-lg mx-auto">
              From discovery to growth, every step is designed for momentum.
            </p>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card p-6 text-center h-full">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-surface border border-border text-sm font-semibold text-primary">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{step.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* MENTORS */}
      <section className="px-4 py-24 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-semibold sm:text-4xl md:text-5xl text-foreground">
            Learn from the best
          </h2>
          <p className="mt-3 text-muted">
            Industry professionals ready to guide your next move.
          </p>
        </FadeIn>

        <AllMentors />

        <FadeIn className="mt-12 text-center" delay={0.2}>
          <motion.button
            onClick={browseMentors}
            className="btn-ghost px-8 py-3.5 rounded-xl text-sm inline-flex items-center gap-2"
            whileHover={reduce ? false : { scale: 1.02 }}
            whileTap={reduce ? false : { scale: 0.97 }}
          >
            Browse all mentors
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="px-4 py-28 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center card-raised p-12 md:p-16 relative overflow-hidden">
            <div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 60%)",
              }}
            />
            <h2 className="text-3xl font-semibold sm:text-4xl text-foreground relative">
              Ready to find your mentor?
            </h2>
            <p className="mt-4 text-muted max-w-md mx-auto relative">
              Join thousands of professionals who have transformed their careers with personalized mentorship.
            </p>
            <motion.button
              onClick={browseMentors}
              className="btn-primary px-8 py-4 rounded-xl text-sm mt-8 inline-flex items-center gap-2 relative"
              whileHover={reduce ? false : { scale: 1.02 }}
              whileTap={reduce ? false : { scale: 0.97 }}
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
