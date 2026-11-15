"use client"
import { useState } from "react"

const CATEGORIES = [
  { name: "Pour vous", icon: "⭐" },
  { name: "En vedette", icon: "✨" },
  { name: "Offres spéciales", icon: "🏷️" },
  { name: "Vêtements & Accessoires", icon: "👕" },
  { name: "Maison & Jardin", icon: "🌿" },
  { name: "Électronique", icon: "📱" },
  { name: "Beauté & Santé", icon: "💄" },
  { name: "Sports & Loisirs", icon: "🏋️" },
  { name: "Parents, Enfants & Jouets", icon: "🧸" },
  { name: "Hygiène perso", icon: "🧴" },
  { name: "Électronique grand public", icon: "🔌" },
  { name: "Vêtements de sport", icon: "👟" },
  { name: "Produits de beauté", icon: "💅" },
  { name: "Bijoux, Lunettes & Montres", icon: "⌚" },
  { name: "Chaussures & Accessoires", icon: "👞" },
  { name: "Bagages, Sacs", icon: "👜" },
  { name: "Cadeaux, Artisanat", icon: "🎁" },
  { name: "Fournitures bureau", icon: "📎" },
  { name: "Médical & Santé", icon: "🩺" },
  { name: "Équipements Industriels", icon: "🏭" },
  { name: "Outils & Quincaillerie", icon: "🔧" },
  { name: "Construction", icon: "🏗️" },
  { name: "Lumières & Éclairage", icon: "💡" },
  { name: "Meubles", icon: "🛋️" },
  { name: "Outils auto", icon: "🚗" },
  { name: "Énergies renouvelables", icon: "☀️" },
  { name: "Équipements Électriques", icon: "⚡" },
  { name: "Sécurité & Protection", icon: "🛡️" },
  { name: "Sûreté & Maintenon", icon: "🧰" },
  { name: "Instruments de test", icon: "🧪" },
  { name: "Transmission d'énergie", icon: "🔋" },
  { name: "Composants électroniques", icon: "💻" },
  { name: "Véhicules & Transport", icon: "🚚" },
  { name: "Agriculture", icon: "🌾" },
  { name: "Aliments & Boissons", icon: "🍔" },
  { name: "Services", icon: "⚙️" },
]

const RECOMS: any = {
  "Électronique": [{n:"Téléphones",i:"📱"},{n:"Ordinateurs",i:"💻"},{n:"Mode",i:"👕"},{n:"Maison",i:"🏠"},{n:"Beauté",i:"💄"},{n:"Sport",i:"🏋️"}],
  "default": [{n:"Téléphones",i:"📱"},{n:"Ordinateurs",i:"💻"},{n:"Mode",i:"👕"},{n:"Maison",i:"🏠"},{n:"Beauté",i:"💄"},{n:"Sport",i:"🏋️"}],
}

export default function Page(){
  const [active,setActive]=useState(2)
  const [search,setSearch]=useState("")
  const activeCat = CATEGORIES[active].name
  const sousCats = RECOMS[activeCat] || RECOMS["default"]

  const filtered = CATEGORIES.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()))

  return(
    <div className="flex flex-col h-screen bg-white">
      {/* HEADER KING SHOPPING + SEARCH + PANIER */}
      <div className="h-[60px] border-b flex items-center px-3 justify-between bg-white">
        <h1 className="font-black text-[20px]">KING <span className="text-orange-500">SHOPPING</span></h1>
        <div className="flex items-center gap-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher" className="w-28 border rounded-full px-3 py-1 text-xs outline-none"/>
          <span className="text-xl">🔍</span>
          <span className="text-xl relative">🛒<span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] px-1 rounded-full">0</span></span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* GAUCHE 36 CATEGORIES */}
        <div className="w-[130px] bg-[#f7f8fa] overflow-y-auto">
          {filtered.map((c,i)=>{
            const realIndex = CATEGORIES.findIndex(x=>x.name===c.name)
            return(
              <button key={i} onClick={()=>setActive(realIndex)}
                className={`w-full text-left flex items-center gap-2 px-3 py-[9px] text-[11px] ${realIndex===active?"bg-orange-500 text-white font-bold rounded-r-full":"text-black"}`}>
                <span>{c.icon}</span>{c.name}
              </button>
            )
          })}
        </div>

        {/* DROITE */}
        <div className="flex-1 overflow-y-auto p-3 bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[15px]">Recommandations</h2>
            <span className="text-orange-500 text-xs">Voir tout &gt;</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {sousCats.map((s:any,j:number)=>(
              <div key={j} className="flex flex-col items-center cursor-pointer">
                <div className="w-[60px] h-[60px] rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl">{s.i}</div>
                <p className="text-[10px] mt-1 text-center">{s.n}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-[15px]">Produits en promotion</h2>
            <span className="w-6 h-6 bg-orange-500 rounded-full text-white flex items-center justify-center text-xs">▼</span>
          </div>

          {/* VIDE COMME TU VEUX */}
          <div className="border-2 border-dashed rounded-xl py-16 text-center">
            <p className="font-bold text-sm">Aucun produit en promotion</p>
            <p className="text-[11px] text-gray-500 mt-1">Catégorie: {activeCat}</p>
            <p className="text-[11px] text-gray-400">Tu n'as encore rien publié KING</p>
          </div>
        </div>
      </div>
    </div>
  )
}