import { createContext, useContext, useState } from "react";

const WhatsAppContext = createContext();

export const WhatsAppProvider = ({ children }) => {
  const [bike, setBike] = useState(null);
  return (
    <WhatsAppContext.Provider value={{ bike, setBike }}>
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => useContext(WhatsAppContext);
