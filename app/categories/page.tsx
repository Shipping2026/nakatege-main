"use client"
import { useState } from "react"

const CATEGORIES = [
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
  "Bagages, Sacs",
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

const RECOMMANDATIONS = [
  { name: "Produit à succès", icon: "🔥", hot: true },
  { name: "Voiture de sport", icon: "🏎️" },
  { name: "Bateau ponton", icon: "🛥️" },
  { name: "La robe du soir", icon: "👗" },
  { name: "Véhicules d'occasion", icon: "🚙" },
  { name: "Pneu", icon: "🛞" },
  { name: "Croiseur terrestre", icon: "🚜" },
  { name: "Entraîneurs", icon: "👟" },
  { name: "Véhicules à énergies", icon: "🔋" },
  { name: "Voiture hybride", icon: "🚐" },
  { name: "Nouvelles voitures", icon: "🚗" },
  { name: "Réservoir", icon: "🛢️" },
  { name: "Fourgon électrique", icon: "🚚" },
]

export default function Page() {
  const [active, setActive] = useState(0)

  return (
    <div className="flex h-screen bg-white flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* GAUCHE COMME VIDEO */}
        <div className="w-[105px] bg-[#f7f8fa] overflow-y-auto border-r">
          {CATEGORIES.map((c, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-full text-left text-[11px] leading-[13px] py-3 px-3 border-l-2 ${
                active === i
                  ? "bg-white border-orange-500 text-black font-bold"
                  : "border-transparent text-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* DROITE COMME VIDEO */}
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          <h2 className="font-bold text-[14px] mb-3">Recommandations</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {RECOMMANDATIONS.map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-[62px] h-[62px] rounded-full bg-[#f5f5f5] flex items-center justify-center text-2xl relative">
                  {item.hot && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] px-1 rounded-full font-bold">HOT</span>
                  )}
                  {item.icon}
                </div>
                <p className="text-[10px] text-center mt-1 leading-[11px] text-gray-700">{item.name}</p>
              </div>
            ))}
          </div>

          {/* PRODUITS SELECTIONNES - VIDE COMME TU VEUX */}
          <h2 className="font-bold text-[14px] mt-6 mb-3">Produits sélectionnés</h2>
          <div className="py-12 text-center border rounded-lg bg-gray-50">
            <p className="font-bold text-sm">Produit non disponible pour le moment</p>
            <p className="text-xs text-gray-400 mt-1">Catégorie: {CATEGORIES[active]}</p>
            <p className="text-[11px] text-gray-400">En attente des publications KING SHOPPING</p>
          </div>
        </div>
      </div>

      {/* NAV EN BAS COMME VIDEO */}
      <div className="h-[56px] border-t flex justify-around items-center bg-white text-[10px] text-gray-500">
        <span>Accueil</span>
        <span className="text-orange-500 font-bold">Catégories</span>
        <span>Messagerie</span>
        <span>Panier</span>
        <span>Moi Alibaba</span>
      </div>
    </div>
  )
}