const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  try {
    await db.category.createMany({
      data: [
        { name: "Famous People" },
        { name: "Celebrities" },
        { name: "Musicians" },
        { name: "Games" },
        { name: "Philosophy" },
        { name: "Scientists" },
        { name: "Sports" },
      ],
    });
  } catch (error) {
    console.log("Error seeding default categories:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
