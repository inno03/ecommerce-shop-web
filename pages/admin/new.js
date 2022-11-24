import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState } from 'react'

export default function NewProduct() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')

  const { data: session, status } = useSession()

  const loading = status === 'loading'

  if (loading) {
    return null
  }

  if (!session) {
    router.push('/')
    return
  }

  if (!session.user.isAdmin) {
    router.push('/')
    return
  }

  return (
    <div className='text-center'>
      <h1 className='mt-10 font-extrabold text-2xl mb-8'>Add new product</h1>

      <form
        className='mt-10'
        onSubmit={async (e) => {
          e.preventDefault()
          await fetch('/api/product', {
            body: JSON.stringify({
              title,
              description,
              image,
              price,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          router.push(`/admin`)
        }}
      >
        <div className='flex-1 mb-5'>
          <div className='flex-1 mb-2'>Product title (required)</div>
          <input
            onChange={(e) => setTitle(e.target.value)}
            className='border p-1 text-black mb-4'
            required
          />

          <div className='flex-1 mb-2'>Description</div>
          <textarea
            onChange={(e) => setDescription(e.target.value)}
            className='border p-1 text-black '
          />

          <div className='flex-1 mb-2'>Product price in $ (required)</div>
          <input
            pattern='^\d*(\.\d{0,2})?$'
            onChange={(e) => setPrice(e.target.value)}
            className='border p-1 text-black mb-4'
            required
          />

          <div className='flex-1 mb-2'>Product image</div>
          <input
            onChange={(e) => setImage(e.target.value)}
            className='border p-1 text-black mb-4'
          />
        </div>

        <button
          disabled={title && price ? false : true}
          className={`border px-8 py-2 mt-10 font-bold  ${
            title && price
              ? 'bg-black text-white'
              : 'cursor-not-allowed text-gray-500 border-gray-500'
          }`}
        >
          Add product
        </button>
      </form>
    </div>
  )
}