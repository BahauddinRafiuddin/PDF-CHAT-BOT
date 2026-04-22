const ChatInput = ({ text, setText, handleSend, loading }) => {
  return (
    <div className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask something..."
        className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 transition px-5 rounded cursor-pointer disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;