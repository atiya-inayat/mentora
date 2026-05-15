import Link from "next/link";

const Footer = () => {
  return (
    <div>
      <div>
        <h2>Mentora</h2>
        <p>
          Your trusted source to find highly-vetted mentors & industry
          professionals to move your career ahead.
        </p>
        <h3>Contact</h3>
        <span>facebook</span>
        <span>Instagram</span>
        <span>X</span>
        <span>LInkedIn</span>
        <span>Youtube</span>
      </div>

      {/* platform */}
      <div>
        <h3>Platform</h3>
        <p>Browser Mentors</p>
        <p>Book a Session</p>
        <p>Become a Mentor</p>
        <p>Mentorship for Teams</p>
        <p>Testimonials</p>
      </div>

      {/* Company */}
      <div>
        <h3>Company</h3>
        <p>Case Studies</p>
        <p>Partner Program</p>
        <p>Code of Conduct</p>
        <p>Privacy Policy</p>
        <p>DMCA</p>
      </div>

      {/* Explore */}
      <div>
        <p>Fractional Executives</p>
        <p>Services & Training</p>
        <p>Part-Time Experts</p>
      </div>
      {/* support */}
      <div>
        <p>FAQ</p>
        <p>Contact</p>
      </div>
    </div>
  );
};

export default Footer;
