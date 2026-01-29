'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useCreateCheckoutSessionMutation } from '@/redux/features/catalog/catalogApi';

type AddressForm = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialAddress: AddressForm = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

export default function CheckoutPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const [createSession, { isLoading }] = useCreateCheckoutSessionMutation();
  const [address, setAddress] = useState<AddressForm>(initialAddress);
  const [errorMessage, setErrorMessage] = useState('');

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    try {
      const response = await createSession({
        items: items.map((item) => ({ bookId: item.id, quantity: item.quantity })),
        address,
      }).unwrap();

      if (response.url) {
        window.location.href = response.url;
      } else {
        setErrorMessage('Failed to start checkout.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setErrorMessage('Checkout failed. Please try again.');
    }
  };

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
                Checkout
              </h1>
            </div>
            <Link href="/cart" className="text-blue-600 hover:text-blue-500">
              Back to Cart
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Shipping Address
            </h2>
            {errorMessage && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  name="fullName"
                  value={address.fullName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={address.email}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Address Line 1</label>
                <input
                  name="addressLine1"
                  value={address.addressLine1}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Address Line 2</label>
                <input
                  name="addressLine2"
                  value={address.addressLine2}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">City</label>
                <input
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">State</label>
                <input
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Postal Code</label>
                <input
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Country</label>
                <select
                  name="country"
                  value={address.country}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Redirecting...' : 'Pay with Stripe'}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
            {items.length === 0 ? (
              <p className="text-sm text-slate-600">No items in cart.</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-700">
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-blue-100 pt-3 flex justify-between text-base font-semibold text-slate-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
