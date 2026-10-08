import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { SkipLink } from "./components/layout/SkipLink";
import { PageShell } from "./components/shared/PageShell";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage, ProductPage } from "./pages/ShellPages";
import { ExperienceProvider } from "./components/layout/ExperienceProvider";
import {
  ShopPage,
  VisualSearchPage,
  AboutPage,
  TechnologyPage,
  ContactPage,
  EmptyCollectionPage,
} from "./pages/ExperiencePages";
import "./styles/premium.css";
import { shellPages } from "./data/routeShells";

function RouteEffects() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const frame = requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [pathname, search]);
  return null;
}
export default function App() {
  return (
    <ExperienceProvider>
      <SkipLink />
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/visual-search" element={<VisualSearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/technology" element={<TechnologyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<EmptyCollectionPage kind="cart" />} />
          <Route
            path="/wishlist"
            element={<EmptyCollectionPage kind="wishlist" />}
          />
          {shellPages
            .filter(
              (page) =>
                ![
                  "/visual-search",
                  "/about",
                  "/technology",
                  "/contact",
                  "/cart",
                  "/wishlist",
                ].includes(page.path),
            )
            .map((page) => (
              <Route
                key={page.path}
                path={page.path}
                element={<PageShell {...page} />}
              />
            ))}
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <RouteEffects />
    </ExperienceProvider>
  );
}
