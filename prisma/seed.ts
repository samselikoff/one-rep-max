import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

let prisma = new PrismaClient();

async function seed() {
  let email = "sam.selikoff@gmail.com";

  // cleanup the existing database
  await prisma.user.deleteMany();
  await prisma.exercise.deleteMany();

  let hashedPassword = await bcrypt.hash("asdf;lkj", 10);

  let user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  let exercises = [
    "Bench press",
    "Clean and jerk",
    "Squat",
    "Deadlift",
    "Shoulder press",
  ];

  for (const name of exercises) {
    let exercise = await prisma.exercise.create({
      data: { name },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (name === "Bench press") {
      await prisma.entry.create({
        data: {
          exerciseId: exercise.id,
          userId: user.id,
          date: new Date(),
          sets: {
            create: [
              { weight: 135, reps: 10 },
              { weight: 185, reps: 5 },
              { weight: 185, reps: 5 },
              { weight: 185, reps: 3, tracked: true },
            ],
          },
        },
      });
    }
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
