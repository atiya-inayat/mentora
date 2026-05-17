// import Link from "next/link";

// const Footer = () => {
//   return (
//     <div className="flex justify-center w-full bg-primary">
//       <div className="flex flex-col justify-center p-3 pt-4 border bg-primary/90">
//         <h2 className="mt-3 text-xl font-bold font-fugaz">Mentora</h2>
//         <p className="">
//           Your trusted source to find highly-vetted <br />
//           mentors & industry professionals to move your career ahead.
//         </p>
//         <h3>Contact</h3>
//         <span>facebook</span>
//         <span>Instagram</span>
//         <span>X</span>
//         <span>LInkedIn</span>
//         <span>Youtube</span>
//       </div>

//       {/* platform */}
//       <div>
//         <h3>Platform</h3>
//         <p>Browser Mentors</p>
//         <p>Book a Session</p>
//         <p>Become a Mentor</p>
//         <p>Mentorship for Teams</p>
//         <p>Testimonials</p>
//       </div>

//       {/* Company */}
//       <div>
//         <h3>Company</h3>
//         <p>Case Studies</p>
//         <p>Partner Program</p>
//         <p>Code of Conduct</p>
//         <p>Privacy Policy</p>
//         <p>DMCA</p>
//       </div>

//       {/* Explore */}
//       <div>
//         <p>Fractional Executives</p>
//         <p>Services & Training</p>
//         <p>Part-Time Experts</p>
//       </div>
//       {/* support */}
//       <div>
//         <p>FAQ</p>
//         <p>Contact</p>
//       </div>
//     </div>
//   );
// };

// export default Footer;

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full text-white border-t bg-primary border-white/10">
      <div className="grid grid-cols-1 gap-12 px-6 py-16 mx-auto max-w-7xl md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold tracking-tight font-fugaz">
            Mentora
          </h2>

          <p className="max-w-md mt-5 leading-7 text-white/70">
            Your trusted source to find highly-vetted mentors & industry
            professionals to move your career ahead.
          </p>

          <div className="flex gap-4 mt-8 text-sm text-white/80">
            <Link
              href="/"
              className="transition hover:text-white hover:underline"
            >
              <FaFacebookF size={18} />
            </Link>

            <Link
              href="/"
              className="transition hover:text-white hover:underline"
            >
              <FaInstagram size={18} />
            </Link>

            <Link
              href="/"
              className="transition hover:text-white hover:underline"
            >
              <FaXTwitter size={18} />
            </Link>

            <Link
              href="/"
              className="transition hover:text-white hover:underline"
            >
              <FaLinkedinIn size={18} />
            </Link>

            <Link
              href="/"
              className="transition hover:text-white hover:underline"
            >
              <FaYoutube size={18} />
            </Link>
          </div>
        </div>

        {/* Platform */}
        <div>
          <h3 className="mb-5 text-lg font-semibold">Platform</h3>

          <div className="flex flex-col gap-3 text-sm text-white/70">
            <Link href="/" className="transition hover:text-white">
              Browse Mentors
            </Link>

            <Link href="/" className="transition hover:text-white">
              Book a Session
            </Link>

            <Link href="/" className="transition hover:text-white">
              Become a Mentor
            </Link>

            <Link href="/" className="transition hover:text-white">
              Mentorship for Teams
            </Link>

            <Link href="/" className="transition hover:text-white">
              Testimonials
            </Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="mb-5 text-lg font-semibold">Company</h3>

          <div className="flex flex-col gap-3 text-sm text-white/70">
            <Link href="/" className="transition hover:text-white">
              Case Studies
            </Link>

            <Link href="/" className="transition hover:text-white">
              Partner Program
            </Link>

            <Link href="/" className="transition hover:text-white">
              Code of Conduct
            </Link>

            <Link href="/" className="transition hover:text-white">
              Privacy Policy
            </Link>

            <Link href="/" className="transition hover:text-white">
              DMCA
            </Link>
          </div>
        </div>

        {/* Explore + Support */}
        <div>
          <h3 className="mb-5 text-lg font-semibold">Explore</h3>

          <div className="flex flex-col gap-3 text-sm text-white/70">
            <Link href="/" className="transition hover:text-white">
              Fractional Executives
            </Link>

            <Link href="/" className="transition hover:text-white">
              Services & Training
            </Link>

            <Link href="/" className="transition hover:text-white">
              Part-Time Experts
            </Link>
          </div>

          <h3 className="mt-10 mb-5 text-lg font-semibold">Support</h3>

          <div className="flex flex-col gap-3 text-sm text-white/70">
            <Link href="/" className="transition hover:text-white">
              FAQ
            </Link>

            <Link href="/" className="transition hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 mx-auto text-sm max-w-7xl md:flex-row text-white/60">
          <p>© 2026 Mentora. All rights reserved.</p>

          <div className="flex gap-5">
            <Link href="/" className="transition hover:text-white">
              Terms
            </Link>

            <Link href="/" className="transition hover:text-white">
              Privacy
            </Link>

            <Link href="/" className="transition hover:text-white">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
