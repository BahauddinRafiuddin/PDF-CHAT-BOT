const ChatInput = ({ text, setText, handleSend, loading }) => {
  return (
    <div className="max-w-4xl mx-auto w-full flex gap-3 bg-gray-900 border border-gray-700 p-2 rounded-2xl shadow-2xl focus-within:border-blue-500 transition-all">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Ask a question about your document..."
        className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-sm md:text-base"
      />

      <button
        onClick={handleSend}
        disabled={loading || !text.trim()}
        className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold px-6 rounded-xl cursor-pointer transition-all flex items-center justify-center active:scale-95"
      >
        {loading ? "..." : "Send"}
      </button>
    </div>
  );
};

export default ChatInput