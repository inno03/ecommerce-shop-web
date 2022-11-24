-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "price" INTEGER,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
