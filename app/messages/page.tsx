"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function MessagerieKingShipping(){
  const router=useRouter()
  const [tab,setTab]=useState("messagerie")
  const [search,setSearch]=useState("")
  const [notifs,setNotifs]=useState<any[]>([])
  const [commandes,setCommandes]=useState<any[]>([])
  const [produits,setProduits]=useState<any[]>([])

  useEffect(()=>{
    setNotifs(JSON.parse(localStorage.getItem("kingshipping_notifs")||"[]"))
    setCommandes(JSON.parse(localStorage.getItem("kingshipping_commandes")||"[]"))
    setProduits(JSON.parse(localStorage.getItem("kingshipping_produits")||"[]"))
  },[])

  const filteredProduits = produits.filter(p=> p.nom.toLowerCase().includes(search.toLowerCase()) || p.prix.toLowerCase().includes(search.toLowerCase()))
  const displayProduits = search ? filteredProduits : [
    {nom:"BMW M4 2023", prix:"43 000 $US", img:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400"},
    {nom:"Tesla Model 3", prix:"2 500 $US", img:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400"},
  ]

  const envoyerWhatsApp=()=>{
    const num="243964321659" // 09 64 32 16 59 format international
    const text=`Bonjour KING SHIPPING, je veux commander`
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(text)}`, "_blank")
  }
  const envoyerEmail=()=>{
    window.location.href=`mailto:nakategeeugene@icloud.com?subject=Commande KING SHIPPING&body=Bonjour KING SHIPPING, je veux commander`
  }

  return(
    <div style={{background:"#f5f5f5", minHeight:"100vh", paddingBottom:70, fontFamily:"Arial"}}>
      <div style={{background:"white", padding:"10px 12px", position:"sticky", top:0, zIndex:10}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div style={{display:"flex", alignItems:"center", gap:8}}>
            <button onClick={()=>router.back()} style={{border:"none", background:"#f2f2f2", width:30,height:30, borderRadius:"50%"}}>←</button>
            <b>Messagerie KING SHIPPING</b>
          </div>
          <button onClick={()=>alert("Paramètres KING SHIPPING - bientôt")} style={{border:"none", background:"none"}}>⚙️</button>
        </div>
        <div style={{display:"flex", gap:20, marginTop:12}}>
          <button onClick={()=>setTab("commandes")} style={{border:"none", background:"none", borderBottom:tab==="commandes"?"2px solid #ff6a00":"none", fontWeight:tab==="commandes"?700:400, fontSize:13, padding:"6px 0"}}>Commandes ({commandes.length})</button>
          <button onClick={()=>setTab("notification")} style={{border:"none", background:"none", borderBottom:tab==="notification"?"2px solid #ff6a00":"none", fontWeight:tab==="notification"?700:400, fontSize:13, padding:"6px 0"}}>Notification {notifs.length>0 && <span style={{background:"red", color:"white", fontSize:9, padding:"2px 5px", borderRadius:10}}>{notifs.length}</span>}</button>
          <button onClick={()=>setTab("autres")} style={{border:"none", background:"none", borderBottom:tab==="autres"?"2px solid #ff6a00":"none", fontWeight:tab==="autres"?700:400, fontSize:13}}>Autres</button>
        </div>
        {/* BARRE RECHERCHE QUI MARCHE */}
        <div style={{marginTop:10, background:"#f2f2f2", borderRadius:20, padding:"8px 12px", display:"flex", gap:8}}>
          <span>🔍</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Recherchez des messages ou fournisseurs KING SHIPPING" style={{border:"none", background:"transparent", flex:1, outline:"none", fontSize:12}}/>
        </div>
      </div>

      {tab==="commandes" && (
        <div style={{background:"white", marginTop:2, padding:20, textAlign:"center"}}>
          {commandes.length===0 ? (
            <><div style={{fontSize:30}}>📦</div><p>Aucune commande - KING SHIPPING</p><p style={{fontSize:11, color:"#888"}}>Quand tu passes commande, elle s'affiche ici</p></>
          ) : commandes.map((c:any,i:number)=>(
            <div key={i} style={{border:"1px solid #eee", padding:10, borderRadius:10, marginBottom:8, textAlign:"left", fontSize:12}}>
              <b>{c.produit}</b> - {c.total} - {c.date}<br/>Envoyé à: {c.dest}
            </div>
          ))}
        </div>
      )}

      {tab==="notification" && (
        <div style={{background:"white", marginTop:2}}>
          {notifs.length===0 ? (
            <div style={{padding:40, textAlign:"center"}}><div style={{fontSize:30}}>🔔</div><p style={{fontSize:13}}>Notifications vides</p><p style={{fontSize:11, color:"#888"}}>Tu n'as pas encore posté de produits. Va dans /admin pour poster. Quand tu postes, ça apparaît ici pour tous les clients.</p></div>
          ) : notifs.map((n:any,i:number)=>(
            <div key={i} style={{display:"flex", gap:10, padding:12, borderBottom:"1px solid #eee"}}>
              <img src={n.produit?.img || "https://via.placeholder.com/50"} style={{width:50,height:50,borderRadius:8,objectFit:"cover"}}/>
              <div><p style={{fontSize:12,margin:0,fontWeight:600}}>{n.titre}</p><p style={{fontSize:10,color:"#888"}}>{n.time}</p></div>
            </div>
          ))}
        </div>
      )}

      {tab==="messagerie" && (
        <>
          <div style={{background:"white", marginTop:2, padding:20, textAlign:"center"}}>
            <div style={{fontSize:30}}>💬</div>
            <p style={{fontSize:13}}>Pas encore de messages</p>
            <div style={{background:"#f0f9f0", padding:10, borderRadius:8, fontSize:11, textAlign:"left", marginTop:10}}>
              ✅ KING SHIPPING - Discutez sur kingshipping.com pour protection<br/>
              📱 WhatsApp: <b>0182349840</b><br/>
              📧 Email: <b>nakategeeugene@icloud.com</b><br/>
              💳 PayPal: <b>nakategeeugene@icloud.com</b>
              <div style={{display:"flex", gap:8, marginTop:10}}>
                <button onClick={envoyerWhatsApp} style={{flex:1, background:"#25D366", color:"white", border:"none", padding:8, borderRadius:8, fontWeight:700, fontSize:12}}>WhatsApp KING</button>
                <button onClick={envoyerEmail} style={{flex:1, background:"black", color:"white", border:"none", padding:8, borderRadius:8, fontWeight:700, fontSize:12}}>Email KING</button>
              </div>
            </div>
          </div>
          <div style={{background:"white", marginTop:8, padding:12}}>
            <b style={{fontSize:13}}>Recommandés pour vous</b>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10}}>
              {displayProduits.map((p:any,i:number)=>(
                <div key={i} style={{border:"1px solid #eee", borderRadius:10, overflow:"hidden"}}>
                  <img src={p.img} style={{width:"100%", height:100, objectFit:"cover"}}/>
                  <div style={{padding:6}}><p style={{fontSize:11,margin:0}}>{p.nom||p.name}</p><p style={{fontSize:11,fontWeight:800,margin:0}}>{p.prix}</p></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:"1px solid #eee", display:"flex", justifyContent:"space-around", padding:"6px 0", fontSize:10}}>
        <Link href="/" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>⌂<br/>Accueil</Link>
        <Link href="/categories" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>⊞<br/>Catégories</Link>
        <Link href="/message" style={{textAlign:"center", textDecoration:"none", color:"#ff6a00", fontWeight:700}}>💬<br/>Messagerie</Link>
        <Link href="/panier" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>🛒<br/>Panier</Link>
        <Link href="/compte" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>👤<br/>Moi KING</Link>
      </div>
    </div>
  )
}