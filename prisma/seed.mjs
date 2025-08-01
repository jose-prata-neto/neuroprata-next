import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('A iniciar o processo de seeding...');

  // Apaga o utilizador admin antigo, se existir, para evitar duplicados
  await prisma.user.deleteMany({
    where: { email: 'admin@neuroprata.com' },
  });

  // Cria o novo utilizador admin
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@neuroprata.com',
      passwordHash: 'hashed_admin123', // Senha é 'admin123'
      role: 'admin',
    },
  });

  console.log('Utilizador admin criado com sucesso:', adminUser);
  console.log('Seeding concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });