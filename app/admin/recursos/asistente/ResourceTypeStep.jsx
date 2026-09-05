"use client";

const STEP_COLORS = {
  card: "#fdfbf7",
  border: "#d4c4a8",
  gold: "#d4ac0d",
  muted: "#8d6e63",
  text: "#3e2723",
};

export default function ResourceTypeStep({ types, onSelectType, onClose }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: STEP_COLORS.gold, marginBottom: 12 }}>
        Seleccioná el tipo de recurso
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 18 }}>
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            style={{
              background: STEP_COLORS.card,
              border: `2px solid ${STEP_COLORS.border}`,
              borderRadius: 8,
              padding: "12px 10px",
              cursor: "pointer",
              textAlign: "center",
              color: STEP_COLORS.text,
            }}
          >
            <span style={{ fontSize: 22, display: "block", marginBottom: 4 }}>
              {type.icon}
            </span>
            <span style={{ fontSize: 12 }}>{type.label}</span>
          </button>
        ))}
      </div>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          color: STEP_COLORS.muted,
          border: `1px solid ${STEP_COLORS.border}`,
          borderRadius: 7,
          padding: "10px 20px",
          cursor: "pointer",
          fontSize: 14,
          fontFamily: "Georgia, serif",
        }}
      >
        Cancelar
      </button>
    </div>
  );
}