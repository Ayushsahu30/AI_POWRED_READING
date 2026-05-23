const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function fetchClarification(paragraph, level) {
  const response = await fetch(`${API_BASE_URL}/api/clarify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paragraph, level })
  });

  if (!response.ok) {
    throw new Error("Failed to fetch clarification");
  }

  return response.json(); // { clarification }
}

export async function evaluateTeachback(paragraph, teachback, minWords = 20) {
  const response = await fetch(`${API_BASE_URL}/api/evaluate-teachback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paragraph, teachback, minWords })
  });

  if (!response.ok) {
    throw new Error("Failed to evaluate teach-back");
  }

  return response.json(); // { status, reason, modelDecision }
}

export async function generateTrace(paragraph, selectedText) {
  const response = await fetch(`${API_BASE_URL}/api/trace`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paragraph, selectedText })
  });

  if (!response.ok) {
    throw new Error("Failed to generate trace");
  }

  return response.json();
}


export async function generateLastChance(paragraph) {
  const response = await fetch(`${API_BASE_URL}/api/last-chance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paragraph })
  });

  if (!response.ok) {
    throw new Error("Failed to generate last chance");
  }

  return response.json(); // { variants }
}
