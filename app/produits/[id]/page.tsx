"use client"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function Home(){
  const [produits, setProduits] = useState<any[]>([])

  useEffect(()=>{
    fetch("/api/produits")
      .then(r=>r.json())
      .then(data=>setProduits(data))
  },[])

  if(produits.length===0){
    return <div style={{minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}><p style={{fontSize:40}}>📦</p><b>Produit non disponible pour le moment</b><p style={{fontSize:12}}>En attente des publications KING SHIPPING</p></div>
  }

  return <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, padding:10}}>{produits.map(p=><Link key={p.id} href={`/produits/${p.id}`} style={{background:"white", padding:6, borderRadius:8, textDecoration:"none", color:"black"}}><img src={p.img} style={{width:"100%", height:80, objectFit:"cover"}}/><p style={{fontSize:11}}>{p.name}</p><p style={{fontSize:12, fontWeight:900}}>{p.price}</p></Link>)}</div>
}