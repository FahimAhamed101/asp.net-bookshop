'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLogoutMutation } from '@/redux/features/auth/authApi';
import { useGetBooksQuery, useGetCategoriesQuery } from '@/redux/features/catalog/catalogApi';
import { addItem } from '@/redux/features/cart/cartSlice';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const [logout, { isLoading }] = useLogoutMutation();
  const {
    data: books = [],
    isLoading: isBooksLoading,
    error: booksError,
  } = useGetBooksQuery();
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery();
  const userRole = user?.role;
  const isAdmin = Array.isArray(userRole) ? userRole.includes('Admin') : userRole === 'Admin';
  const roleLabel = Array.isArray(userRole) ? userRole.join(', ') : userRole || 'User';
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5030';

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">
                BS
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Bookshop</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/cart"
                className="relative inline-flex items-center justify-center h-9 w-9 rounded-full border border-blue-100 text-blue-700 hover:bg-blue-50"
                aria-label="View cart"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-blue-600 px-1 text-xs font-semibold text-white flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <span className="text-slate-700">Welcome, {user?.name || 'User'}!</span>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-2xl border border-blue-100 bg-white shadow-sm p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900">Bookshop Dashboard</h2>
                <p className="text-slate-600">Discover your library, manage categories, and explore new reads.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/books"
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700"
                >
                  Browse Ebooks
                </Link>
                <Link
                  href="/categories"
                  className="inline-flex items-center justify-center rounded-md border border-blue-200 text-blue-700 px-4 py-2 text-sm font-semibold hover:bg-blue-50"
                >
                  Manage Categories
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* User Info Card */}
              <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-slate-900">User Information</h3>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Initials:</strong> {user?.initials || 'N/A'}</p>
                <p><strong>Role:</strong> {roleLabel}</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/bookadd"
                      className="block w-full text-center bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200"
                    >
                      Add New Ebook
                    </Link>
                  )}
                  <Link
                    href="/cart"
                    className="block w-full text-center bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800"
                  >
                    View Cart
                  </Link>
                </div>
              </div>

              {/* Status Card */}
              <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-900">Store Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Ebooks:</span>
                    <span>{isBooksLoading ? '...' : books.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Categories:</span>
                    <span>{isCategoriesLoading ? '...' : categories.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ebooks Section */}
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Latest Ebooks</h3>
                <Link href="/books" className="text-sm text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
              {booksError && (
                <p className="text-sm text-red-600">Failed to load ebooks.</p>
              )}
              {isBooksLoading ? (
                <p className="text-sm text-gray-500">Loading ebooks...</p>
              ) : books.length === 0 ? (
                <p className="text-sm text-gray-500">No ebooks available yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {books.slice(0, 6).map((book) => (
                    <div key={book.id} className="border border-blue-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                      {book.image && (
                        <img
                          src={book.image.startsWith('http') ? book.image : `${baseUrl}${book.image}`}
                          alt={book.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="font-semibold text-slate-900">{book.title}</h4>
                      <p className="text-sm text-slate-600">{book.author}</p>
                      <p className="text-xs text-blue-700 mt-1">{book.category}</p>
                      <p className="text-sm font-semibold text-slate-900 mt-2">${book.price.toFixed(2)}</p>
                      <Link
                        href={`/books/${book.id}`}
                        className="mt-3 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-500"
                      >
                        View details
                      </Link>
                      <button
                        onClick={() =>
                          dispatch(
                            addItem({
                              id: book.id,
                              title: book.title,
                              price: book.price,
                              image: book.image.startsWith('http')
                                ? book.image
                                : `${baseUrl}${book.image}`,
                            })
                          )
                        }
                        className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:text-blue-600"
                      >
                        Add to cart
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Section */}
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
                <Link href="/categories" className="text-sm text-blue-600 hover:text-blue-500">
                  Manage
                </Link>
              </div>
              {categoriesError && (
                <p className="text-sm text-red-600">Failed to load categories.</p>
              )}
              {isCategoriesLoading ? (
                <p className="text-sm text-gray-500">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories available yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-100"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 rounded-xl text-white">
              <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-blue-100 mb-4">
                Add a profile photo and preferences to personalize your reading experience.
              </p>
           

              <Link
                href="/dashboard/profile"
                className="inline-block bg-white text-blue-700 px-6 py-2 rounded-md hover:bg-blue-50 font-semibold"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
