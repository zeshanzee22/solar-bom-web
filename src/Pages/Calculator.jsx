// src/pages/Calculator.jsx

export default function Calculator({ page }) {
  return (
    <iframe
      src={`/module1/${page}.html`}
      style={{
        width: "100%",
        height: "calc(100vh - 110px)", // adjust for header+footer
        border: "none",
      }}
      title={`Legacy ${page}`}
    />
  );
}