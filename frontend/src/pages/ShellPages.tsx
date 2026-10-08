import { useParams } from "react-router-dom";
import { PageShell } from "../components/shared/PageShell";
import { presentationProducts } from "../data/presentationProducts";

export function ProductPage() {
  const { id } = useParams();
  const product = presentationProducts.find((item) => item.id === id);
  if (!product) return <NotFoundPage />;
  return (
    <PageShell
      eyebrow={`Design study / ${product.code}`}
      title={product.name}
      description="This is a presentation-only footwear concept with an illustrative price. Product details, photography, sizing, and purchase functionality will be developed once a real catalog is available."
      status="Concept preview / Not available for purchase"
    />
  );
}
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
