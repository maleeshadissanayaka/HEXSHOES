import { useCallback, useEffect, useMemo, useState } from "react";
import { getProduct, getProducts, type ProductQuery } from "../services/api/products.api";
import type { Product } from "../types/product";

type LoadState<T> = { data: T; loading: boolean; error: Error | null; retry: () => void };
const collectionCache = new Map<string, Product[]>();
const productCache = new Map<string, Product>();

export function useProducts(query: ProductQuery = {}): LoadState<Product[]> {
  const key = JSON.stringify(query);
  const stableQuery = useMemo(() => JSON.parse(key) as ProductQuery, [key]);
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<Omit<LoadState<Product[]>, "retry">>({ data: collectionCache.get(key) ?? [], loading: !collectionCache.has(key), error: null });
  const retry = useCallback(() => { collectionCache.delete(key); setVersion((value) => value + 1); }, [key]);
  useEffect(() => {
    const cached = collectionCache.get(key);
    if (cached) return;
    const controller = new AbortController();
    // A changed query must clear stale collection data before the request resolves.
    // oxlint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: [], loading: true, error: null });
    getProducts(stableQuery, controller.signal).then((data) => {
      collectionCache.set(key, data); data.forEach((product) => productCache.set(product.id, product));
      setState({ data, loading: false, error: null });
    }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setState({ data: [], loading: false, error: error instanceof Error ? error : new Error("Request failed") });
    });
    return () => controller.abort();
  }, [key, stableQuery, version]);
  return { ...state, retry };
}

export function useProduct(id: string | undefined): LoadState<Product | null> {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<Omit<LoadState<Product | null>, "retry">>({ data: id ? productCache.get(id) ?? null : null, loading: Boolean(id && !productCache.has(id)), error: null });
  const retry = useCallback(() => { if (id) productCache.delete(id); setVersion((value) => value + 1); }, [id]);
  useEffect(() => {
    if (!id) return;
    const cached = productCache.get(id);
    if (cached) return;
    const controller = new AbortController();
    // A changed route id must not display the previous product while loading.
    // oxlint-disable-next-line react-hooks/set-state-in-effect
    setState({ data: null, loading: true, error: null });
    getProduct(id, controller.signal).then((data) => { productCache.set(id, data); setState({ data, loading: false, error: null }); }).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setState({ data: null, loading: false, error: error instanceof Error ? error : new Error("Request failed") });
    });
    return () => controller.abort();
  }, [id, version]);
  return { ...state, retry };
}
