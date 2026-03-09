
// src/pages/Module2.jsx

export default function Module2({ page }) {
  return (
    <iframe
      src={`/module2/${page}.html`}
      style={{
        width: "100%",
        height: "calc(100vh - 110px)", // adjust for header+footer
        border: "none",
      }}
      title={`Module2 ${page}`}
    />
  );
}