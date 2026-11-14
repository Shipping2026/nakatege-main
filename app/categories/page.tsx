"use client"
import { useState } from "react"

const CATEGORIES = [
  "Pour vous","En vedette","Offres spéciales","Vêtements & Accessoires",
  "Maison & Jardin","Sports & Loisirs","Parents, Enfants & Jouets",
  "Hygiène perso & Ménage","Électronique grand public",
  "Vêtements de sport & Plein air","Produits de beauté",
  "Bijoux, Lunettes & Montres","Chaussures & Accessoires",
  "Bagages, Sacs","Cadeaux, Artisanat","Fournitures de bureau & Emballage",
  "Médical & Santé","Équipements & Machines Industriels","Outils & Quincaillerie",
  "Construction & Immobilier","Lumières & Éclairage","Meubles","Outils auto",
  "Énergies renouvelables","Équipements Électriques","Sécurité & Protection",
  "Sûreté & Maintenon","Instruments & Équipement de test","Transmission d'énergie",
  "Composants électroniques","Véhicules & Transport","Agriculture",
  "Aliments & Boissons","Matières premières","Services de fabrication","Services",
]

export default function Page() {
  const [active, setActive] = useState(0)
  return (
    <div className="flex h-screen bg-white flex-col">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[105px] bg-[#f7f8fa] overflow-y-auto border-r">
          {CATEGORIES.map((c,i)=>(
            <button key={i} onClick={()=>setActive(i)}
              className={`w-full text-left text-[11px] py-3 px-3 border-l-2 ${active===i?"bg-white border-orange-500 font-bold text-black":"border-transparent text-gray-600"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <h2 className="font-bold text-sm mb-4">Recommandations</h2>
          <div className="py-10 text-center border rounded-lg bg-gray-50 mb-6">
            <p className="font-bold text-sm">Aucune recommandation</p>
            <p className="text-[11px] text-gray-500">Vide - En attente KING SHOPPING</p>
          </div>
          <h2 className="font-bold text-sm mb-4">Produits sélectionnés</h2>
          <div className="py-16 text-center border rounded-lg bg-gray-50">
            <p className="font-bold">Produit non disponible pour le moment</p>
            <p className="text-xs text-gray-500 mt-2">{CATEGORIES[active]}</p>
            <p className="text-[11px] text-gray-400">KING SHOPPING</p>
          </div>
        </div>
      </div>
    </div>
  )
}