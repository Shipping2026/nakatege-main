"use client"
import { useState } from "react"

export default function Admin(){
  const [name,setName]=useState(""); const [price,setPrice]=useState(""); const [img,setImg]=useState("")

  const poster = async()=>{
    await fetch("/api/produits", {
      method:"POST",
      body: JSON.stringify({name, price, img, desc:"Produit KING SHIPPING", fournisseur:"KING SHIPPING - Verified"}),
      headers:{"Content-Type":"application/json"}
    })
    alert("✅ Produit posté ! Tous les clients vont le voir maintenant, comme WhatsApp Status")
    setName(""); setPrice(""); setImg("")
  }

  return(
    <div style={{padding:20}}>
      <h3>Poster pour TOUS les clients</h3>
      <input placeholder="Nom produit" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%", padding:12, marginTop:10}}/>
      <input placeholder="Prix" value={price} onChange={e=>setPrice(e.target.value)} style={{width:"100%", padding:12, marginTop:10}}/>
      <input placeholder="Lien image" value={img} onChange={e=>setImg(e.target.value)} style={{width:"100%", padding:12, marginTop:10}}/>
      <button onClick={poster} style={{width:"100%", marginTop:15, background:"black", color:"white", padding:14, borderRadius:10}}>Publier pour tous les clients 🌍</button>
    </div>
  )
}