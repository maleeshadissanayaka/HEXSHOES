import { useExperience } from "../../hooks/useExperience";
import { Link, useLocation } from "react-router-dom";
import { PageContainer } from "../shared/PageContainer";
import "./layout.css";

const currentYear = new Date().getFullYear();
const groups = [
  {
    name: "Shop",
    links: [
      { label: "All footwear", to: "/shop" },
      { label: "Men", to: "/men" },
      { label: "Women", to: "/women" },
      { label: "New drops", to: "/new-drops" },
    ],
  },
  {
    name: "Technology",
    links: [
      { label: "Visual search", to: "/visual-search" },
      { label: "Our approach", to: "/technology" },
    ],
  },
  {
    name: "Company",
    links: [
      { label: "Our story", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
];
export function Footer() {
  const { open } = useExperience();
  const { pathname } = useLocation();
  const information = (title: string, description: string) =>
    open({ kind: "information", title, description });
  return (
    <footer className={`footer ${pathname === "/" ? "footer--home" : ""}`}>
      <PageContainer>
        <div className="footer__top">
          <div className="footer__brand">
            <Link className="wordmark" to="/">
              HEXSHOES<span aria-hidden="true">+</span>
            </Link>
            <p>
              Movement is the beginning.
              <br />
              Discovery is what comes next.
            </p>
            <span className="eyebrow muted">
              Independent vision. Forward motion.
            </span>
          </div>
          {groups.map((group) => (
            <div className="footer__group" key={group.name}>
              <h2 className="eyebrow">{group.name}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer__group">
            <h2 className="eyebrow">Support</h2>
            <ul>
              <li>
                <button
                  onClick={() =>
                    information(
                      "Shipping & returns",
                      "Shipping, delivery, and return policies will be published when the verified collection opens for purchase. No orders are being accepted yet.",
                    )
                  }
                >
                  Shipping & returns
                </button>
              </li>
              <li>
                <Link to="/contact">Get in touch</Link>
              </li>
            </ul>
          </div>
          <div className="footer__group">
            <h2 className="eyebrow">Follow</h2>
            <ul>
              {["Instagram", "TikTok", "YouTube", "LinkedIn"].map((name) => (
                <li key={name}>
                  <button
                    onClick={() =>
                      information(
                        `HEXSHOES on ${name}`,
                        "Our official social channels will be linked here when they are verified. Explore our story in the meantime.",
                      )
                    }
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer__statement" aria-hidden="true">
          MOVE FORWARD.
        </div>
        <div className="footer__bottom">
          <p>© {currentYear} HEXSHOES</p>
          <p className="eyebrow">React / TypeScript / Intelligent Commerce</p>
          <div>
            <button
              onClick={() =>
                information(
                  "Privacy",
                  "This frontend does not submit contact forms, newsletter emails, or assistant messages. These interactions stay in memory and clear when the page is reloaded. Fonts are requested from Google Fonts. A full privacy policy will accompany future connected services.",
                )
              }
            >
              Privacy
            </button>
            <button
              onClick={() =>
                information(
                  "Terms",
                  "HEXSHOES currently presents original design studies. Prices and images are illustrative, and no purchases are accepted. Full terms will be published before connected commerce launches.",
                )
              }
            >
              Terms
            </button>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
