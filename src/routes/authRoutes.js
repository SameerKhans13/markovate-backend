import express from "express";
import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
import {
  userSignUp,
  UserSignIn,
  generateVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetpassword,
  refreshtokens,
} from "../services/authServices.js";
const route = express.Router();

dotenv.config();

route.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const result = await userSignUp(email, password);
    res.status(result.status).json(result.response);
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
});

route.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await UserSignIn(email, password);
    res.status(result.status).json(result.response);
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
});

route.post("/getverified", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await generateVerificationEmail(id);
    res.status(result.status).send();
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
});

route.post("/verifyemail", async (req, res) => {
  try {
    const { email, token } = req.body;
    const result = await verifyEmail(email, token);
    res.status(result.status).send();
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
 
});

route.post("/forgotpassword", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await forgotPassword(id);
    res.status(result.status).send();
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
});

route.post("/resetpassword", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await resetpassword(email, password);
    res.status(result.status).send();
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
});

route.post("/refreshtokens", async (req, res) => {
  try {
    const { accesstoken, refreshtoken } = req.body;
    const result = await refreshtokens(accesstoken, refreshtoken);
    res.status(result.status).json(result.response);
  } catch (error) {
    res.status(400).json({ errMessage: error.message });
  }
});

export default route;
