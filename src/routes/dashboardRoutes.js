// it is the dashboardRoutes.js file

import express from "express";
import dotenv from "dotenv";
import { getdashboard } from "../services/dashboardServices.js";

const dashboardroute = express.Router();

dotenv.config();

dashboardroute.post("/getdashboard", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await getdashboard(id);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
});

export default dashboardroute;