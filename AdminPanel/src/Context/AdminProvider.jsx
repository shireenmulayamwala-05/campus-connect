import React, { useState } from "react";
import { createContext } from "react";
export const AdminContext = createContext();
const AdminProvider = (props) => {
  const [isAdminLogged, setIsAdminLogged] = useState(() => {
    return localStorage.getItem("isAdminLogged") === "true";
  });
  React.useEffect(() => {
    localStorage.setItem("isAdminLogged", isAdminLogged ? "true" : "false");
  }, [isAdminLogged]);
  return (
    <AdminContext.Provider value={{ isAdminLogged, setIsAdminLogged }}>
      {props.children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
