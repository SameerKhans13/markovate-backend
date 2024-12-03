import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../config/database.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendVerificationEmail } from "./emailServices.js";
import { response } from "express";
import { access } from "fs";

dotenv.config();

export const userSignUp = async (email, password, account_type) => {
  const fetchuser = await pool.query(
    `SELECT * FROM accounts WHERE email = $1`,
    [email]
  );

  if (fetchuser.rows.length > 0) {
    return { status: 201, response: {} };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const tokenKey = crypto.createHash("sha256").update(email).digest("hex");
  const user = await pool.query(
    `INSERT INTO accounts (email, password, token_key, account_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email;`,
    [`${email}`, `${hashedPassword}`, `${tokenKey}`, `${account_type}`]
  );
  const accesstoken = jwt.sign(
    { id: user.rows[0].id, email: user.rows[0].email },
    process.env.ACCESS_SECRET,
    {
      expiresIn: "1hr",
    }
  );
  
  const refreshtoken = jwt.sign(
    { id: user.rows[0].id },
    process.env.REFRESH_SECRET,
    {
      expiresIn: "120d",
    }
  );
  return {
    status: 200,
    response: {
      accesstoken: accesstoken,
      refreshtoken: refreshtoken,
    },
  };
};


export const UserSignIn = async (email, password) => {
  const fetchuser = await pool.query(
    `SELECT * FROM accounts WHERE email = $1`,
    [email]
  );
  if (fetchuser.rows.length == 1) {
    if (await bcrypt.compare(password, fetchuser.rows[0].password)) {
      const id = fetchuser.rows[0].id;
      const accesstoken = jwt.sign(
        { id: id, email: fetchuser.rows[0].email },
        process.env.ACCESS_SECRET,
        {
          expiresIn: "1hr",
        }
      );
      const refreshtoken = jwt.sign(
        { id: id, email: fetchuser.rows[0].email },
        process.env.REFRESH_SECRET,
        {
          expiresIn: "120d",
        }
      );
      return {
        status: 200,
        response: {
          accesstoken: accesstoken,
          refreshtoken: refreshtoken,
        },
      };
    } else {
      return { status: 202, response: {} };
    }
  } else {
    return { status: 201, response: {} };
  }
};

export const generateVerificationEmail = async (id) => {
  const fetchuser = await pool.query(
    `SELECT email_services FROM accounts WHERE id = $1`,
    [id]
  );
  if (fetchuser.rows.length == 1) {
    fetchuser.rows[0].email_services[0] = true;
    const moduser = await pool.query(
      `UPDATE accounts SET email_services = $1 WHERE id = $2 Returning token_key, email`,
      [fetchuser.rows[0].email_services, id]
    );
    console.log(moduser.rows[0]);
     await sendVerificationEmail(
      moduser.rows[0].email,
      moduser.rows[0].token_key
    ); 
    return { status: 200 };
  } else {
    return { status: 201 };
  }
};

export const verifyEmail = async (email, token) => {
  const fetchuser = await pool.query(
    `select email_services from accounts WHERE email = $1 AND token_key = $2`,
    [email, token]
  );
  if (fetchuser.rows.length == 1 && fetchuser.rows[0].email_services[0]) {
    fetchuser.rows[0].email_services[0] = false;
    const updateuser = await pool.query(
      `UPDATE accounts SET verified = true, email_services = $1 WHERE email = $2;`,
      [fetchuser.rows[0].email_services, email]
    );
    return { status: 200 };
  } else {
    return { status: 201 };
  }
};

export const forgotPassword = async (id) => {
  const fetchuser = await pool.query(
    `SELECT email_services FROM accounts WHERE id = $1`,
    [id]
  );
  if (fetchuser.rows.length == 1) {
    fetchuser.rows[0].email_services[1] = true;
    const moduser = await pool.query(
      `UPDATE accounts SET email_services = $1 WHERE id = $2 Returning token_key, email`,
      [fetchuser.rows[0].email_services, id]
    );
    /* await sendPasswordResetEmail(
      moduser.rows[0].email,
      moduser.rows[0].token_key
    ); */
    return { status: 200 };
  } else {
    return { status: 201 };
  }
};
export const resetpassword = async (id, password) => {
  const email_services = await pool.query(
    `SELECT email_services FROM accounts WHERE id = $1`,
    [id]
  );
  if (
    email_services.rows.length == 1 &&
    email_services.rows[0].email_services[1]
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);
    email_services.rows[0].email_services[1] = false;
    const updateuser = await pool.query(
      `UPDATE accounts SET password = $1, email_services = $2 WHERE id = $3;`,
      [hashedPassword, email_services.rows[0].email_services, id]
    );
    return { status: 200 };
  } else {
    return { status: 201 };
  }
};
export const refreshtokens = async (accesstoken, refreshtoken) => {
  const decoded = jwt.decode(refreshtoken);
  if (decoded === null) return { status: 201, response: {} };
  else {
    const id = decoded.id;
    const email = decoded.email;
    const newaccesstoken = jwt.sign(
      { id: id, email: email },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "1hr",
      }
    );
    return {
      status: 200,
      response: {
        accesstoken: newaccesstoken,
        refreshtoken: refreshtoken,
      },
    };
  }
};
