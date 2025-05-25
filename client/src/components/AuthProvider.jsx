import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "../state/api";
import { fetchUser } from "../state/userSlice";
import { Outlet } from "react-router-dom";

const AuthProvider = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await getCurrentUser();
        const userId = response.data?._id || response.data?.id;
        if (userId) {
          await dispatch(fetchUser(userId));
        }
      } catch (error) {
        console.log("No valid user session found.", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [dispatch]);

  if (loading) return null;

  return <Outlet />;
};

export default AuthProvider;
