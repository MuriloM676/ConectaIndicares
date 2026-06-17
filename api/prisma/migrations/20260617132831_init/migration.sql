-- CreateTable
CREATE TABLE "municipalities" (
    "ibge_code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "cnpj" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("ibge_code")
);

-- CreateTable
CREATE TABLE "fiscal_indicators" (
    "id" TEXT NOT NULL,
    "municipality_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expense" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "result" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "education_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "health_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "personnel_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "fiscal_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_status" (
    "id" TEXT NOT NULL,
    "municipality_id" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "delivered_at" TIMESTAMP(3),
    "year" INTEGER NOT NULL,
    "periodicity" TEXT,

    CONSTRAINT "delivery_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_indicators_municipality_id_year_key" ON "fiscal_indicators"("municipality_id", "year");

-- AddForeignKey
ALTER TABLE "fiscal_indicators" ADD CONSTRAINT "fiscal_indicators_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities"("ibge_code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_status" ADD CONSTRAINT "delivery_status_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities"("ibge_code") ON DELETE RESTRICT ON UPDATE CASCADE;
