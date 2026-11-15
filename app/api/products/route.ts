export async function GET() {
  return Response.json([
    { id: 1, name: "Orange Luxury Bag", price: 49.99 },
    { id: 2, name: "Sport Runner", price: 79.99 },
    { id: 3, name: "Royal Chrono", price: 199.99 }
  ]);
}