import API from "./api";

// Create chat
export const createChat = async () => {
  const res = await API.post("/chats");
  return res.data;
};

// Get all chats
export const getChats = async () => {
  const res = await API.get("/chats");
  return res.data;
};

// Get single chat
export const getChat = async (chatId) => {
  const res = await API.get(`/chats/${chatId}`);
  return res.data;
};

// Send message (NEW)
export const sendMessage = async (chatId, question) => {
  const res = await API.post(`/chats/${chatId}/message`, {
    question,
  });
  return res.data;
};

// Upload PDF to chat (NEW)
export const uploadPDF = async (chatId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post(`/chats/${chatId}/upload`, formData);
  return res.data;
};

// Delete chat
export const deleteChat = async (chatId) => {
  const res = await API.delete(`/chats/${chatId}`);
  return res.data;
};