import Head from 'next/head'
import prisma from 'lib/prisma'
import { getProducts } from 'lib/data.js'
import Image from 'next/image'
import { useState } from 'react'
import * as localForage from 'localforage'
import Script from 'next/script'



export default function Home({ products }) {
  const [cart, setCart] = useState([])
  return (
    <div>
       <Script src='https://js.stripe.com/v3/' />

      <Head>
        <title>Shop</title>
        <meta name='description' content='Shop' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='text-center '>
        <h1 className='mt-10 font-extrabold text-2xl'>Shop</h1>
        {cart.length > 0 && (
          <div className='mt-20 sm:mx-auto max-w-4xl mx-10 border-2 border-black'>
            <h3 className='py-2 font-extrabold text-2xl text-center'>
              Your cart
            </h3>
            {cart.map((item, index) => (
              <div key={index} className='px-4 py-2 border-y border-black flex'>
                <div className='block mt-2'>
                  <Image
                    src={`/` + item.product.image}
                    width={'50'}
                    height={'50'}
                    className=''
                  />
                </div>
                <div className='mt-5 pl-4'>
                  <span className='font-bold'>{item.product.title}</span> -
                  quantity: {item.quantity}
                </div>
              </div>
            ))}
            <button
              className='mx-auto bg-black text-white px-3 py-1 my-4 text-xl font-bold justify-center flex'
              onClick={async () => {
                const res = await fetch('/api/stripe/session', {
                  body: JSON.stringify({
                    cart,
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                })

                const data = await res.json()

                if (data.status === 'error') {
                  alert(data.message)
                  return
                }

                const sessionId = data.sessionId
                const stripePublicKey = data.stripePublicKey

                const stripe = Stripe(stripePublicKey)
                const { error } = await stripe.redirectToCheckout({
                  sessionId,
                })

                setCart([])
              }}
            >
              Go to checkout
            </button>
            <button
              className='mx-auto bg-black text-white px-3 py-1 my-4 text-sm justify-center flex'
              onClick={() => setCart([])}
            >
              Clear cart
            </button>
          </div>
        )}
        {cart.length > 0 && (
          <div>
            {cart.map((item, index) => (
              <div key={index}>{item.product.title}</div>
            ))}
          </div>
        )}

        <div className='mt-20 mx-auto max-w-sm'>
          {products.map((product) => (
            <div className='mb-4 border border-black' key={product.id}>
              {product.title} (${product.price / 100})
               <button
                  className='mb-4 mx-auto bg-black text-white px-3 py-1 text-lg'
                  onClick={() => {
                    const itemsInCartWithThisId = cart.filter((item) => {
                      return item.product.id === product.id
                    })

                    if (itemsInCartWithThisId.length > 0) {
                      setCart([
                        ...cart.filter((item) => {
                          return item.product.id !== product.id
                        }),
                        {
                          product: itemsInCartWithThisId[0].product,
                          quantity: itemsInCartWithThisId[0].quantity + 1,
                        },
                      ])
                    } else {
                      setCart([...cart, { product, quantity: 1 }])
                    }
                  }}
                >
                  Add to cart
                </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  const products = await getProducts(prisma)

  return {
    props: {
      products,
    },
  }
}