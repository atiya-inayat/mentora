import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="grid grid-cols-1 gap-12 px-6 py-16 mx-auto max-w-7xl md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Mentora</h2>

          <p className="max-w-md mt-4 leading-7 text-muted">
            Your trusted source to find highly-vetted mentors and industry professionals to move your
            career ahead.
          </p>

          <div className="flex gap-4 mt-8">
            {[
              { Icon: FaFacebookF, href: "https://facebook.com" },
              { Icon: FaInstagram, href: "https://instagram.com" },
              { Icon: FaXTwitter, href: "https://x.com" },
              { Icon: FaLinkedinIn, href: "https://linkedin.com" },
              { Icon: FaYoutube, href: "https://youtube.com" },
            ].map(({ Icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-foreground transition-colors"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Platform</h3>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            <Link href="/mentors" className="hover:text-foreground transition-colors">Browse Mentors</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Become a Mentor</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            <Link href="/" className="hover:text-foreground transition-colors">Case Studies</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Partner Program</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Code of Conduct</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Support</h3>
          <div className="flex flex-col gap-2.5 text-sm text-muted">
            <Link href="/" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 mx-auto text-sm max-w-7xl md:flex-row text-muted">
          <p>&copy; {new Date().getFullYear()} Mentora. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
