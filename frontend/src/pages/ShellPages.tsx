import { PageShell } from "../components/shared/PageShell";

export function NotFoundPage() {
  return (
    <PageShell
      eyebrow="404 / A different direction"
      title="This path ends here."
      description="The page you’re looking for isn’t here. Return to the homepage to find a new direction."
      status="Page not found"
    />
  );
}
