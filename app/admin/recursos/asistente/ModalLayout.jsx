"use client";

export default function ModalLayout({ children, context, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "#fdfbf7",
          borderRadius: 12,
          width: "90%",
          maxWidth: 700,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: 24,
          fontFamily: "Georgia, serif",
          color: "#3e2723",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2 style={{ color: "#d4ac0d", margin: 0, fontSize: 18 }}>✨ Asistente IA</h2>
            <p style={{ color: "#8d6e63", fontSize: 12, margin: "2px 0 0" }}>
              {context.libro} — Cap. {context.cap}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "1px solid #d4c4a8", borderRadius: 6, color: "#8d6e63", fontSize: 18, cursor: "pointer", padding: "4px 10px" }}
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}