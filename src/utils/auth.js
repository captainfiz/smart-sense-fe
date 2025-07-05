import jwt from "jsonwebtoken";

const SECRET = process.env.NEXT_PUBLIC_JWT_SECRET_KEY; // Use same in backend
const ALGO = process.env.NEXT_PUBLIC_ALGORITHM;

export const generateToken = (employeeCode) => {
  return jwt.sign({ employeeCode }, SECRET, {
    algorithm: ALGO,
    expiresIn: "10d",
  });
};

export const saveToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", token);
  }
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
};
