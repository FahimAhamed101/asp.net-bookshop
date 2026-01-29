'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  useCreateBookMutation,
  useDeleteBookMutation,
  useGetBooksQuery,
  useGetCategoriesQuery,
  useUpdateBookMutation,
} from '@/redux/features/catalog/catalogApi';

type BookFormState = {
  title: string;
  isbn: string;
  description: string;
  author: string;
  category: string;
  price: string;
  imageFile: File | null;
};

const initialFormState: BookFormState = {
  title: '',
  isbn: '',
  description: '',
  author: '',
  category: '',
  price: '',
  imageFile: null,
};

export default function BookAddPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = (user as { role?: string[] | string } | null)?.role;
  const isAdmin =
    Array.isArray(userRole) ? userRole.includes('Admin') : userRole === 'Admin';
  const userEmail = user?.email || '';

  const { data: books = [], isLoading: isBooksLoading } = useGetBooksQuery();
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();

  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();

  const [formState, setFormState] = useState<BookFormState>(initialFormState);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5030';

  const resolvedBooks = useMemo(
    () =>
      books.map((book) => ({
        ...book,
        imageUrl: book.image?.startsWith('http')
          ? book.image
          : `${baseUrl}${book.image}`,
      })),
    [books, baseUrl]
  );

  const resetForm = () => {
    setFormState(initialFormState);
    setEditingBookId(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormState((prev) => ({ ...prev, imageFile: file }));
  };

  const handleEdit = (bookId: number) => {
    const book = books.find((item) => item.id === bookId);
    if (!book) return;
    setEditingBookId(book.id);
    setFormState({
      title: book.title,
      isbn: book.isbn,
      description: book.description,
      author: book.author,
      category: book.category,
      price: String(book.price ?? ''),
      imageFile: null,
    });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleDelete = async (isbn: string) => {
    if (!userEmail) {
      setErrorMessage('Missing user email.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await deleteBook({ isbn, email: userEmail }).unwrap();
      setSuccessMessage('Book deleted.');
    } catch (error) {
      console.error('Delete book error:', error);
      setErrorMessage('Failed to delete book.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!userEmail) {
      setErrorMessage('Missing user email.');
      return;
    }

    if (!isAdmin) {
      setErrorMessage('Only Admin can create or update books.');
      return;
    }

    if (!editingBookId && !formState.imageFile) {
      setErrorMessage('Image file is required for new books.');
      return;
    }

    try {
      if (editingBookId) {
        await updateBook({
          id: editingBookId,
          title: formState.title,
          isbn: formState.isbn,
          description: formState.description,
          author: formState.author,
          category: formState.category,
          price: Number(formState.price),
          imageFile: formState.imageFile,
          email: userEmail,
        }).unwrap();
        setSuccessMessage('Book updated.');
      } else if (formState.imageFile) {
        await createBook({
          title: formState.title,
          isbn: formState.isbn,
          description: formState.description,
          author: formState.author,
          category: formState.category,
          price: Number(formState.price),
          imageFile: formState.imageFile,
          email: userEmail,
        }).unwrap();
        setSuccessMessage('Book created.');
      }
      resetForm();
    } catch (error) {
      console.error('Save book error:', error);
      setErrorMessage('Failed to save book.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white">
      <nav className="bg-white/80 backdrop-blur border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center font-bold">
                BS
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Bookshop Admin
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Link href="/" className="text-blue-600 hover:text-blue-500">
                Dashboard
              </Link>
              <span>{user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-1 bg-white rounded-xl border border-blue-100 shadow-sm p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {editingBookId ? 'Edit Book' : 'Add New Book'}
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Upload cover images and manage the ebook catalog.
              </p>

              {!isAdmin && (
                <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                  Only Admin users can create, update, or delete books.
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Title</label>
                  <input
                    name="title"
                    value={formState.title}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">ISBN</label>
                  <input
                    name="isbn"
                    value={formState.isbn}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Author</label>
                  <input
                    name="author"
                    value={formState.author}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Price (USD)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.price}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Category</label>
                  <select
                    name="category"
                    value={formState.category}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    name="description"
                    value={formState.description}
                    onChange={handleInputChange}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {editingBookId ? 'Update Cover (optional)' : 'Cover Image'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating || isCategoriesLoading || !isAdmin}
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editingBookId
                      ? isUpdating
                        ? 'Updating...'
                        : 'Update Book'
                      : isCreating
                        ? 'Creating...'
                        : 'Create Book'}
                  </button>
                  {editingBookId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="lg:col-span-2 bg-white rounded-xl border border-blue-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Books</h2>
                  <p className="text-sm text-slate-600">Manage and review all ebooks.</p>
                </div>
              </div>

              {isBooksLoading ? (
                <p className="text-sm text-slate-600">Loading books...</p>
              ) : resolvedBooks.length === 0 ? (
                <p className="text-sm text-slate-600">No books found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resolvedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="border border-blue-100 rounded-xl p-4 flex gap-4"
                    >
                      <div className="w-20 h-28 bg-slate-100 rounded-lg overflow-hidden">
                        {book.image && (
                          <img
                            src={book.imageUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{book.title}</h3>
                        <p className="text-sm text-slate-600">{book.author}</p>
                        <p className="text-xs text-blue-700">{book.category}</p>
                        <p className="text-xs text-slate-500 mt-1">ISBN: {book.isbn}</p>
                        {isAdmin && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleEdit(book.id)}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(book.isbn)}
                              disabled={isDeleting}
                              className="text-xs font-semibold text-red-600 hover:text-red-500 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
