import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";
const RATE_LIMIT_MS = 1100;

let lastRequest = 0;

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequest;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequest = Date.now();
}

async function siconfiGet(path: string, params?: Record<string, any>) {
  await rateLimit();
  const url = new URL(`${SICONFI_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`SICONFI ${res.status}: ${res.statusText}`);
  return res.json();
}

function extractValue(items: any[], codConta: string, coluna: string): number {
  for (const i of items) {
    if (i.cod_conta === codConta && i.coluna === coluna) {
      return Number(i.valor) || 0;
    }
  }
  return 0;
}

function sumValues(items: any[], codConta: string, coluna: string, filter?: string): number {
  let total = 0;
  for (const i of items) {
    if (i.cod_conta === codConta && i.coluna === coluna) {
      if (!filter || (i.conta && i.conta.includes(filter))) {
        total += Number(i.valor) || 0;
      }
    }
  }
  return total;
}

async function syncMunicipalities() {
  console.log("Sincronizando municípios da API SICONFI...");
  const data = await siconfiGet("/entes");
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

  return items
    .filter((i: any) => String(i.cod_ibge ?? "").length >= 7)
    .sort((a: any, b: any) => (Number(b.populacao) || 0) - (Number(a.populacao) || 0));
}

async function syncRREO(ibgeCode: string, year: number, name: string) {
  try {
    const data = await siconfiGet("/rreo", {
      an_exercicio: year,
      nr_periodo: 6,
      co_tipo_demonstrativo: "RREO",
      id_ente: ibgeCode,
    });

    const items: any[] = Array.isArray(data) ? data : data?.items ?? [];
    if (!items.length) {
      console.log(`  RREO sem dados para ${name} (${ibgeCode})/${year}`);
      return;
    }

    const revenue = extractValue(items, "ReceitasExcetoIntraOrcamentarias", "Até o Bimestre (c)");
    const expense = extractValue(items, "DespesasExcetoIntraOrcamentarias", "DESPESAS EMPENHADAS ATÉ O BIMESTRE (f)");
    const expenseLiquidada = extractValue(items, "DespesasExcetoIntraOrcamentarias", "DESPESAS LIQUIDADAS ATÉ O BIMESTRE (h)");

    if (revenue === 0 && expense === 0) {
      console.log(`  RREO sem valores para ${name} (${ibgeCode})/${year}`);
      return;
    }

    const usedExpense = expense || expenseLiquidada;

    const educationDespesa = extractValue(items, "MinimoAnualDasReceitasDeImpostosNaManutencaoEDesenvolvimentoDoEnsinoDemonstrativoSimplificado", "Valor Apurado Até o Bimestre");
    const healthDespesa = extractValue(items, "AplicacaoTotalDasDespesasComAcoesEServicosPublicosDeSaude", "Valor Apurado Até o Bimestre");

    const educationPercent = usedExpense > 0 ? +((educationDespesa / usedExpense) * 100).toFixed(2) : 0;
    const healthPercent = usedExpense > 0 ? +((healthDespesa / usedExpense) * 100).toFixed(2) : 0;

    await prisma.fiscalIndicator.upsert({
      where: { municipalityId_year: { municipalityId: ibgeCode, year } },
      update: { revenue, expense: usedExpense, result: revenue - usedExpense, educationPercent, healthPercent },
      create: { municipalityId: ibgeCode, year, revenue, expense: usedExpense, result: revenue - usedExpense, educationPercent, healthPercent },
    });

    console.log(`  RREO OK ${name} (${ibgeCode})/${year}: R$ ${(revenue/1e9).toFixed(2)}B receita`);
  } catch (err: any) {
    console.warn(`  RREO erro ${name} (${ibgeCode})/${year}: ${err.message}`);
  }
}

async function syncRGF(ibgeCode: string, year: number, name: string) {
  try {
    const data = await siconfiGet("/rgf", {
      an_exercicio: year,
      in_periodicidade: "Q",
      nr_periodo: 3,
      co_tipo_demonstrativo: "RGF",
      co_poder: "E",
      id_ente: ibgeCode,
    });

    const items: any[] = Array.isArray(data) ? data : data?.items ?? [];
    if (!items.length) {
      console.log(`  RGF sem dados para ${name} (${ibgeCode})/${year}`);
      return;
    }

    let personnelPercent = 0;
    for (const i of items) {
      if (i.cod_conta === "RGF" && i.coluna === "%" && i.conta && i.conta.includes("Pessoal")) {
        personnelPercent = Number(i.valor) || 0;
        break;
      }
    }

    const existing = await prisma.fiscalIndicator.findUnique({
      where: { municipalityId_year: { municipalityId: ibgeCode, year } },
    });

    if (existing) {
      await prisma.fiscalIndicator.update({
        where: { municipalityId_year: { municipalityId: ibgeCode, year } },
        data: { personnelPercent },
      });
    }

    console.log(`  RGF OK ${name} (${ibgeCode})/${year}: ${personnelPercent}% pessoal`);
  } catch (err: any) {
    console.warn(`  RGF erro ${name} (${ibgeCode})/${year}: ${err.message}`);
  }
}

async function main() {
  const sortedItems = await syncMunicipalities();

  const top10 = sortedItems.slice(0, 10);
  const year = new Date().getFullYear();
  const years = [year - 1, year - 2];

  console.log(`\nBuscando indicadores para os ${top10.length} maiores municípios...`);

  for (const item of top10) {
    const ibgeCode = String(item.cod_ibge ?? "").padStart(7, "0");
    const name = item.ente ?? ibgeCode;

    for (const y of years) {
      await syncRREO(ibgeCode, y, name);
      await syncRGF(ibgeCode, y, name);
    }
  }

  console.log("\nSeed concluído com dados da API SICONFI");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
