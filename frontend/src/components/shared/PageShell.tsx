import { Button } from "./Button";
import { PageContainer } from "./PageContainer";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
export function PageShell({
  title,
  eyebrow,
  description,
  status = "Frontend foundation / Page in development",
}: {
  title: string;
  eyebrow: string;
  description: string;
  status?: string;
}) {
  useDocumentTitle(title);
  return (
    <section className="page-shell route-enter">
      <PageContainer>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-shell__description">{description}</p>
        <p className="page-shell__status eyebrow">{status}</p>
        <div className="page-shell__actions">
          <Button to="/" variant="light">
            Back to the perspective
          </Button>
          <Button to="/technology" variant="outline">
            Our technology vision
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
