/* oxlint-disable react/set-state-in-effect -- request lifecycle intentionally resets UI state when identity or product changes */
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { getPersonalizedRecommendations, getSimilarProducts, type RecommendationResponse } from "../services/api/recommendations.api";

const empty: RecommendationResponse = { personalized: false, strategy: "", results: [] };
export function useSimilarRecommendations(productId: string | undefined) {
  const [state, setState] = useState({ data: empty, loading: Boolean(productId), error: false });
  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    setState({ data: empty, loading: true, error: false });
    getSimilarProducts(productId, controller.signal).then((data) => setState({ data, loading: false, error: false })).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setState({ data: empty, loading: false, error: true });
    });
    return () => controller.abort();
  }, [productId]);
  return state;
}
export function usePersonalizedRecommendations(user: User | null) {
  const [state, setState] = useState({ data: empty, loading: Boolean(user), error: false });
  useEffect(() => {
    if (!user) { setState({ data: empty, loading: false, error: false }); return; }
    const controller = new AbortController();
    setState({ data: empty, loading: true, error: false });
    getPersonalizedRecommendations(user, controller.signal).then((data) => setState({ data, loading: false, error: false })).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setState({ data: empty, loading: false, error: true });
    });
    return () => controller.abort();
  }, [user]);
  return state;
}
