export function ProductState({ kind, onRetry }: { kind: "loading" | "error" | "empty"; onRetry?: () => void }) {
  return <div className="collection-state" role={kind === "error" ? "alert" : "status"}>
    <p>{kind === "loading" ? "Loading collection…" : kind === "error" ? "We couldn’t load the collection right now." : "No styles are available in this collection yet."}</p>
    {kind === "error" && onRetry && <button className="button button--light" type="button" onClick={onRetry}>Try again</button>}
  </div>;
}
