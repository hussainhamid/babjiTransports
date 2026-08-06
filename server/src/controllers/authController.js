import crypto from "crypto";
import prisma from "../prisma/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { normalizePhone } from "../utils/normalizePhone.js";

const otpStore = new Map();

export async function sendOtp(req, res) {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const otp = crypto.randomInt(100000, 999999).toString();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    console.log(`[DEV ONLY] OTP for ${phone}: ${otp}`); // TODO: replace with a real SMS provider

    return res.status(200).json({
      message: "OTP sent successfully",
      devOtp: otp, // TODO: remove once SMS is wired up — for local testing only
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to send OTP" });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { otp, name } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!phone || !otp)
      return res.status(400).json({ message: "Phone and OTP are required" });

    const record = otpStore.get(phone);
    if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    otpStore.delete(phone);

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // New number, no account yet — sign them up as CUSTOMER by default.
      // Owner accounts still come from the Add Vehicle flow, not this generic login.
      user = await prisma.user.create({
        data: {
          name: name || "New User",
          phone,
          role: "CUSTOMER",
          isVerified: true,
        },
      });
    } else if (!user.isVerified) {
      user = await prisma.user.update({
        where: { phone },
        data: { isVerified: true },
      });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been deactivated." });
    }

    if (user.role === "ADMIN") {
      return res
        .status(200)
        .json({ requiresSecretKey: true, phone: user.phone });
    }

    const token = generateToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to verify OTP" });
  }
}

export async function verifyAdminSecretKey(req, res) {
  try {
    const { secretKey } = req.body;
    const phone = normalizePhone(req.body.phone);
    if (!phone || !secretKey)
      return res
        .status(400)
        .json({ message: "Phone and secret key are required" });

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || user.role !== "ADMIN") {
      return res.status(404).json({ message: "No admin account found." });
    }
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ message: "Invalid secret key." });
    }

    const token = generateToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to log in." });
  }
}

export async function login(req, res) {
  try {
    const { phone, secretKey } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this phone number." });
    }
    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been deactivated." });
    }

    if (user.role === "ADMIN") {
      if (!secretKey) {
        // Tells the frontend to show the secret-key field without revealing that
        // the account exists to someone just guessing phone numbers.
        return res.status(401).json({
          message: "Admin secret key is required.",
          requiresSecretKey: true,
        });
      }
      if (secretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(401).json({ message: "Invalid secret key." });
      }
    }

    const token = generateToken(user);
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to log in." });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch profile" });
  }
}
