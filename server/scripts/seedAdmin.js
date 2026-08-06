import "dotenv/config";
import prisma from "../src/prisma/prisma.js";

async function main() {
  const admin = await prisma.user.upsert({
    where: { phone: process.env.ADMIN_PHONE }, // change this to whatever you want your real admin phone to be
    update: {},
    create: {
      name: "Super Admin",
      phone: process.env.ADMIN_PHONE,
      role: "ADMIN",
      isVerified: true,
    },
  });
  console.log("Admin ready:", admin);
}

main()
  .catch(console.error)
  .finally(() => process.exit());
