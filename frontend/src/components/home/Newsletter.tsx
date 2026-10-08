import { useState, type FormEvent } from "react";
import { Icon } from "../shared/Icon";
import { PageContainer } from "../shared/PageContainer";
import { Reveal } from "../shared/Reveal";

export function Newsletter() {
  const [message, setMessage] = useState("");
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Preview complete. Your email was not sent or stored. Sign-ups will open in a future phase.",
    );
    event.currentTarget.reset();
  }
  return (
    <section className="newsletter paper">
      <PageContainer>
        <Reveal>
          <div className="newsletter__grid">
            <div>
              <p className="eyebrow">Keep moving forward</p>
              <h2>JOIN THE MOVEMENT.</h2>
              <p>Future collections. New perspectives. Thoughtful discovery.</p>
            </div>
            <div>
              <form onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  autoComplete="email"
                  required
                  aria-describedby="newsletter-note"
                />
                <button type="submit" aria-label="Preview newsletter sign-up">
                  <Icon name="arrow" size={24} />
                </button>
              </form>
              <p id="newsletter-note" className="newsletter__note">
                Preview only. Emails are not sent or stored.
              </p>
              <p className="newsletter__message" role="status">
                {message}
              </p>
            </div>
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
