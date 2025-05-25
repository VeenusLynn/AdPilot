import React from "react";
import { useSelector } from "react-redux";
import { Typography } from "@mui/material";

const Dashboard = () => {
  const user = useSelector((state) => state.user);
  console.log(user.data);
  return <div>Dashboard</div>;
};

export default Dashboard;
