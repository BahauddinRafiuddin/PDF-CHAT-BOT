const Sidebar = ({
  setFile,
  file,
  handleUpload,
  handleDelete,
  handleNewChat,
  chats,
  setActiveChatId,
  activeChatId,
  activeChat,
}) => {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 p-5 flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold">📄 PDF Chat</h1>
        <p className="text-sm text-gray-400 mt-1">
          Upload & ask questions
        </p>

        <button
          onClick={handleNewChat}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded cursor-pointer"
        >
          + New Chat
        </button>
      </div>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-sm"
      />

      <button
        onClick={handleUpload}
        disabled={!file}
        className="bg-blue-600 px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
      >
        Upload PDF
      </button>

      {activeChat?.fileName && (
        <div className="text-green-400 text-sm truncate">
          📄 {activeChat.fileName}
        </div>
      )}

      <button
        onClick={handleDelete}
        disabled={!activeChat?.docId}
        className="bg-red-600 px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
      >
        Delete PDF
      </button>

      <div className="mt-4 space-y-2 overflow-y-auto max-h-75">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChatId(chat.id)}
            className={`p-2 rounded cursor-pointer ${
              chat.id === activeChatId
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {chat.fileName || "New Chat"}
          </div>
        ))}
      </div>

      <div className="mt-auto text-xs text-gray-500">
        RAG Chatbot
      </div>
    </div>
  );
};

export default Sidebar;