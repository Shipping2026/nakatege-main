// VRAI PAIEMENT NAKATEGE - Airtel / M-Pesa / PayPal
export async function POST(req: Request) {
  const { amount, phone, method } = await req.json();

  // Vérification de base
  if (!amount || !phone) {
    return Response.json({ error: "Montant ou numéro manquant" }, { status: 400 });
  }

  // ICI ON BRANCHE LES VRAIS API QUAND TU AURAS LES CLÉS
  if (method === "airtel") {
    // Airtel Money va envoyer un POP-UP PIN à la SIM du client
    // Pour l'instant en mode TEST
    console.log(`Demande Airtel: ${phone} doit payer ${amount} vers ton Airtel Business`);
    return Response.json({ 
      success: true, 
      message: `Une demande de paiement de ${amount} a été envoyée au ${phone}. Le client doit taper son PIN sur sa SIM.`,
      status: "PENDING_PIN"
    });
  }

  if (method === "mpesa") {
    console.log(`Demande M-Pesa: ${phone} -> ${amount}`);
    return Response.json({ 
      success: true, 
      message: `M-Pesa: Demande envoyée au ${phone}`,
      status: "PENDING_PIN"
    });
  }

  if (method === "paypal") {
    return Response.json({
      success: true,
      paypal_email: "nakategeeugene@icloud.com",
      message: "Redirection PayPal"
    });
  }

  return Response.json({ error: "Méthode inconnue" }, { status: 400 });
}