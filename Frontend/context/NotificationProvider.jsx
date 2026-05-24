import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import axios from "axios";

import { AppContext } from "./AppContext";
export const NotificationContext = createContext();
const NotificationProvider = (props) => {
  const [notifications, setNotifications] = useState();
  const [newNotification, setNewNotification] = useState();
  const { isLogged } = useContext(AppContext);
  const getNotification = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:8000/api/notification/get-notifications",
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        setNotifications(data.notifications);
        console.log(data.notifications);
        //counting the new notification
        let count = 0;
        data.notifications.forEach((noti) => {
          if (!noti.isRead) {
            count++;
          }
        });
        setNewNotification(count);
        return;
      } else {
        console.log(data.msg);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  useEffect(() => {
    if (isLogged) {
      getNotification();
    }
  }, [isLogged]);
  return (
    <NotificationContext.Provider
      value={{ notifications, newNotification, setNewNotification }}
    >
      {props.children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
