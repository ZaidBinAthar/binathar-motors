import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [display, setDisplay] = useState(children);

  useEffect(() => {
    setDisplay(children);
  }, [children]);

  return (
    <div key={location.pathname} className="animate-page-in">
      {display}
    </div>
  );
};

export default PageTransition;
