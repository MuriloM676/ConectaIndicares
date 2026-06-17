import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";

async function main() {
  console.log("Sincronizando municípios da API SICONFI...");

  const res = await fetch(`${SICONFI_BASE}/entes`);
  if (!res.ok) throw new Error(`SICONFI ${res.status}`);
  const data = await res.json();
  const items: any[] = Array.isArray(data) ? data : data?.items ?? [];

  let count = 0;
  for (const item of items) {
    const ibgeCode = String(item.cod_ibge ?? "").padStart(7, "0");
    if (!ibgeCode || ibgeCode.length < 7) continue;

    await prisma.municipality.upsert({
      where: { ibgeCode },
      update: {
        name: item.ente ?? "",
        uf: item.uf ?? "",
        population: Number(item.populacao) || 0,
        cnpj: String(item.co_cnpj ?? ""),
      },
      create: {
        ibgeCode,
        name: item.ente ?? "",
        uf: item.uf ?? "",
        population: Number(item.populacao) || 0,
        cnpj: String(item.co_cnpj ?? ""),
      },
    });
    count++;
  }

  console.log(`${count} municípios importados da API SICONFI`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
