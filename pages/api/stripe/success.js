import prisma from 'lib/prisma'
import nodemailer from 'nodemailer'

export default async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end() //Method Not Allowed
    return
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  const stripe_session = await stripe.checkout.sessions.retrieve(
    req.body.session_id
  )

  await prisma.order.create({
    data: {
      customer: stripe_session.customer_details,
      products: stripe_session.display_items,
      payment_intent: stripe_session.payment_intent,
      amount: parseInt(stripe_session.amount_total),
    },
  })

  const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER)

  let bodyToOwner = `
      <p>New order</p>
      <p>Total paid $${stripe_session.amount_total / 100}</p>
      <p>Customer: ${stripe_session.customer_details.name}</p>
      <p>Email: ${stripe_session.customer_details.email}</p>
      <p>Address: ${stripe_session.customer_details.address.line1} ${
    stripe_session.customer_details.address.city
  } ${stripe_session.customer_details.address.country}</p>
      <p>Products:</p>
      `

  stripe_session.display_items.map((item) => {
    bodyToOwner += `<p>${item.quantity} ${item.custom.name}</p>`
  })

  let bodyToCustomer = `
      <p>Thanks for your order!</p>
     
      <p>Products bought:</p>
      `

  stripe_session.display_items.map((item) => {
    bodyToCustomer += `<p>${item.quantity} ${item.custom.name}</p>`
  })

  bodyToCustomer += `<p>We'll ship those as soon as possible</p>`

  transporter.sendMail(
    {
      to: process.env.EMAIL_FROM,
      from: process.env.EMAIL_FROM,
      subject: 'New order!',
      html: bodyToOwner,
    },
    (err, info) => {
      if (err) {
        console.log(err)
      }
    }
  )

  transporter.sendMail(
    {
      to: stripe_session.customer_details.email,
      from: process.env.EMAIL_FROM,
      subject: 'Thanks for your order!',
      html: bodyToCustomer,
    },
    (err, info) => {
      if (err) {
        console.log(err)
      }
    }
  )

  res.end()
}