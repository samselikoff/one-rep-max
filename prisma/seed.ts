import { PrismaClient } from "@prisma/client";
// import bcrypt from "@node-rs/bcrypt";

let prisma = new PrismaClient();

async function seed() {
  // let email = "sam.selikoff@gmail.com";

  // // cleanup the existing database
  // await prisma.user.delete({ where: { email } }).catch(() => {
  //   // no worries if it doesn't exist yet
  // });

  // let hashedPassword = await bcrypt.hash("racheliscool", 10);

  // let user = await prisma.user.create({
  //   data: {
  //     email,
  //     password: {
  //       create: {
  //         hash: hashedPassword,
  //       },
  //     },
  //   },
  // });

  // ["Bench press", "Squat", "Deadlift", "Shoulder press"].forEach(
  //   async (name) => {
  //     await prisma.exercise.create({ data: { name } });
  //   }
  // );

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
