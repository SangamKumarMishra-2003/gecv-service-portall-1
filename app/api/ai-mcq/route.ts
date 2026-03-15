import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { topic, numQuestions = 5, difficulty = "medium" } = await req.json();
  const prompt = `Generate ${numQuestions} multiple choice questions (MCQs) on the topic \"${topic}\" with 4 options each and mark the correct answer. Difficulty: ${difficulty}. Return as JSON array with fields: question, options (array), answer (string).`;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an expert MCQ generator for college-level exams." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });
  try {
    const text = completion.choices[0].message.content || "";
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);
    return NextResponse.json(JSON.parse(jsonString));
  } catch (e) {
    return NextResponse.json({ error: "Failed to parse MCQ JSON" }, { status: 500 });
  }
}