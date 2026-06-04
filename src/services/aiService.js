const API_KEY = "AIzaSyAJR-DGZowYeoSWocN0JCNUovzVIYA2DR0";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

export const generateAIResponse = async (userPrompt) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }]
    }),
  });

  const data = await response.json();

  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.length) return "AI не знає, що відповісти.";

  return data.candidates[0].content.parts[0].text;
};