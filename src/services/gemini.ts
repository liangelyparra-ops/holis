export interface GameCard {
  category: string;
  content: string;
  emoji: string;
}

export async function generateCardsFromText(text: string): Promise<GameCard[]> {
  try {
    const res = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Server-side card generation failed.");
    }

    const data = await res.json();
    return data.cards || [];
  } catch (error) {
    console.error("Error generating cards:", error);
    return [];
  }
}
