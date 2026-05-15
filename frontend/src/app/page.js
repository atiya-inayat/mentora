import Footer from "./components/Footer";
import AllMentors from "./components/mentor/AllMentors";
import MentorCard from "./components/mentor/MentorCard";
import Navbar from "./components/shared/Navbar";

export default function Home() {
  return (
    <div>
      <div>
        <Navbar />

        <div>
          <h1>What do you want to achieve next?</h1>
          <p>Get practical guidance from a mentor who has already done it.</p>
        </div>

        <div>
          <input type="text" placeholder="i want to break into data base" />
        </div>

        <div>
          <MentorCard />
        </div>

        <div>
          <h2>airbnb</h2>
          <h2>amazon</h2>
          <h2>Meta</h2>
          <h2>Microsoft</h2>
          <h2>spotify</h2>
          <h2>Uber</h2>
        </div>

        <div>
          <div>
            <h2>
              At your fingertips: <br /> a dedicated career coach{" "}
            </h2>
            <p>
              Want to sart a new dream career? Successfully build your startup?
              Itching to learn high-demand skills? Work smart with an online
              mentor by your side to offer expert advice and guidance to match
              your zeal. Become unstoppable using Mnetora.{" "}
            </p>

            <div>
              <span> tick </span> <h3>Thousand of mentors available</h3>
              <span> tick </span> <h3>Flexable program structure</h3>
              <span> tick </span> <h3>Free trial</h3>
              <span> tick </span> <h3>Personal chats</h3>
              <span> tick </span> <h3>1-on-1 calls</h3>
              <span> tick </span> <h3>97% satisfaction rate</h3>
            </div>

            <button>Browse mentors</button>
          </div>
        </div>

        <div>
          <div>
            <h1>7,000+</h1>
            <h3>Available mentors</h3>
          </div>
          <div>
            <h1>39,600+</h1>
            <h3>Matches made</h3>
          </div>
          <div>
            <h1>130+</h1>
            <h3>Countries represented</h3>
          </div>
        </div>

        {/* Reviews */}
        <div>
          <p>Stars</p>
          <p>
            "Having access to the knowledge and experience of mentors on Mentora
            was an opportunity I couldn't miss. Thnaks to my mentor, I manged to
            reach my goal of joining Tesla."{" "}
          </p>
          <div>
            <div>image</div>
            <div>
              <h3>Michele Verrielo</h3>
              <p>Software Engineer at Tesla</p>
            </div>
          </div>
        </div>

        {/* app detail */}
        <div>
          <div>
            <h2>Long-term mentorship isn't just better - it;s faster</h2>
          </div>
          <div>
            <p>image</p>
            <p>
              Expolre a curated network of vetted mentors - engineers,
              designers, founders, and more. Find someone who matches your
              goals, skills, and budget.
            </p>
          </div>
          <div>
            <p>image</p>
            <p>
              Choose a flexible plan that fits your pace – whether it's Q&A
              chats, regular calls, or something in between, your mentor will
              help you build a personalized roadmap.
            </p>
          </div>
          <div>
            <p>image</p>
            <p>
              Get ongoing support through regular calls, check-ins, and
              feedback. Your mentor stays with you for the long haul.
            </p>
          </div>
          <div>
            <p>image</p>
            <p>
              GMentees who stick with their mentor for 3+ months reach their
              goals 2x faster than they would on their own. Fewer dead ends,
              more breakthroughs.
            </p>
          </div>
        </div>
        {/* explore section */}
        <div>
          <h2>Explore 7,000+ available mentors</h2>
          <form>
            <input
              type="text"
              placeholder="Search by company, skills or role"
            />
            <button>Find Mentors</button>
          </form>
        </div>

        {/* mentors */}
        <div>All Mentors</div>

        {/* reviews */}
        <div>
          <p>Stars</p>
          <h3>
            "After years of self-studying with books and courses, I finally
            joined MentorCruise. After a few sessions, my feelings changed
            completely. I can clearly see my progress – 100% value for money."
          </h3>
          <div>
            <div>image</div>
            <div>
              <h2>Mauro Bandra</h2>
              <p>Data Scientist at Printify</p>
            </div>
          </div>
        </div>

        <div>
          <h2>
            An arsenal of industry veterans and mentoring packages at a flexible
            proce
          </h2>
          <p>
            Pick from a curated collection of mentors and services. Try them out
            with no obligation. Found your mentoring sessions useful? Move to a
            low-cost, monthly mentoring subscription. No lock-ins, no hidden
            fees – Just accelerated professional growth.
          </p>
          <div>
            <AllMentors />
          </div>
        </div>

        {/* footer */}
        <Footer />
      </div>
    </div>
  );
}
