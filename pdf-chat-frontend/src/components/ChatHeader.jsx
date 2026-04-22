const ChatHeader = ({ fileName }) => {
  return (
    <header className="px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="font-bold text-lg tracking-tight">Conversation</h2>
        <div className="flex items-center gap-2 mt-0.5">
          <div className={`w-2 h-2 rounded-full ${fileName ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          {fileName ? (
            <span className="text-xs text-green-400 font-medium truncate max-w-50 md:max-w-md">
              Active: {fileName}
            </span>
          ) : (
            <span className="text-xs text-gray-500 italic">No document attached</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader