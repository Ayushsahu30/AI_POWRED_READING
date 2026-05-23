import { useState, useEffect, useRef } from "react";

function LandingPage({ onGetStarted }) {
  const [isVisible, setIsVisible] = useState({});
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const animClass = (id) =>
    `fade-up ${isVisible[id] ? "fade-up--visible" : ""}`;

  return (
    <div className="landing">
      {/* ───── Navbar ───── */}
      <nav className="landing-nav">
        <div className="landing-nav__inner">
          <a href="#" className="landing-nav__logo">
            <span className="landing-nav__logo-icon">📖</span>
            ReadFlow
          </a>
          <div className="landing-nav__links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <button className="btn-primary btn-sm" onClick={onGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ───── Hero ───── */}
      <section className="landing-hero">
        <div className="landing-hero__bg-orbs">
          <div className="orb orb--1" />
          <div className="orb orb--2" />
          <div className="orb orb--3" />
        </div>

        <div className="landing-hero__content">
          <div className="landing-hero__badge">
            ✨ AI-Powered Reading Companion
          </div>
          <h1 className="landing-hero__title">
            Read Smarter,
            <br />
            <span className="gradient-text">Understand Deeper</span>
          </h1>
          <p className="landing-hero__subtitle">
            ReadFlow breaks down complex texts into guided paragraphs, checks
            your understanding, and provides AI-powered explanations — so you
            truly learn what you read.
          </p>
          <div className="landing-hero__actions">
            <button className="btn-primary btn-lg" onClick={onGetStarted}>
              Start Reading Free →
            </button>
            <a href="#how-it-works" className="btn-ghost btn-lg">
              See How It Works
            </a>
          </div>
          <div className="landing-hero__stats">
            <div className="hero-stat">
              <span className="hero-stat__number">📄</span>
              <span className="hero-stat__label">PDF & TXT Support</span>
            </div>
            <div className="hero-stat__divider" />
            <div className="hero-stat">
              <span className="hero-stat__number">🧠</span>
              <span className="hero-stat__label">AI Explanations</span>
            </div>
            <div className="hero-stat__divider" />
            <div className="hero-stat">
              <span className="hero-stat__number">📚</span>
              <span className="hero-stat__label">Guided Learning</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="landing-section" id="features">
        <div className="landing-section__inner">
          <div
            id="feat-header"
            data-animate
            className={animClass("feat-header")}
          >
            <span className="section-badge">Features</span>
            <h2 className="section-title">
              Everything You Need to{" "}
              <span className="gradient-text">Master Reading</span>
            </h2>
            <p className="section-subtitle">
              Powerful tools designed to transform how you read and comprehend
              any text.
            </p>
          </div>

          <div className="feature-grid">
            {[
              {
                icon: "📖",
                title: "Guided Reading",
                desc: "Text is broken into paragraphs and presented one at a time, keeping you focused and preventing overwhelm.",
                color: "#3b82f6",
              },
              {
                icon: "🔍",
                title: "Word Definitions",
                desc: "Long-press any word to instantly see its meaning, pronunciation, and usage — right in the reading view.",
                color: "#8b5cf6",
              },
              {
                icon: "💡",
                title: "AI Clarifications",
                desc: "Don't understand a paragraph? Get simple or detailed AI explanations at two different levels.",
                color: "#f59e0b",
              },
              {
                icon: "✍️",
                title: "Teach-Back",
                desc: "Explain what you read in your own words. Our AI evaluates your understanding and gives feedback.",
                color: "#10b981",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "See exactly where you are, how much is left, and track your reading journey paragraph by paragraph.",
                color: "#ec4899",
              },
              {
                icon: "🔄",
                title: "Last Chance Mode",
                desc: "Struggling? Get 10 progressively simplified versions of the text to find the explanation that clicks.",
                color: "#06b6d4",
              },
            ].map((feat, i) => (
              <div
                key={i}
                id={`feat-${i}`}
                data-animate
                className={`feature-card ${animClass(`feat-${i}`)}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div
                  className="feature-card__icon"
                  style={{ background: `${feat.color}15` }}
                >
                  {feat.icon}
                </div>
                <h3 className="feature-card__title">{feat.title}</h3>
                <p className="feature-card__desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section
        className="landing-section landing-section--alt"
        id="how-it-works"
      >
        <div className="landing-section__inner">
          <div
            id="how-header"
            data-animate
            className={animClass("how-header")}
          >
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">
              Three Simple Steps to{" "}
              <span className="gradient-text">Better Comprehension</span>
            </h2>
          </div>

          <div className="steps-grid">
            {[
              {
                step: "01",
                title: "Upload Your Text",
                desc: "Drop a PDF or TXT file and ReadFlow will automatically parse and split it into readable paragraphs.",
                icon: "📤",
              },
              {
                step: "02",
                title: "Read & Interact",
                desc: "Read each paragraph at your own pace. Long-press words for definitions. Request AI explanations if needed.",
                icon: "👁️",
              },
              {
                step: "03",
                title: "Prove Understanding",
                desc: "Explain what you learned in your own words. The AI checks your understanding and guides you forward.",
                icon: "🎯",
              },
            ].map((item, i) => (
              <div
                key={i}
                id={`step-${i}`}
                data-animate
                className={`step-card ${animClass(`step-${i}`)}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="step-card__number">{item.step}</div>
                <div className="step-card__icon">{item.icon}</div>
                <h3 className="step-card__title">{item.title}</h3>
                <p className="step-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="landing-cta">
        <div className="landing-cta__inner">
          <div className="landing-cta__bg-glow" />
          <div
            id="cta-content"
            data-animate
            className={`landing-cta__content ${animClass("cta-content")}`}
          >
            <h2 className="landing-cta__title">
              Ready to Transform Your Reading?
            </h2>
            <p className="landing-cta__subtitle">
              Upload any document and start your guided reading journey. No
              sign-up required — just paste, read, and learn.
            </p>
            <button className="btn-cta" onClick={onGetStarted}>
              🚀 Start Reading Now
            </button>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <div className="landing-footer__brand">
            <span className="landing-nav__logo">
              <span className="landing-nav__logo-icon">📖</span>
              ReadFlow
            </span>
            <p>AI-powered reading comprehension tool.</p>
          </div>
          <div className="landing-footer__right">
            <p>
              Built with ❤️ for better learning.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
