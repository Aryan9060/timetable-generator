import jwt from "jsonwebtoken";

//* Generate Access Token (short-lived)
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      user_id: user.user_id,
      role: user.role,
      student_id: user.student_id,
      faculty_id: user.faculty_id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

//? const u = { _id:"69d008f40a3cac9435a78f8d", user_id: "STU_ADT25COMM0873",student_id:"ADT25COMM0873",  role: "admin" };
//? console.log(generateAccessToken(u));

//* Generate Refresh Token (long-lived)
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

//* Generate both tokens
export const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

//* Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw error;
  }
};

//* Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw error;
  }
};

//* Cookie options for tokens
export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 15 * 60 * 1000, //? 15 minutes
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, //? 7 days
};
