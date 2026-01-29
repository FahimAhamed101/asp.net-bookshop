'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetBookByIdQuery } from '@/redux/features/catalog/catalogApi';
import { useDispatch } from 'react-redux';
import { addItem } from '@/redux/features/cart/cartSlice';

export default function BookDetailPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const id = Number(params?.id);
  const { data: book, isLoading, error } = useGetBookByIdQuery(id, {
    skip: Number.isNaN(id),
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5030';
  const imageUrl = useMemo(() => {
    if (!book?.image) return '';
    return book.image.startsWith('http') ? book.image : `${baseUrl}${book.image}`;
  }, [book, baseUrl]);

  if (Number.isNaN(id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Invalid book id.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading book...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Book not found.</p>
      </div>
    );
  }

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
                Book Details
              </h1>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 bg-white rounded-2xl border border-blue-100 shadow-sm p-8">
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] w-full bg-slate-100 rounded-xl overflow-hidden">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">ISBN:</span> {book.isbn}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-900">Category:</span> {book.category}
              </p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <p className="text-sm text-blue-600 font-semibold">{book.category}</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              {book.title}
            </h2>
            <p className="text-lg text-slate-600 mt-2">by {book.author}</p>
            <p className="text-xl font-semibold text-slate-900 mt-3">
              ${book.price.toFixed(2)}
            </p>
            <p className="mt-6 text-slate-700 leading-relaxed">{book.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/bookadd"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
              >
                Manage Books
              </Link>
              <button
                onClick={() =>
                  dispatch(
                    addItem({
                      id: book.id,
                      title: book.title,
                      price: book.price,
                      image: imageUrl || book.image,
                    })
                  )
                }
                className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800"
              >
                Add to cart
              </button>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md border border-blue-200 text-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
