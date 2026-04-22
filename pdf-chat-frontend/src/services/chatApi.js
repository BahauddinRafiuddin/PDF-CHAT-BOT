import API from "./api";

// Ask question
export const askQuestion = async ({ question, docId }) => {
  try {
    const res = await API.post("/chat", { question, docId });

    return {
      answer: res.data.answer,
      sources: res.data.sources || [],
    };
  } catch (error) {
    throw new Error("Failed to get answer");
  }
};