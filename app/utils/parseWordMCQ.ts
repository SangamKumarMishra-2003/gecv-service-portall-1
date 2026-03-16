import mammoth from "mammoth";

export async function parseWordFile(file: File): Promise<string> {
  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  // Use mammoth to extract text
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value;
}

// Example MCQ extraction (very basic, expects Q, options, Answer pattern)
export function extractMCQsFromText(text: string) {
  const questions = [];
  const blocks = text.split(/\n(?=Q\d+\.|Q\.|Q:)/i);
  for (const block of blocks) {
    const lines = block.trim().split(/\n/).filter(Boolean);
    if (lines.length < 3) continue;
    const question = lines[0].replace(/^Q\d*\.?\s*/i, "");
    const options = lines.slice(1, 5).map(l => l.replace(/^\w\.?\s*/, ""));
    const answerLine = lines.find(l => /answer[:\s]/i.test(l));
    const answer = answerLine ? answerLine.replace(/.*answer[:\s]*/i, "") : "";
    if (question && options.length === 4) {
      questions.push({ question, options, answer });
    }
  }
  return questions;
}
