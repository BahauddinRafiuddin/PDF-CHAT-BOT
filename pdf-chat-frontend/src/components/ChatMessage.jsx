const ChatMessage = ({ msg }) => {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-3 rounded-xl max-w-[70%] shadow ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-800 border border-gray-700"
        }`}
      >
        <div>{msg.content}</div>
        <div className="text-xs mt-1 opacity-50">
          {msg.time}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;