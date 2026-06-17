import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MUNICIPALITIES = [
  { ibgeCode: "3550105", name: "São Paulo", uf: "SP", population: 12300000, cnpj: "50270200000184" },
  { ibgeCode: "3304557", name: "Rio de Janeiro", uf: "RJ", population: 6748000, cnpj: "42520630000150" },
  { ibgeCode: "3106200", name: "Belo Horizonte", uf: "MG", population: 2521564, cnpj: "18671585000100" },
  { ibgeCode: "2927408", name: "Salvador", uf: "BA", population: 2860000, cnpj: "13927240000165" },
  { ibgeCode: "5300108", name: "Brasília", uf: "DF", population: 3055149, cnpj: "00394460000100" },
];

async function main() {
  for (const m of MUNICIPALITIES) {
    await prisma.municipality.upsert({
      where: { ibgeCode: m.ibgeCode },
      update: m,
      create: m,
    });
  }
  console.log(`Seeded ${MUNICIPALITIES.length} municipalities`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
