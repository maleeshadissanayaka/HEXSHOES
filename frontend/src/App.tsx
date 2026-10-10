import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnnouncementBar } from "./components/layout/AnnouncementBar";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";
import { SkipLink } from "./components/layout/SkipLink";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/ShellPages";
import { ExperienceProvider } from "./components/layout/ExperienceProvider";
import {
  ShopPage,
  VisualSearchPage,
  AboutPage,
  TechnologyPage,
  ContactPage,
  EmptyCollectionPage,
} from "./pages/ExperiencePages";
import {
  MenPage,
  NewDropsPage,
  WomenPage,
} from "./pages/RetailPages";
import { AccountPage } from "./pages/AccountPage";
import { ProductPage } from "./pages/ProductPage";
import "./styles/premium.css";
import "./styles/retail-pages.css";
import { useExperience } from "./hooks/useExperience";

function RouteEffects() {
  const { pathname, search } = useLocation();
  const { close } = useExperience();
  useEffect(() => {
    close();
    window.scrollTo({ top: 0, behavior: "instant" });
    const frame = requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [pathname, search, close]);
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
          <Route path="/men" element={<MenPage />} />
          <Route path="/women" element={<WomenPage />} />
          <Route path="/new-drops" element={<NewDropsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/cart" element={<EmptyCollectionPage kind="cart" />} />
          <Route
            path="/wishlist"
            element={<EmptyCollectionPage kind="wishlist" />}
          />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <RouteEffects />
    </ExperienceProvider>
  );
}
