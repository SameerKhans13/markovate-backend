import pool from "../config/database.js";
import jwt from "jsonwebtoken";

export const getdashboard = async (id) => {
  const fetchuser = await pool.query(`select * from accounts where id = $1;`, [
    id,
  ]);
  if (fetchuser.rows.length != 1) {
    // return no account
  }
  const raw = {
    email: fetchuser.rows[0].email,
    verified: fetchuser.rows[0].verified,
  };
  const accesstoken = jwt.sign(raw, "secret", {
    expiresIn: "1hr",
  });
  console.log(jwt.decode(accesstoken));
  return raw;
};
