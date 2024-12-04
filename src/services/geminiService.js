// geminiService.js

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAnswer = async (question_text, student_answer, keywords) => {
    const prompt = `Task Description:
You are an AI designed to evaluate student answers stored in a database. Your task is to:

Extract the question and students answer from specified columns.
Check for the presence of keywords and award marks accordingly.
Provide feedback in JSON format, including marks awarded, deductions, and a summary.
Step-by-Step Instructions:
Extract Data:
Question Text: Fetch the question text from the database column "${question_text}".
Student Answer: Fetch the student's answer from the database column "${student_answer}".
Keywords: Fetch the keywords and their associated marks from the column "${keywords}" in JSON format:
Example: {"keyword1": mark1, "keyword2": mark2, ...}
Evaluation Process:
Keyword Matching:

Check if each keyword from the "${keywords}" column is present in the "${student_answer}".
Perform case-insensitive matching.
Consider synonyms and contextual relevance if necessary.
Award Marks:

For each matching keyword, award the specified marks from the "${keywords}" column.
If the keyword is partially present (e.g., incorrect spelling but recognizable), award partial marks.
Handle Missing Keywords:

If a keyword is missing, deduct the corresponding marks and provide feedback explaining the deduction.
JSON Output Format:
Return the result in the following JSON format:

json
Copy code
{
  "question_text": "${question_text}",     // Question text from the database
  "student_answer": "${student_answer}",   // Student's answer from the database
  "total_marks": <maximum possible marks>, // Total marks available
  "marks_awarded": <total marks awarded>,  // Marks awarded based on matching keywords
  "deductions": [                          // List of deductions with reasons
    {
      "keyword": "<keyword1>",              // Keyword not matched
      "deducted_marks": <marks deducted>,   // Marks deducted for missing keyword
      "reason": "Explanation of why the keyword was necessary and how it was missed."
    },
    {
      "keyword": "<keyword2>",
      "deducted_marks": <marks deducted>,
      "reason": "Explanation of the deduction."
    }
  ],
  "feedback_summary": "Overall feedback to the student, summarizing their performance and suggesting areas of improvement."
}
Example Input (Fetched from Database):
json

{
  "question_text": "${question_text}",  // Example: "Explain the process of photosynthesis."
  "student_answer": "${student_answer}", // Example: "Photosynthesis is the process by which plants make food."
  "keywords": "${keywords}"              // Example: {"sunlight": 2, "chlorophyll": 2, "carbon dioxide": 2, "oxygen": 1, "glucose": 3}
}
Example JSON Output:
json

{
  "question_text": "Explain the process of photosynthesis.",
  "student_answer": "Photosynthesis is the process by which plants make food.",
  "total_marks": 10,
  "marks_awarded": 3,
  "deductions": [
    {
      "keyword": "sunlight",
      "deducted_marks": 2,
      "reason": "Keyword 'sunlight' was not mentioned in the answer, which is essential for explaining the energy source."
    },
    {
      "keyword": "chlorophyll",
      "deducted_marks": 2,
      "reason": "Keyword 'chlorophyll' was missing, which is crucial as it helps plants absorb light."
    },
    {
      "keyword": "carbon dioxide",
      "deducted_marks": 2,
      "reason": "The student did not mention 'carbon dioxide,' which is necessary for the photosynthesis process."
    },
    {
      "keyword": "glucose",
      "deducted_marks": 3,
      "reason": "Keyword 'glucose' was missing, which is the main product of photosynthesis."
    }
  ],
  "feedback_summary": "The student provided a basic explanation but missed key concepts like sunlight, chlorophyll, carbon dioxide, and glucose. Focus on including all essential components of the process."
}
Additional Notes:
Placeholders (""):

&{question_text}: Column containing the question text.
&{student_answer}: Column containing the student's answer.
&{keywords}: Column containing keywords and their corresponding marks in JSON format.
Partial Matching:
Award partial marks if a keyword is implied or partially correct.

Feedback Summary:
Provide constructive feedback to help the student improve their answer.

`

    const result = await model.generateContent(prompt);
    return result.response;
}