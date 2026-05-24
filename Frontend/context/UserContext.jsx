import React, { useState, createContext, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "./AppContext";

export const UserContext = createContext();

const UserProvider = (props) => {
  const { SetEmail, setIsLogged } = useContext(AppContext);
  const [user, setUser] = useState(null);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/user/get-user",
        { withCredentials: true }
      );

      if (data.success) {
        setUser(data.user);
        setIsLogged(true);
        SetEmail(data.user.email);
        console.log(data.user);
      } else {
        if (data.msg === "UnAuthorized user!!") {
          toast.warning("Please login");
        } else if (data.msg === "Invalid user ID") {
          toast.warning("Invalid user ID");
        }
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, getUserData }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserProvider;
