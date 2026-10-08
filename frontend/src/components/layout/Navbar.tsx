import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { primaryNavigation } from "../../data/navigation";
import { useExperience } from "../../hooks/useExperience";
import { IconButton } from "../shared/IconButton";
import { PageContainer } from "../shared/PageContainer";
import { MobileMenu } from "./MobileMenu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open } = useExperience();
  const { pathname } = useLocation();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1200px)");
    const closeOnDesktop = () => {
      if (media.matches) setMenuOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <>
      <header
        className={`navbar ${scrolled || pathname !== "/" ? "navbar--solid" : ""}`}
      >
        <PageContainer className="navbar__inner">
          <Link to="/" className="wordmark" aria-label="HEXSHOES home">
            HEXSHOES<span aria-hidden="true">+</span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            <ul>
              {primaryNavigation.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="navbar__utilities">
            <IconButton
              icon="search"
              label="Search — preview information"
              onClick={() => open({ kind: "search" })}
            />
            <IconButton
              icon="heart"
              label="Wishlist"
              to="/wishlist"
              className="desktop-utility"
            />
            <IconButton icon="bag" label="Cart" to="/cart" />
            <IconButton
              icon="user"
              label="Account"
              to="/account"
              className="desktop-utility"
            />
            <IconButton
              icon="menu"
              label="Open navigation"
              className="mobile-toggle"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            />
          </div>
        </PageContainer>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
