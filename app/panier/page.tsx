"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PanierKingShipping(){
  const router = useRouter()
  const [panier,setPanier]=useState<any[]>([])
  const [methode,setMethode]=useState("Airtel Money")
  const [open,setOpen]=useState(false)
  const [stepPin,setStepPin]=useState(false)

  const clean = (v:any)=>{ const n=parseFloat(String(v??0).replace(/[^0-9.]/g,"")); return isNaN(n)?0:n }

  useEffect(()=>{
    const d=JSON.parse(localStorage.getItem("panier")||"[]")
    setPanier(d.map((p:any)=>({...p,_prix:clean(p.prix||p.price),_qty:Number(p.qty||1)})))
  },[])

  const addToCart = (pr:any)=>{
    const prix = clean(pr.prix)
    const nouveau = {id:pr.id, name:pr.nom, prix:prix, price:prix, _prix:prix, _qty:1, qty:1, image:pr.img, img:pr.img}
    const newPanier = [...panier, nouveau]
    setPanier(newPanier)
    localStorage.setItem("panier", JSON.stringify(newPanier))
  }

  const vider = ()=>{ localStorage.removeItem("panier"); setPanier([]) }
  const sous=panier.reduce((s,p)=>s+p._prix*p._qty,0)
  const total=Math.round(sous*1.05)

  const DEST:any={
    "M-Pesa":"018 23 49 840 - KING SHIPPING",
    "Orange Money":"09 64 32 16 59 - KING SHIPPING",
    "Airtel Money":"09 64 32 16 59 - KING SHIPPING - RTL",
    "PayPal":"nakategeeugene@icloud.com - KING SHIPPING",
    "Credit card":"Paiement carte sécurisé"
  }

  const produits = [
    {id:1, nom:"BMW M4 2023 d'occasion - KING", prix:"43 000 $US", img:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400"},
    {id:2, nom:"7.5 Mil Color PPF Film Protection", prix:"504 $US", img:"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400"},
    {id:3, nom:"Tesla Model 3 Offre Spéciale", prix:"2 500 $US", img:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400"},
    {id:4, nom:"Film adhésif voiture PPF", prix:"15-98 $US", img:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400"},
    {id:5, nom:"Lingerie maille - KING SHIPPING", prix:"4,50-6 $US", img:"https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?w=400"},
    {id:6, nom:"Toyota 2022 d'occasion", prix:"5 000-9 000 $US", img:"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400"},
  ]

  return(
    <div style={{background:"#f2f2f5", minHeight:"100vh", paddingBottom:110, fontFamily:"Arial"}}>
      <div style={{background:"white", padding:"12px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:10}}>
        <button onClick={()=>router.back()} style={{width:34,height:34,borderRadius:"50%",border:"1px solid #ddd",background:"white"}}>←</button>
        <b>KING SHIPPING - Panier({panier.length})</b>
        {panier.length>0 && <button onClick={vider} style={{marginLeft:"auto", fontSize:11, background:"#fee2e2", border:"none", padding:"6px 10px", borderRadius:20}}>Vider</button>}
      </div>

      {panier.length===0 ? (
        <div style={{textAlign:"center", padding:"30px 20px", background:"white", marginTop:2}}>
          <div style={{width:90,height:90,margin:"0 auto", background:"#f5f5f5", borderRadius:"50%", display:"grid", placeItems:"center", fontSize:36}}>🛒</div>
          <h3 style={{marginTop:14, fontWeight:800}}>Your cart is empty</h3>
          <p style={{fontSize:12, color:"#666"}}>KING SHIPPING - Add products and they will appear here.<br/>Panier sera vidé après paiement.</p>
          <div style={{marginTop:12, background:"#111", color:"white", padding:"10px 20px", borderRadius:25, display:"inline-block", fontSize:13, fontWeight:700}}>Explore KING SHIPPING</div>
        </div>
      ) : (
        <div style={{padding:12}}>
          {panier.map((p:any)=>(
            <div key={p.id+Math.random()} style={{background:"white", borderRadius:12, padding:10, display:"flex", gap:10, marginBottom:8}}>
              <img src={p.image} style={{width:60,height:60,borderRadius:8,objectFit:"cover"}}/>
              <div style={{flex:1}}><p style={{fontSize:12,margin:0,fontWeight:700}}>{p.name}</p><p style={{fontSize:11,margin:0}}>Subtotal: ${p._prix*p._qty}</p></div>
              <button onClick={()=>{const f=panier.filter((_,i)=>panier.indexOf(p)!==i); const nf=panier.slice(0,-1); setPanier(nf); localStorage.setItem("panier",JSON.stringify(nf))}} style={{border:"none",background:"#eee",width:24,height:24,borderRadius:"50%"}}>✕</button>
            </div>
          ))}
          <div style={{background:"white", borderRadius:12, padding:10, fontSize:12}}><b>TOTAL KING SHIPPING: ${total}</b></div>
        </div>
      )}

      {/* LES PRODUITS QUI ETAIENT EN BAS - COMME TU AS DEMANDÉ */}
      <div style={{background:"white", marginTop:8, padding:12}}>
        <b style={{fontSize:14}}>Recommandés pour vous - KING SHIPPING</b>
        <p style={{fontSize:11, color:"#888", margin:"4px 0 0 0"}}>Clique pour ajouter au panier</p>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10}}>
          {produits.map(pr=>(
            <div key={pr.id} onClick={()=>addToCart(pr)} style={{border:"1px solid #eee", borderRadius:12, overflow:"hidden", cursor:"pointer", background:"white"}}>
              <img src={pr.img} style={{width:"100%", height:110, objectFit:"cover"}}/>
              <div style={{padding:8}}>
                <p style={{fontSize:11, margin:0, height:32, overflow:"hidden", fontWeight:600}}>{pr.nom}</p>
                <p style={{fontSize:12, fontWeight:800, margin:"4px 0 0 0"}}>{pr.prix}</p>
                <p style={{fontSize:9, color:"#888", margin:0}}>KING SHIPPING • Verified</p>
                <div style={{marginTop:6, background:"#ff6a00", color:"white", textAlign:"center", padding:"4px", borderRadius:8, fontSize:11, fontWeight:700}}>+ Ajouter</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{position:"fixed", bottom:52, left:0, right:0, background:"white", borderTop:"1px solid #ddd", padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <span style={{fontSize:12}}><input type="checkbox"/> Tous</span>
        <div style={{display:"flex", gap:10, alignItems:"center"}}><b>{panier.length?`$${total}`:"0 $US"}</b><button disabled={panier.length===0} onClick={()=>setOpen(true)} style={{background:panier.length===0?"#ccc":"#ff6a00", color:"white", border:"none", borderRadius:20, padding:"8px 20px", fontWeight:700}}>Payer</button></div>
      </div>

      {open&&(
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:99, display:"flex", alignItems:"flex-end"}}>
          <div style={{background:"white", width:"100%", borderRadius:"16px 16px 0 0", padding:16}}>
            <b>KING SHIPPING - ${total}</b>
            <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:10}}>
              {Object.keys(DEST).map(m=>(
                <button key={m} onClick={()=>setMethode(m)} style={{padding:"6px 12px", borderRadius:20, border:"1px solid #ddd", background:methode===m?"black":"white", color:methode===m?"white":"black", fontSize:12}}>{m}</button>
              ))}
            </div>
            <div style={{background:methode==="PayPal"?"#e6f0ff":"#fff7cc", padding:10, borderRadius:10, marginTop:10, border:"1px solid #111"}}><b>Destinataire:</b><br/><span style={{fontWeight:800}}>{DEST[methode]}</span></div>
            {!stepPin ? (
              <button onClick={()=>setStepPin(true)} style={{width:"100%", background:"black", color:"white", padding:12, borderRadius:10, marginTop:12, border:"none"}}>Continuer</button>
            ) : (
              <div style={{textAlign:"center", marginTop:12}}>
                <input type="password" placeholder="PIN ****" style={{padding:10, width:"60%", borderRadius:8, border:"1px solid #ddd", textAlign:"center", letterSpacing:6}}/>
                <button onClick={()=>{alert(`✅ ${total}$ envoyé à ${DEST[methode]}`); localStorage.removeItem("panier"); setPanier([]); setOpen(false); setStepPin(false); router.push("/message")}} style={{width:"100%", background:"green", color:"white", padding:12, borderRadius:10, marginTop:10, border:"none", fontWeight:700}}>Valider & Vider Panier</button>
              </div>
            )}
            <button onClick={()=>setOpen(false)} style={{width:"100%", background:"#eee", padding:10, borderRadius:10, marginTop:8, border:"none"}}>Fermer</button>
          </div>
        </div>
      )}

      <div style={{position:"fixed", bottom:0, left:0, right:0, background:"white", borderTop:"1px solid #eee", display:"flex", justifyContent:"space-around", padding:"6px 0", fontSize:10}}>
        <Link href="/" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>⌂<br/>Accueil</Link>
        <Link href="/categories" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>⊞<br/>Catégories</Link>
        <Link href="/message" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>💬<br/>Messagerie</Link>
        <Link href="/panier" style={{textAlign:"center", textDecoration:"none", color:"#ff6a00", fontWeight:700}}>🛒<br/>Panier</Link>
        <Link href="/compte" style={{textAlign:"center", textDecoration:"none", color:"#111"}}>👤<br/>Moi KING</Link>
      </div>
    </div>
  )
}