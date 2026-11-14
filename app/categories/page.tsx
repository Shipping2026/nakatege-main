"use client"

export default function CategoriesPage() {
  const categories = [
    "Pour vous",
    "En vedette",
    "Offres spéciales",
    "Vêtements & Accessoires",
    "Maison & Jardin",
    "Sports & Loisirs",
    "Parents, Enfants & Jouets",
    "Hygiène perso & Ménage",
    "Électronique grand public",
    "Vêtements de sport & Plein air",
    "Produits de beauté",
    "Bijoux, Lunettes & Montres",
    "Chaussures & Accessoires",
    "Bagages, Sacs & Chaussures",
    "Cadeaux, Artisanat",
    "Fournitures de bureau & Emballage",
    "Médical & Santé",
    "Équipements & Machines Industriels",
    "Outils & Quincaillerie",
    "Construction & Immobilier",
    "Lumières & Éclairage",
    "Meubles",
    "Outils auto",
    "Énergies renouvelables",
    "Équipements Électriques",
    "Sécurité & Protection",
    "Sûreté & Maintenon",
    "Instruments & Équipement de test",
    "Transmission d'énergie",
    "Composants électroniques",
    "Véhicules & Transport",
    "Agriculture",
    "Aliments & Boissons",
    "Matières premières",
    "Services de fabrication",
    "Services",
  ]

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* GAUCHE - 36 CATEGORIES VERTICAL COMME VIDEO */}
      <div className="w-[115px] bg-white border-r overflow-y-auto">
        {categories.map((cat, i) => (
          <div
            key={i}
            className={`text-[11px] py-3 px-2 border-b leading-tight ${
              i === 0 ? "bg-orange-50 text-orange-600 font-bold border-l-2 border-orange-500" : "text-gray-700"
            }`}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* DROITE - VIDE */}
      <div className="flex-1 p-3">
        <h2 className="font-bold text-sm mb-3">Recommandations</h2>
        <div className="bg-white rounded-lg border p-10 text-center mb-6">
          <p className="font-bold text-sm">Aucune recommandation pour le moment</p>
          <p className="text-[11px] text-gray-500 mt-1">En attente des publications KING SHOPPING</p>
        </div>

        <h2 className="font-bold text-sm mb-3">Produits sélectionnés</h2>
        <div className="bg-white rounded-lg border p-16 text-center">
          <p className="font-bold text-sm">Produit non disponible pour le moment</p>
          <p className="text-[11px] text-gray-500 mt-1">En attente des publications KING SHOPPING</p>
        </div>
      </div>
    </div>
  )
}