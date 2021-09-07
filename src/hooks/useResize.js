import React, { useState, useEffect } from "react";
export default function useResize() {
  const [isMobile, setIsMobile] = useState(
    window.innerHeight > window.innerWidth
  );
  useEffect(() => {
    function updateScreenType() {
      window.innerHeight > window.innerWidth
        ? setIsMobile(true)
        : setIsMobile(false);
    }
    window.addEventListener("resize", updateScreenType);
    return () => window.removeEventListener("resize", updateScreenType);
  }, []);
  return isMobile;
}
