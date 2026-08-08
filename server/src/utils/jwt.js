import jwt from "jsonwebtoken";

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}
