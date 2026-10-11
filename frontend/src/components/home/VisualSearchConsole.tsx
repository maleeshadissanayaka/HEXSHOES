import { useEffect, useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PresentationImage } from "../shared/PresentationImage";
import type { FootwearStyle } from "../../types/product";
import { Icon } from "../shared/Icon";
import { searchByImage, searchByText, type VisualSearchResult } from "../../services/api/visualSearch.api";
import { formatSimilarity, resultState, validateVisualSearchFile, visualSearchErrorMessage, type VisualSearchState } from "./visualSearchState";
import { formatPrice } from "../../utils/formatPrice";

const samples: { asset: FootwearStyle; name: string; path: string }[] = [
  { asset: "runner", name: "Movement", path: "/media/presentation/runner-960.webp" },
  { asset: "trail", name: "Terrain", path: "/media/presentation/trail-960.webp" },
  { asset: "mono", name: "Everyday", path: "/media/presentation/mono-960.webp" },
];
const stages = [
  { title: "Image", detail: "Choose an inspiration image or use a catalog sample as the query." },
  { title: "CLIP embedding", detail: "OpenCLIP encodes the query into a normalized embedding using PyTorch." },
  { title: "Cosine similarity", detail: "The service compares the query with normalized catalog-image embeddings." },
  { title: "Ranked styles", detail: "Canonical catalog styles return in descending cosine similarity order." },
];
export function VisualSearchConsole({ compactPipeline = false }: { compactPipeline?: boolean }) {
  const [sample, setSample] = useState<FootwearStyle>("runner");
  const [stage, setStage] = useState(0);
  const [upload, setUpload] = useState<{ file: File; url: string } | null>(null);
  const [state, setState] = useState<VisualSearchState>("idle");
  const [message, setMessage] = useState("Choose an image, then start a real catalog search.");
  const [results, setResults] = useState<VisualSearchResult[]>([]);
  const [text, setText] = useState("");
  const id = useId();
  useEffect(() => { if (upload) return () => URL.revokeObjectURL(upload.url); }, [upload]);

  function resetUpload() { setUpload(null); setResults([]); setState("idle"); setMessage("Choose an image, then start a real catalog search."); }
  function selectUpload(file: File | undefined) {
    if (!file) return;
    const validation = validateVisualSearchFile(file);
    if (validation) { setMessage(validation); setState("error"); return; }
    setUpload({ file, url: URL.createObjectURL(file) }); setResults([]); setState("selected"); setMessage("Preview ready. The image has not been uploaded yet.");
  }
  async function sampleFile() {
    const selected = samples.find((item) => item.asset === sample)!;
    const response = await fetch(selected.path);
    if (!response.ok) throw new Error("Sample image unavailable");
    return new File([await response.blob()], `${sample}.webp`, { type: "image/webp" });
  }
  async function runImageSearch() {
    setState("searching"); setMessage("Searching the catalog with OpenCLIP…"); setResults([]);
    try { const response = await searchByImage(upload?.file ?? await sampleFile()); setResults(response.results); setState(resultState(response.results.length)); setMessage(response.results.length ? "Real catalog matches ranked by cosine similarity." : "No catalog matches were returned."); }
    catch (error) { setState("error"); setMessage(visualSearchErrorMessage(error)); }
  }
  async function runTextSearch(event: FormEvent) {
    event.preventDefault(); if (!text.trim()) return;
    setState("searching"); setMessage("Searching catalog images from your description…"); setResults([]);
    try { const response = await searchByText(text.trim()); setResults(response.results); setState(resultState(response.results.length)); setMessage(response.results.length ? "Real catalog matches ranked by cosine similarity." : "No catalog matches were returned."); }
    catch (error) { setState("error"); setMessage(visualSearchErrorMessage(error)); }
  }
  return <div className="discovery-console">
    <div className="discovery-console__top"><span className="eyebrow">HEX / Visual discovery</span><span className="module-status eyebrow">OpenCLIP live</span></div>
    <div className="discovery-console__query"><div className="discovery-console__image">{upload ? <img src={upload.url} alt={`Local preview: ${upload.file.name}`} /> : <PresentationImage key={sample} asset={sample} alt="Selected footwear inspiration sample" sizes="(max-width: 600px) 40vw, 240px" />}<span className="eyebrow">{upload ? "Local preview" : "Image / Inspiration"}</span></div>
      <div className="discovery-console__drop"><span className="discovery-console__plus" aria-hidden="true"><Icon name="upload" size={22} /></span><h3>Start with<br />what moves you.</h3><p>Choose a sample or your own image.</p>
        <div className="sample-options" aria-label="Inspiration samples">{samples.map((item) => <button type="button" key={item.asset} aria-pressed={!upload && sample === item.asset} onClick={() => { setSample(item.asset); resetUpload(); }}>{item.name}</button>)}<label className="discovery-console__upload"><Icon name="upload" size={15} /><span>{upload ? "Replace image" : "Choose an image"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectUpload(event.currentTarget.files?.[0])} /></label></div>
        <div className="discovery-console__actions"><button className="button button--primary" type="button" disabled={state === "searching"} onClick={() => void runImageSearch()}>{state === "searching" ? "Searching…" : "Search this image"}</button>{upload && <button type="button" className="text-link" onClick={resetUpload}>Remove</button>}</div>
        <p className="quiet-note" role={state === "error" ? "alert" : "status"}>{message}</p></div></div>
    {!compactPipeline && <form className="discovery-console__text-search" onSubmit={(event) => void runTextSearch(event)}><label htmlFor={`${id}-text`} className="eyebrow">Describe what you’re looking for</label><div><input id={`${id}-text`} value={text} maxLength={1000} onChange={(event) => setText(event.target.value)} placeholder="black running shoe" /><button type="submit" disabled={!text.trim() || state === "searching"}>Search</button></div></form>}
    <div className="discovery-console__stages" aria-label="Explore the live search pipeline">{stages.map((item, index) => <button type="button" key={item.title} aria-pressed={stage === index} aria-controls={id} onClick={() => setStage(index)}><span>0{index + 1}</span>{item.title}</button>)}</div>
    <p id={id} className="discovery-console__explanation" role="status">{stages[stage]?.detail}</p>
    <div className="discovery-console__results-heading"><span className="eyebrow">{state === "success" ? "Ranked catalog matches" : "Catalog results"}</span><span className="quiet-note">Cosine similarity</span></div>
    {state === "empty" ? <p className="quiet-note discovery-console__empty">No matches returned.</p> : <ol className="discovery-console__results">{results.map((result) => <li key={result.product.id}><Link to={`/product/${result.product.id}`}><PresentationImage asset={result.product.style} alt={result.product.name} sizes="(max-width: 600px) 25vw, 160px" /><div><span className="eyebrow">#{result.rank}</span><span>{result.product.name}</span><span>{formatPrice(result.product.price, result.product.currency)}</span><strong>{formatSimilarity(result.similarityScore)}</strong></div></Link></li>)}</ol>}
    <div className="discovery-console__tags eyebrow"><span>PyTorch</span><span>OpenCLIP</span><span>Cosine retrieval</span></div>
  </div>;
}
