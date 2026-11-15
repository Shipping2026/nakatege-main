export type Product = {
  id: number;
  name: string;
  price: number;
  rating: number;
  sold: number;
  image: string;
};

// Vide pour l'instant. Quand tu publies un produit, ajoute-le ici.
// Exemple : { id: 1, name: "Mon produit", price: 25, rating: 5, sold: 0, image: "/products/mon-produit.jpg" }
export const PRODUCTS: Product[] = [];