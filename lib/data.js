export const getProducts = async (prisma) => {
  const products = await prisma.product.findMany({})

  return products
}