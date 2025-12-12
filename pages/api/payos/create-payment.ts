// pages/api/payos/create-payment.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const session = await getServerSession(req, res, {})
  if (!session?.user) return res.status(401).json({ error: 'Chưa đăng nhập' })

  const { amount, plan, isYearly } = req.body
  const orderCode = Number(Date.now().toString().slice(-10)) // PayOS yêu cầu number
  const description = `SeenYT - Gói ${plan.toUpperCase()} ${isYearly ? 'năm' : 'tháng'} - ${session.user.email}`

  const items = [{ name: `Gói ${plan}`, quantity: 1, price: amount }]
  const returnUrl = `${process.env.NEXTAUTH_URL}/success`
  const cancelUrl = `${process.env.NEXTAUTH_URL}/pricing`

  const data = {
    orderCode,
    amount,
    description,
    items,
    returnUrl,
    cancelUrl,
  }

  // Tạo chữ ký (checksum)
  const sortedData = Object.keys(data).sort().map(key => `${key}=${JSON.stringify(data[key as keyof typeof data])}`).join('&')
  const checksum = crypto.createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY!).update(sortedData).digest('hex')

  try {
    const response = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
      method: 'POST',
      headers: {
        'x-client-id': process.env.PAYOS_CLIENT_ID!,
        'x-api-key': process.env.PAYOS_API_KEY!,
      },
      body: JSON.stringify({ ...data, signature: checksum }),
    })

    const result = await response.json()
    if (result.error !== 0) throw new Error(result.message)

    // Lưu tạm order vào DB (tùy chọn, để sau webhook check)
    res.status(200).json({
      checkoutUrl: result.data.checkoutUrl,
      qrCode: result.data.qrCode,
      orderCode: result.data.orderCode,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}