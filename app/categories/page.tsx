"use client"

import Link from "next/link"

const categories = [
  { id: 1, name: "Téléphones", image: "📱" },
  { id: 2, name: "Ordinateurs", image: "💻" },
  { id: 3, name: "Vêtements", image: "👕" },
  { id: 4, name: "Chaussures", image: "👟" },
  { id: 5, name: "Accessoires", image: "👜" },
  { id: 6, name: "Électronique", image: "🔌" },
  { id: 7, name: "Maison", image: "🏠" },
  { id: 8, name: "Voitures", image: "🚗" },
]

const produits: any[] = [] // VIDE

export default function CategoriesPage() {
  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-4">Catégories</h1>
      
      {/* LISTE CATEGORIES VERTICALE AVEC PHOTO A COTE */}
      <div className="flex flex-col gap-3 mb-8">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.id}`}>
            <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border">
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                {cat.image}
              </div>
              <p className="font-semibold">{cat.name}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-3">Produits</h2>

      {/* PRODUITS VIDES */}
      {produits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-gray-50">
          <p className="font-bold">Produit non disponible pour le moment</p>
          <p className="text-sm text-gray-500 mt-1">En attente des publications KING SHOPPING</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {produits.map((p) => (
            <div key={p.id}>{p.name}</div>
          ))}
        </div>
      )}
    </div>
  )
}