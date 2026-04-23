import { useState, useCallback } from "react";
import { Trash2, Upload, FilePlus, FileText, CheckCircle } from "lucide-react";

const ConfirmModal = ({ fileName, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-[#131929] border border-gray-700/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
          <Trash2 size={18} className="text-red-400" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">Delete Session?</p>
          <p className="text-[11px] text-gray-500 mt-0.5">This cannot be undone</p>
        </div>
      </div>

      {fileName && (
        <div className="bg-gray-800/60 rounded-lg px-3 py-2 mb-5 flex items-center gap-2">
          <FileText size={13} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-300 truncate font-mono">{fileName}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer border border-gray-700/50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-red-900/20"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

const ChatItem = ({ chat, isActive, onSelect, onUpload, onDeleteRequest, isDeleting }) => {
  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        onUpload(chat._id, file);
        e.target.value = ""; // Reset so same file can be re-selected
      }
    },
    [chat._id, onUpload]
  );

  return (
    <div
      onClick={() => onSelect(chat._id)}
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isActive
          ? "bg-blue-600/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.04)]"
          : "bg-gray-800/20 border-transparent hover:bg-gray-800/50 hover:border-gray-700/60"
      } ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
    >
      {/* File name / title */}
      <div className="flex items-start gap-2 min-w-0 mb-3">
        <FileText
          size={14}
          className={`mt-0.5 shrink-0 ${isActive ? "text-blue-400" : "text-gray-500"}`}
        />
        <span
          className={`font-medium truncate text-sm leading-snug ${
            isActive ? "text-blue-300" : "text-gray-300 group-hover:text-gray-200"
          }`}
        >
          {chat.fileName || "Untitled Session"}
        </span>
      </div>

      {/* Vectorized badge */}
      {chat.hasPdf && (
        <div className="flex items-center gap-1.5 mb-3">
          <CheckCircle size={11} className="text-emerald-400" />
          <span className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">
            Vectorized
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {!chat.hasPdf ? (
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center justify-center gap-1.5 bg-gray-800/80 hover:bg-blue-600/20 text-gray-400 hover:text-blue-300 text-[11px] font-semibold py-2 px-3 rounded-lg transition-all border border-gray-700/60 border-dashed hover:border-blue-500/50">
              <Upload size={11} />
              Upload PDF
            </div>
            <input
              type="file"
              accept="application/pdf"
              hidden
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <button
            onClick={() => onDeleteRequest(chat._id, chat.storedFileName)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-400 text-[11px] font-semibold py-2 px-3 rounded-lg cursor-pointer transition-all border border-gray-700/40 hover:border-red-500/30"
          >
            <Trash2 size={11} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({
  handleUpload,
  handleDelete,
  handleNewChat,
  chats,
  setActiveChatId,
  activeChatId,
}) => {
  const [confirmTarget, setConfirmTarget] = useState(null); // { id, fileName }
  const [deletingIds, setDeletingIds] = useState(new Set());

  const requestDelete = useCallback((id, fileName) => {
    setConfirmTarget({ id, fileName });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!confirmTarget) return;
    const { id } = confirmTarget;
    setConfirmTarget(null);
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await handleDelete(id);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [confirmTarget, handleDelete]);

  const vectorizedCount = chats.filter((c) => c.hasPdf).length;

  return (
    <>
      {confirmTarget && (
        <ConfirmModal
          fileName={confirmTarget.fileName}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}

      <div className="w-full bg-[#0D1220] border-r border-gray-800/50 flex flex-col h-full">
        {/* ── Header ───────────────────────────────────── */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/30 text-base">
              📄
            </div>
            <h1 className="text-[17px] font-bold tracking-tight text-white">PDF AI</h1>
          </div>
          <p className="text-[9px] text-gray-600 uppercase tracking-[0.25em] font-bold mb-5">
            Vector Analytics
          </p>

          <button
            onClick={handleNewChat}
            className="group w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-150 shadow-md shadow-blue-900/30 border border-blue-400/20"
          >
            <FilePlus size={15} className="group-hover:scale-110 transition-transform" />
            New Session
          </button>
        </div>

        {/* ── Stats strip ──────────────────────────────── */}
        <div className="mx-4 mb-3 px-3 py-2 bg-gray-800/30 rounded-lg border border-gray-700/30 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-semibold">
            {chats.length} session{chats.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
            <span className="text-[10px] text-emerald-500 font-semibold">
              {vectorizedCount} vectorized
            </span>
          </div>
        </div>

        {/* ── Chat list ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          <p className="px-1 pb-1.5 text-[10px] font-bold text-gray-600 tracking-widest uppercase">
            Recent Sessions
          </p>

          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-xs text-gray-600 font-medium">No sessions yet</p>
              <p className="text-[10px] text-gray-700 mt-1">Click "New Session" to begin</p>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                isActive={chat._id === activeChatId}
                onSelect={setActiveChatId}
                onUpload={handleUpload}
                onDeleteRequest={requestDelete}
                isDeleting={deletingIds.has(chat._id)}
              />
            ))
          )}
        </div>

        {/* ── Footer ───────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-gray-800/40">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-gray-700 font-bold tracking-widest">v2.1.0</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] text-gray-700 font-bold tracking-widest">ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;