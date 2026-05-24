import React, { useState, createContext } from "react";

export const AppContext = createContext();

const AppProvider = (props) => {
  const [email, SetEmail] = useState(""); // this extra email state was used to handle the problem of send otp thing
  const [isLogged, setIsLogged] = useState(() => {
    return localStorage.getItem("isLogged")
      ? JSON.parse(localStorage.getItem("isLogged"))
      : false;
  });
  const [otpFor, setOtpFor] = useState("");

  return (
    <AppContext.Provider
      value={{ email, SetEmail, isLogged, setIsLogged, otpFor, setOtpFor }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppProvider;
