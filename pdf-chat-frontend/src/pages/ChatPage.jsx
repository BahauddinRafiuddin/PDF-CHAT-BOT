import { useState, useEffect, useRef, useCallback } from "react";
import {
  createChat,
  getChats,
  getChat,
  sendMessage,
  uploadPDF,
  deleteChat,
} from "../services/chatApi";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import toast from "react-hot-toast";
import { Menu, X } from "lucide-react";

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Track the in-flight chat load to avoid stale updates
  const activeChatIdRef = useRef(null);
  const bottomRef = useRef(null);

  // ─── Init: load chats once 
  useEffect(() => {
    const init = async () => {
      try {
        const data = await getChats();
        if (data.length === 0) {
          const newChat = await createChat();
          setChats([newChat]);
          setActiveChatId(newChat._id);
        } else {
          setChats(data);
          setActiveChatId(data[0]._id);
        }
      } catch {
        toast.error("Failed to load chats");
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // ─── Load active chat messages
  useEffect(() => {
    if (!activeChatId) {
      setActiveChat(null);
      return;
    }

    activeChatIdRef.current = activeChatId;

    const load = async () => {
      try {
        const chat = await getChat(activeChatId);
        // Only update if this is still the active chat (avoids race conditions)
        if (activeChatIdRef.current === activeChatId) {
          setActiveChat(chat);
          setIsSidebarOpen(false);
        }
      } catch {
        toast.error("Failed to load chat");
      }
    };

    load();
  }, [activeChatId]);

  // ─── Auto-scroll ─
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages?.length, loading]);

  // ─── Upload ──────
  const handleUpload = useCallback(async (chatId, file) => {
    if (!file) return toast.error("Please select a file");

    const toastId = toast.loading("Uploading & vectorizing PDF…");
    try {
      await uploadPDF(chatId, file);
      const updated = await getChat(chatId);

      setActiveChat((prev) =>
        prev?._id === chatId ? updated : prev
      );
      setChats((prev) =>
        prev.map((c) =>
          c._id === chatId
            ? { ...c, fileName: updated.fileName, hasPdf: true }
            : c
        )
      );
      toast.success("PDF uploaded ✅", { id: toastId });
    } catch {
      toast.error("Upload failed ❌", { id: toastId });
    }
  }, []);

  // ─── Delete ──────
  const handleDelete = useCallback(async (chatId) => {
    // Optimistically remove from UI immediately
    setChats((prev) => {
      const next = prev.filter((c) => c._id !== chatId);

      // If we deleted the active chat, switch to the first remaining
      if (chatId === activeChatIdRef.current) {
        const nextId = next[0]?._id ?? null;
        activeChatIdRef.current = nextId;
        setActiveChatId(nextId);
        setActiveChat(null);
      }

      return next;
    });

    try {
      await deleteChat(chatId);
      toast.success("Session deleted 🗑️");
    } catch {
      // Roll back: reload from server
      toast.error("Delete failed — refreshing…");
      const fresh = await getChats().catch(() => []);
      setChats(fresh);
      if (fresh.length > 0 && !activeChatIdRef.current) {
        setActiveChatId(fresh[0]._id);
      }
    }
  }, []);

  // ─── Send message ──
  const handleSend = useCallback(async () => {
    if (!text.trim() || loading) return;
    if (!activeChatId) return toast.error("No active session");

    const userMessage = text.trim();
    setText("");

    // Optimistic user bubble
    setActiveChat((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...(prev.messages || []),
              { role: "user", content: userMessage, createdAt: new Date() },
            ],
          }
        : prev
    );

    setLoading(true);
    try {
      await sendMessage(activeChatId, userMessage);
      const updated = await getChat(activeChatId);
      if (activeChatIdRef.current === activeChatId) {
        setActiveChat(updated);
      }
    } catch {
      toast.error("Failed to get response");
      // Remove the optimistic message on failure
      setActiveChat((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.slice(0, -1),
            }
          : prev
      );
      setText(userMessage); // Restore text
    } finally {
      setLoading(false);
    }
  }, [text, loading, activeChatId]);

  // ─── New chat ────
  const handleNewChat = useCallback(async () => {
    try {
      const newChat = await createChat();
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat._id);
    } catch {
      toast.error("Failed to create session");
    }
  }, []);

  // ─── Render ─────
  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0B0F1A] text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm font-medium tracking-wide">Loading sessions…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#0B0F1A] text-slate-100 overflow-hidden relative">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-60 w-72 transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 -right-11 p-2 bg-gray-900 text-white rounded-r-lg cursor-pointer"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <Sidebar
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          handleNewChat={handleNewChat}
          chats={chats}
          setActiveChatId={setActiveChatId}
          activeChatId={activeChatId}
        />
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        <div className="sticky top-0 z-40 glass-header border-b border-gray-800/50">
          <ChatHeader fileName={activeChat?.fileName} />
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-12 py-10 space-y-8 custom-scrollbar">
          {/* Empty state */}
          {!activeChat || activeChat.messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center select-none">
              <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/20">
                <span className="text-4xl">🚀</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Insight PDF AI
              </h2>
              <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
                {activeChat?.fileName
                  ? "Ask anything about your document."
                  : "Upload a document in the sidebar to start asking questions and extracting insights."}
              </p>
            </div>
          ) : null}

          {activeChat?.messages?.map((msg, i) => (
            <ChatMessage key={`${activeChatId}-${i}`} msg={msg} />
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-center gap-3 text-blue-400 text-sm font-medium">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="animate-pulse">AI is analyzing document…</span>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        <div className="px-4 pb-8 md:px-12 pt-4 bg-linear-to-t from-[#0B0F1A] via-[#0B0F1A] to-transparent">
          <div className="max-w-4xl mx-auto">
            <ChatInput
              text={text}
              setText={setText}
              handleSend={handleSend}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;