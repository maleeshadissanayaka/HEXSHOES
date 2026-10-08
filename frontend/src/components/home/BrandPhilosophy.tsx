import { PageContainer } from "../shared/PageContainer";
import { Reveal } from "../shared/Reveal";
import { PresentationImage } from "../shared/PresentationImage";

const principles = [
  {
    letter: "H",
    title: "HOVER",
    subtitle: "Lighter movement.",
    description:
      "An ambition to make every step feel considered. Less distraction. More freedom.",
    number: "01",
  },
  {
    letter: "E",
    title: "ELEGANCE",
    subtitle: "Timeless form.",
    description:
      "A restrained design language. Built around the essentials, with nothing there by accident.",
    number: "02",
  },
  {
    letter: "X",
    title: "XPERIENCE",
    subtitle: "Discovery, reimagined.",
    description:
      "A vision for a smarter connection between what moves you and what you wear.",
    number: "03",
  },
] as const;

export function BrandPhilosophy() {
  return (
    <section id="philosophy" className="philosophy section paper">
      <PageContainer>
        <Reveal>
          <div className="philosophy__intro">
            <p className="eyebrow">The HEX perspective</p>
            <h2>
              Three letters.
              <br />
              One forward direction.
            </h2>
            <p>
              More than a name. A way of thinking about movement, form, and the
              experience in between.
            </p>
          </div>
        </Reveal>
        <div className="philosophy__grid">
          {principles.map((item, i) => (
            <Reveal key={item.letter} stagger={i as 0 | 1 | 2}>
              <article className="principle">
                <div className="principle__top">
                  <span className="eyebrow">
                    {item.number} / {item.title}
                  </span>
                  <span className="principle__mark" aria-hidden="true">
                    +
                  </span>
                </div>
                <div className="principle__crop">
                  <PresentationImage
                    asset={i === 0 ? "story" : i === 1 ? "mono" : "texture"}
                    alt=""
                    sizes="(max-width: 600px) 90vw, 30vw"
                  />
                  <div className="principle__letter" aria-hidden="true">
                    {item.letter}
                  </div>
                </div>
                <h3>{item.subtitle}</h3>
                <p>{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
