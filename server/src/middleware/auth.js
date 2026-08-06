import jwt from "jsonwebtoken";

export const sendOtp = async (req, res) => {};

export const verifyOtp = async (req, res) => {};

// Blocks the request entirely if there's no valid token.
export function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role, phone }
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Not authorized, invalid or expired token" });
  }
}

// Does NOT block if there's no token — just attaches req.user when a valid one exists.
// Used for routes that behave differently for logged-in vs anonymous users (like Add Vehicle).
export function attachUserIfPresent(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    } catch (err) {
      // invalid/expired token — proceed as anonymous rather than blocking
    }
  }
  next();
}
