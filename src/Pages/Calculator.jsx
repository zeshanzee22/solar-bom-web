// src/pages/Calculator.jsx

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import Loading from "../components/shared/Loading";

export default function Calculator({ page }) {
  const iframeRef = useRef();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(true);  
  const handleIframeLoad = () => {
    setLoading(false);  
  };

  useEffect(() => {
  const sendData = () => {
    if (iframeRef.current && user && token) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "AUTH_DATA",
          user,
          token,
        },
        "*"
      );
    }
  };

  if (iframeRef.current) {
    iframeRef.current.onload = sendData;
  }

  // fallback (in case already loaded)
  sendData();
}, [user, token]);


  return (
     <div className="relative w-full h-full">
      {/* Loader overlay */}
      {loading && <Loading />}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={`/module1/${page}.html`}
        onLoad={handleIframeLoad}
        style={{
          width: "100%",
          height: "calc(100vh - 110px)",
          border: "none",
        }}
        title={`Legacy ${page}`}
      />
    </div>
   
  );
}
