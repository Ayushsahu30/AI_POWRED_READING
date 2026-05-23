function OrientationScreen({
  onContinue,
  showSimplified,
  onToggleSimplified,
}) {
  const instructionText =
    "This app helps you read a document step by step. You will read one paragraph at a time and explain it before moving forward.";

  const originalText = `[Identity]

Michel Foucault
Discipline and Punish
First published: 1975
Original language: French
Category: Philosophy / Social Theory / History


[Form]

This is a non-fiction work combining historical analysis with philosophical inquiry


[Domains & Scope]

The book examines practices of punishment, discipline, and institutional control.
It moves through legal systems, prisons, schools, and other disciplinary institutions, drawing
on historical records and social analysis.


[Structure & Movement]

The chapters are organised to trace changes in methods of punishment over time, moving
from public spectacle to institutionalised forms of discipline.
Rather than presenting a single linear narrative, the book develops its analysis across a
series of connected historical cases and institutional settings.


[Reader Posture]

The reader is asked to follow shifts in practices and forms, paying attention to how
institutions operate and change across different periods.
`;

  const clarifiedText = `[Identity — Clarified]

Michel Foucault
Discipline and Punish
First published in 1975
Originally written in French
Category: philosophy, social theory, and history


[Form — Clarified]

This is a non-fiction book that combines historical research with philosophical analysis.


[Domains & Scope — Clarified]

The book looks at punishment, discipline, and institutional control.
It discusses legal systems, prisons, schools, and other institutions, using historical sources
and social analysis.


[Structure & Movement — Clarified]

The chapters follow changes in punishment over time, starting with public forms of
punishment and moving toward institutional forms of discipline.
Instead of telling one continuous story, the book develops its analysis through a set of
related historical examples and institutional cases.


[Reader Posture — Clarified]

The reader is asked to track how practices and institutions change across different periods.
`;

  const activeText = showSimplified ? clarifiedText : originalText;

  return (
    <div className="orientation-container">
      <h2>How this works</h2>

      <p className="orientation-instruction">
        {instructionText}
      </p>

      {/* SINGLE BOX */}
      <div className="orientation-preview-box">
        <div className="orientation-scroll-content">
          {activeText.split("\n").map((line, index) => (
            <div
              key={index}
              className={line.startsWith("[") ? "section-title" : ""}
            >
              {line}
            </div>
          ))}
        </div>
      </div>

      <div className="button-row">
        <button className="primary-btn" onClick={onContinue}>
          Continue to reading
        </button>

        <button
          className="secondary-btn"
          onClick={onToggleSimplified}
        >
          {showSimplified
            ? "Revert clarification"
            : "Make this clearer"}
        </button>
      </div>
    </div>
  );
}

export default OrientationScreen;
