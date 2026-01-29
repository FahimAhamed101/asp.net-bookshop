'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/redux/features/catalog/catalogApi';

export default function CategoriesPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;
  const isAdmin = Array.isArray(userRole) ? userRole.includes('Admin') : userRole === 'Admin';
  const userEmail = user?.email || '';

  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const resetForm = () => {
    setName('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrorMessage('');

    if (!isAdmin) {
      setErrorMessage('Only Admin can manage categories.');
      return;
    }

    if (!userEmail) {
      setErrorMessage('Missing user email.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    try {
      if (editingId) {
        await updateCategory({ id: editingId, name: name.trim(), email: userEmail }).unwrap();
        setMessage('Category updated.');
      } else {
        await createCategory({ name: name.trim(), email: userEmail }).unwrap();
        setMessage('Category created.');
      }
      resetForm();
    } catch (error) {
      console.error('Category save error:', error);
      setErrorMessage('Failed to save category.');
    }
  };

  const handleEdit = (id: number) => {
    const category = categories.find((item) => item.id === id);
    if (!category) return;
    setEditingId(category.id);
    setName(category.name);
    setMessage('');
    setErrorMessage('');
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) {
      setErrorMessage('Only Admin can manage categories.');
      return;
    }
    if (!userEmail) {
      setErrorMessage('Missing user email.');
      return;
    }

    const category = categories.find((item) => item.id === id);
    if (!category) return;

    setMessage('');
    setErrorMessage('');
    try {
      await deleteCategory({ id, name: category.name, email: userEmail }).unwrap();
      setMessage('Category deleted.');
    } catch (error) {
      console.error('Delete category error:', error);
      setErrorMessage('Failed to delete category.');
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
                Categories
              </h1>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-500">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1 bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {editingId ? 'Edit Category' : 'Add Category'}
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Organize your ebooks with clear category labels.
            </p>

            {!isAdmin && (
              <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                Only Admin users can create, update, or delete categories.
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Fiction"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating || !isAdmin}
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingId
                    ? isUpdating
                      ? 'Updating...'
                      : 'Update Category'
                    : isCreating
                      ? 'Creating...'
                      : 'Create Category'}
                </button>
                {editingId && (
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

          <section className="lg:col-span-2 bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">All Categories</h2>
            {isLoading ? (
              <p className="text-sm text-slate-600">Loading categories...</p>
            ) : sortedCategories.length === 0 ? (
              <p className="text-sm text-slate-600">No categories yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between border border-blue-100 rounded-xl px-4 py-3"
                  >
                    <span className="text-slate-900 font-medium">{category.name}</span>
                    {isAdmin && (
                      <div className="flex items-center gap-3 text-sm">
                        <button
                          onClick={() => handleEdit(category.id)}
                          className="text-blue-600 hover:text-blue-500 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-500 font-semibold disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
