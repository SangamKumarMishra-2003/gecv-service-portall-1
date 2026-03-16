// This file is now a stub. MCQ generation is handled by the /api/ai-mcq API route.
export async function generateMCQs({ topic, numQuestions = 5, difficulty = 'medium' }: { topic: string; numQuestions?: number; difficulty?: string }) {
  const res = await fetch("/api/ai-mcq", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, numQuestions, difficulty }),
  });
  if (!res.ok) throw new Error("Failed to generate MCQs");
  return res.json();
}
