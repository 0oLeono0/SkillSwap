import { PrismaClient } from '@prisma/client';
import { db } from '../src/data/mockData.js';

const prisma = new PrismaClient();

const seedCities = async () => {
  for (const city of db.cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: { name: city.name },
      create: {
        id: city.id,
        name: city.name
      }
    });
  }
};

const seedSkillGroups = async () => {
  for (const group of db.skills) {
    await prisma.skillGroup.upsert({
      where: { id: group.id },
      update: { name: group.name },
      create: {
        id: group.id,
        name: group.name
      }
    });
  }
};

const seedSkills = async () => {
  for (const group of db.skills) {
    const subskills = group.subskills ?? [];
    for (const skill of subskills) {
      await prisma.skill.upsert({
        where: { id: skill.id },
        update: {
          name: skill.name,
          groupId: group.id
        },
        create: {
          id: skill.id,
          name: skill.name,
          groupId: group.id
        }
      });
    }
  }
};

async function main() {
  await seedCities();
  await seedSkillGroups();
  await seedSkills();
}

main()
  .catch((error) => {
    console.error('[seed] Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
