const ChatHeader = ({ fileName }) => {
  return (
    <div className="p-4 border-b border-gray-800 bg-gray-900">
      <h2 className="font-semibold text-lg">Chat</h2>

      {fileName ? (
        <p className="text-sm text-green-400 mt-1 truncate">
          📄 {fileName}
        </p>
      ) : (
        <p className="text-sm text-gray-500 mt-1">
          No PDF uploaded
        </p>
      )}
    </div>
  );
};

export default ChatHeader