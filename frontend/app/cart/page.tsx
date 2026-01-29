'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { removeItem, updateQuantity } from '@/redux/features/cart/cartSlice';

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white">
      <nav className="bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">
                BS
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Your Cart
              </h1>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-8">
          {items.length === 0 ? (
            <div className="text-center text-slate-600">
              Your cart is empty.
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 border border-blue-100 rounded-xl p-4"
                >
                  <div className="w-24 h-32 bg-slate-100 rounded-lg overflow-hidden">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        dispatch(
                          updateQuantity({
                            id: item.id,
                            quantity: Number(e.target.value),
                          })
                        )
                      }
                      className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => dispatch(removeItem(item.id))}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-blue-100 pt-4">
                <p className="text-lg font-semibold text-slate-900">
                  Total: ${total.toFixed(2)}
                </p>
                <Link
                  href="/checkout"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
