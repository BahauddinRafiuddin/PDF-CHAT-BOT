const ChatMessage = ({ msg }) => {
  const isUser = msg.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl shadow-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-br-none shadow-blue-900/20"
            : "bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-none shadow-black/20"
        }`}
      >
        <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </div>
        <div className={`text-[10px] mt-2 font-medium uppercase tracking-tighter opacity-40 ${isUser ? 'text-right' : 'text-left'}`}>
          {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage