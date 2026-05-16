import Footer from "./components/Footer";
import AllMentors from "./components/mentor/AllMentors";
import MentorCard from "./components/mentor/MentorCard";
import Navbar from "./components/shared/Navbar";

export default function Home() {
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

        <div className="flex flex-col items-center justify-center gap-3 mt-10 md:flex-row">
          <input
            type="text"
            placeholder="I want to break into database engineering"
            className="w-full md:w-[500px] px-4 py-3 text-sm border rounded-md bg-surface border-primary/20 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />

          <button className="px-5 py-3 text-sm font-medium text-white transition rounded-md bg-primary hover:opacity-90">
            Find Mentor
          </button>
        </div>

        <div className="mt-16">
          <MentorCard />
        </div>
      </section>

      {/* Companies */}
      <section className="py-10 border-y border-primary/10">
        <div className="flex flex-wrap justify-center max-w-6xl gap-10 px-6 mx-auto text-lg font-medium text-gray-600">
          <h2>Airbnb</h2>
          <h2>Amazon</h2>
          <h2>Meta</h2>
          <h2>Microsoft</h2>
          <h2>Spotify</h2>
          <h2>Uber</h2>
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
                className="flex items-center gap-3 p-4 border rounded-lg bg-surface border-primary/10"
              >
                <span className="text-primary">✔</span>

                <h3 className="text-sm font-medium text-gray-700">{item}</h3>
              </div>
            ))}
          </div>

          <button className="px-5 py-3 mt-8 text-sm font-medium text-white transition rounded-md bg-primary hover:opacity-90">
            Browse mentors
          </button>
        </div>

        <div className="border rounded-xl h-[450px] flex items-center justify-center text-gray-500 bg-surface border-primary/10">
          Image / Illustration
        </div>
      </section>

      {/* Stats */}
      <section className="grid max-w-5xl grid-cols-1 gap-6 px-6 py-16 mx-auto text-center md:grid-cols-3">
        {[
          ["7,000+", "Available mentors"],
          ["39,600+", "Matches made"],
          ["130+", "Countries represented"],
        ].map(([number, label]) => (
          <div
            key={label}
            className="p-8 border rounded-lg bg-surface border-primary/10"
          >
            <h1 className="text-4xl font-semibold text-primary">{number}</h1>

            <h3 className="mt-3 text-sm text-gray-600">{label}</h3>
          </div>
        ))}
      </section>

      {/* Review */}
      <section className="max-w-4xl px-6 py-24 mx-auto text-center">
        <p className="text-2xl text-primary">★★★★★</p>

        <p className="mt-8 text-2xl leading-10 text-gray-700">
          "Having access to the knowledge and experience of mentors on Mentora
          was an opportunity I couldn't miss. Thanks to my mentor, I managed to
          reach my goal of joining Tesla."
        </p>

        <div className="flex items-center justify-center gap-4 mt-10">
          <div className="rounded-full w-14 h-14 bg-primary/30" />

          <div className="text-left">
            <h3 className="font-medium text-gray-800">Michele Verrielo</h3>

            <p className="text-sm text-gray-600">Software Engineer at Tesla</p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-6xl px-6 py-24 mx-auto">
        <h2 className="max-w-3xl mx-auto text-4xl font-semibold leading-tight text-center text-primary">
          Long-term mentorship isn't just better — it's faster
        </h2>

        <div className="grid gap-8 mt-16 md:grid-cols-2">
          {[
            "Explore a curated network of vetted mentors.",
            "Choose a flexible mentoring plan.",
            "Get ongoing support through regular calls.",
            "Reach your goals 2x faster with mentorship.",
          ].map((text, index) => (
            <div
              key={index}
              className="p-6 border rounded-lg bg-surface border-primary/10"
            >
              <div className="flex items-center justify-center h-40 mb-6 text-sm text-gray-500 border rounded-md bg-background border-primary/10">
                Image
              </div>

              <p className="leading-7 text-gray-700">{text}</p>
            </div>
          ))}
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
