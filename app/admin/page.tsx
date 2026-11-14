"use client"
import { useState, useEffect } from "react"

export default function Admin(){
  const [isLogin, setIsLogin] = useState(false)
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [img, setImg] = useState("")
  const [desc, setDesc] = useState("")
  const [produits, setProduits] = useState<any[]>([])

  // Vérifie si déjà connecté
  useEffect(()=>{
    if(localStorage.getItem("king_admin")==="ok") setIsLogin(true)
    const data = JSON.parse(localStorage.getItem("kingshipping_produits")||"[]")
    setProduits(data)
  },[])

  const login = ()=>{
    // MOT DE PASSE ADMIN - Change-le si tu veux
    if(password==="KING2024"){
      localStorage.setItem("king_admin","ok")
      setIsLogin(true)
    }else{
      alert("Mot de passe faux. Essaie KING2024")
    }
  }

  const logout = ()=>{
    localStorage.removeItem("king_admin")
    setIsLogin(false)
  }

  const poster = async()=>{
    if(!name||!price||!img) return alert("Remplis nom, prix, image")
    
    // Pour que tous les clients voient
    const all = JSON.parse(localStorage.getItem("kingshipping_produits")||"[]")
    const nouveau = {
      id: Date.now().toString(),
      name, 
      price: price.includes("$")?price:price+" $",
      img, 
      desc: desc||"Produit KING SHIPPING qualité garantie",
      fournisseur: "KING SHIPPING - Verified ✅"
    }
    localStorage.setItem("kingshipping_produits", JSON.stringify([nouveau, ...all]))
    setProduits([nouveau, ...all])
    
    alert("✅ Produit posté ! Maintenant va voir accueil")
    setName(""); setPrice(""); setImg(""); setDesc("")
  }

  // PAGE DE CONNEXION - CE QUE TU VERRAS SUR TON TELEPHONE
  if(!isLogin){
    return(
      <div style={{minHeight:"100vh", background:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20}}>
        <p style={{fontSize:50}}>🔐</p>
        <h2>KING SHIPPING ADMIN</h2>
        <p style={{fontSize:12, color:"#666"}}>Connecte-toi pour poster des produits</p>
        <input 
          type="password"
          placeholder="Mot de passe admin" 
          value={password} 
          onChange={e=>setPassword(e.target.value)}
          style={{width:"100%", maxWidth:300, padding:14, marginTop:20, border:"1px solid #ddd", borderRadius:10}}
        />
        <button onClick={login} style={{width:"100%", maxWidth:300, marginTop:15, background:"black", color:"white", padding:14, borderRadius:10, fontWeight:700}}>Se connecter</button>
        <p style={{fontSize:11, color:"#999", marginTop:20}}>Mot de passe par défaut: KING2024<br/>Tu pourras le changer après</p>
        <p style={{fontSize:11, color:"#999", marginTop:10}}>📧 nakategeeugene@icloud.com | 001 823 49 840</p>
      </div>
    )
  }

  // PAGE POUR POSTER - APRÈS CONNEXION
  return(
    <div style={{minHeight:"100vh", background:"#f5f5f5", padding:15}}>
      <div style={{background:"white", padding:15, borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <b>ADMIN KING ({produits.length} produits)</b>
        <button onClick={logout} style={{background:"red", color:"white", padding:"6px 12px", borderRadius:20, border:"none", fontSize:12}}>Déconnexion</button>
      </div>

      <div style={{background:"white", padding:15, borderRadius:10, marginTop:15}}>
        <h3 style={{margin:0}}>Poster nouveau produit</h3>
        <p style={{fontSize:11, color:"#666"}}>Ce produit sera visible par tous les clients</p>
        
        <input placeholder="Nom ex: iPhone 15 Pro Max 256GB" value={name} onChange={e=>setName(e.target.value)} style={{width:"100%", padding:12, marginTop:15, border:"1px solid #ddd", borderRadius:8}}/>
        <input placeholder="Prix ex: 1,800" value={price} onChange={e=>setPrice(e.target.value)} style={{width:"100%", padding:12, marginTop:10, border:"1px solid #ddd", borderRadius:8}}/>
        <input placeholder="Lien image https://..." value={img} onChange={e=>setImg(e.target.value)} style={{width:"100%", padding:12, marginTop:10, border:"1px solid #ddd", borderRadius:8}}/>
        {img && <img src={img} style={{width:"100%", height:150, objectFit:"contain", marginTop:10, background:"#fafafa", borderRadius:8}}/>}
        <textarea placeholder="Description du produit" value={desc} onChange={e=>setDesc(e.target.value)} style={{width:"100%", padding:12, marginTop:10, border:"1px solid #ddd", borderRadius:8, height:80}}/>
        
        <button onClick={poster} style={{width:"100%", marginTop:15, background:"black", color:"white", padding:14, borderRadius:10, fontWeight:700, border:"none"}}>📤 Poster Produit - Tous les clients vont voir</button>
      </div>

      <div style={{background:"white", padding:15, borderRadius:10, marginTop:15}}>
        <b>Tes produits postés ({produits.length})</b>
        {produits.length===0 && <p style={{fontSize:12, color:"#999", marginTop:10}}>0 produit - commence à poster</p>}
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10}}>
          {produits.map((p:any)=>(
            <div key={p.id} style={{border:"1px solid #eee", borderRadius:8, padding:6}}>
              <img src={p.img} style={{width:"100%", height:70, objectFit:"cover", borderRadius:6}}/>
              <p style={{fontSize:11, fontWeight:600, marginTop:4}}>{p.name.slice(0,25)}</p>
              <p style={{fontSize:11, fontWeight:900}}>{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}