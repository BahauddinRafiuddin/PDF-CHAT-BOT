import { useState, useRef, useEffect } from "react";
import { uploadPDF, deletePDF } from "../services/pdfApi";
import { askQuestion } from "../services/chatApi";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import toast from "react-hot-toast";

const ChatPage = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const bottomRef = useRef(null);

  //  Auto create first chat
  useEffect(() => {
    if (chats.length === 0) {
      const newChat = {
        id: Date.now().toString(),
        fileName: "",
        docId: null,
        messages: [],
      };
      setChats([newChat]);
      setActiveChatId(newChat.id);
    }
  }, []);

  //  Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  //  Upload
  const handleUpload = async () => {
    if (!file) return toast.error("Select a file");

    try {
      const res = await uploadPDF(file);

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                fileName: res.fileName,
                docId: res.docId,
                messages: [],
              }
            : chat
        )
      );

      toast.success("PDF uploaded ✅");
      setFile(null);
    } catch {
      toast.error("Upload failed ❌");
    }
  };

  //  Send Message
  const handleSend = async () => {
    if (!text.trim() || loading) return;

    if (!activeChat?.docId) {
      return toast.error("Upload PDF first");
    }

    const userMsg = {
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMsg],
            }
          : chat
      )
    );

    setText("");
    setLoading(true);

    try {
      const res = await askQuestion({
        question: text,
        docId: activeChat.docId,
      });

      const botMsg = {
        role: "assistant",
        content: res.answer,
        time: new Date().toLocaleTimeString(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [...chat.messages, botMsg],
              }
            : chat
        )
      );
    } catch {
      toast.error("Error getting response");
    }

    setLoading(false);
  };

  //  Delete PDF
  const handleDelete = async () => {
    if (!activeChat?.docId) return;

    try {
      await deletePDF({
        docId: activeChat.docId,
        fileName: activeChat.fileName,
      });

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                fileName: "",
                docId: null,
                messages: [],
              }
            : chat
        )
      );

      toast.success("Deleted successfully 🗑️");
      setFile(null)
    } catch {
      toast.error("Delete failed ❌");
    }
  };

  //  New Chat
  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      fileName: "",
      docId: null,
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  if (!activeChat) return null;

  return (
    <div className="h-screen flex bg-gray-950 text-white">
      <Sidebar
        setFile={setFile}
        file={file}
        handleUpload={handleUpload}
        handleDelete={handleDelete}
        handleNewChat={handleNewChat}
        chats={chats}
        setActiveChatId={setActiveChatId}
        activeChatId={activeChatId}
        activeChat={activeChat}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader fileName={activeChat.fileName} />

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeChat.messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              Upload a PDF and start chatting 🚀
            </div>
          )}

          {activeChat.messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}

          {loading && (
            <div className="text-gray-400 text-sm">🤖 Thinking...</div>
          )}

          <div ref={bottomRef} />
        </div>

        <ChatInput
          text={text}
          setText={setText}
          handleSend={handleSend}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ChatPage;