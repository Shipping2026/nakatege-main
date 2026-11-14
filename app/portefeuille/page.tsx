"use client"
import { MY_ACCOUNTS } from "../../lib/my-accounts"

export default function Portefeuille() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payer votre commande</h1>

      <div className="space-y-4">
        <div className="border p-4 rounded-lg">
          <h2 className="font-bold">🇨🇩 M-Pesa</h2>
          <p className="text-lg mt-2">{MY_ACCOUNTS.mpesa.number}</p>
          <p className="text-sm text-gray-600">{MY_ACCOUNTS.mpesa.name}</p>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="font-bold">🇨🇩 Airtel Money</h2>
          <p className="text-lg mt-2">{MY_ACCOUNTS.airtel.number}</p>
          <p className="text-sm text-gray-600">{MY_ACCOUNTS.airtel.name}</p>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="font-bold">Orange Money</h2>
          <p className="text-sm">{MY_ACCOUNTS.orange.number}</p>
        </div>

        <div className="border p-4 rounded-lg">
          <h2 className="font-bold">PayPal</h2>
          <p className="text-sm">{MY_ACCOUNTS.paypal.email}</p>
        </div>
      </div>
    </div>
  )
}