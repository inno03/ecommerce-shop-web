export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end() //Method Not Allowed
    return
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const stripe_session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'IT'], //add our country ISO code
    },
    line_items: req.body.cart.map((item) => {
      return {
        name: item.product.title,
        amount: item.product.price,
        currency: 'usd',
        quantity: item.quantity,
      }
    }),
    success_url:
      process.env.BASE_URL + '/thanks?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: process.env.BASE_URL + '/cancelled',
  })

  res.writeHead(200, {
    'Content-Type': 'application/json',
  })

  res.end(
    JSON.stringify({
      status: 'success',
      sessionId: stripe_session.id,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    })
  )
}