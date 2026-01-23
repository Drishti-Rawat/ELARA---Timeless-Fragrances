import LandingPage from "@/components/LandingPage";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'; // Ensure fresh data

export default async function Home() {
  // Fetch Categories
  const categoriesData = await prisma.category.findMany({
    take: 4,
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  // Fetch Best Seller Products (Featured)
  const bestSellersData = await prisma.product.findMany({
    where: {
      isFeatured: true,
      isArchived: false,
    },
    take: 4,
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      images: true, // Assuming this contains URLs
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  // Fallback if no featured products
  let finalBestSellers = bestSellersData;
  if (finalBestSellers.length < 4) {
    const moreProducts = await prisma.product.findMany({
      where: {
        isArchived: false,
        NOT: { id: { in: finalBestSellers.map(p => p.id) } }
      },
      take: 4 - finalBestSellers.length,
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    finalBestSellers = [...finalBestSellers, ...moreProducts];
  }

  // Transform data for client component (handling Decimal and nulls)
  const categories = categoriesData.map(cat => ({
    id: cat.id,
    name: cat.name,
    image: cat.image,
  }));

  const bestSellers = finalBestSellers.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price.toString(), // Convert Decimal to string
    description: product.description,
    images: product.images,
  }));

  return (
    <LandingPage
      categories={categories}
      bestSellers={bestSellers}
    />
  );
}
