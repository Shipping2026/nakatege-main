import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, name: "Orange Luxury Bag", price: 49.99, image: "/bag.png" },
    { id: 2, name: "Sport Runner", price: 79.99, image: "/shoe.png" },
    { id: 3, name: "Royal Chrono", price: 199.99, image: "/watch.png" }
  ]);
}