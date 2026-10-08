import { usePointerDepth } from "../../hooks/usePointerDepth";
import { Link } from "react-router-dom";
import type { FootwearStyle } from "../../types/product";
import { Icon } from "../shared/Icon";
import { PageContainer } from "../shared/PageContainer";
import { Reveal } from "../shared/Reveal";
import { SectionHeader } from "../shared/SectionHeader";
import { PresentationImage } from "../shared/PresentationImage";

const categories: {
  name: string;
  description: string;
  style: FootwearStyle;
  slug: string;
}[] = [
  {
    name: "RUNNING",
    description: "Find your rhythm.",
    style: "runner",
    slug: "run",
  },
  {
    name: "TRAIL",
    description: "Beyond the familiar.",
    style: "trail",
    slug: "trail",
  },
  {
    name: "LIFESTYLE",
    description: "Everyday, considered.",
    style: "mono",
    slug: "lifestyle",
  },
  {
    name: "SLIDES",
    description: "A slower pace.",
    style: "slide",
    slug: "slides",
  },
];
export function Categories() {
  return (
    <section className="categories section">
      <PageContainer>
        <Reveal>
          <SectionHeader
            eyebrow="Different paths. Same perspective."
            title={<>Move your way.</>}
            description="From the everyday to the unknown. Explore the directions shaping our future collection."
          />
        </Reveal>
        <div className="categories__grid">
          {categories.map((category, i) => (
            <Reveal key={category.name} stagger={i as 0 | 1 | 2 | 3}>
              <CategoryTile category={category} index={i} />
            </Reveal>
          ))}
        </div>
        <p className="section-note eyebrow">
          Generated campaign studies / Presentation only
        </p>
      </PageContainer>
    </section>
  );
}

function CategoryTile({
  category,
  index,
}: {
  category: (typeof categories)[number];
  index: number;
}) {
  const { ref, onPointerMove, onPointerLeave } =
    usePointerDepth<HTMLAnchorElement>();
  return (
    <Link
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      to={`/shop?category=${category.slug}`}
      className={`category category--${category.style}`}
    >
      <span className="eyebrow category__number">0{index + 1} / Direction</span>
      <div className="category__art">
        <PresentationImage
          asset={category.style}
          alt={`${category.name} — generated footwear campaign concept`}
          sizes="(max-width: 600px) 90vw, 60vw"
        />
      </div>
      <div className="category__caption">
        <div>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </div>
        <Icon name="diagonal" size={25} />
      </div>
    </Link>
  );
}
