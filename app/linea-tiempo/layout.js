// app/linea-tiempo/layout.js
export default function TimelineLayout({ children }) {
  return (
    <div className="w-full min-h-screen bg-warm-white" style={{ margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}