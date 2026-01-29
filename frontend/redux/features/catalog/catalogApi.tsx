import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface BookResponse {
  id: number;
  title: string;
  isbn: string;
  description: string;
  author: string;
  category: string;
  image: string;
  price: number;
}

interface CategoryResponse {
  id: number;
  name: string;
}

interface CreateBookPayload {
  title: string;
  isbn: string;
  description: string;
  author: string;
  category: string;
  imageFile: File;
  price: number;
  email: string;
}

interface UpdateBookPayload {
  id: number;
  title: string;
  isbn: string;
  description: string;
  author: string;
  category: string;
  imageFile?: File | null;
  price: number;
  email: string;
}

interface DeleteBookPayload {
  isbn: string;
  email: string;
}

interface CheckoutItemPayload {
  bookId: number;
  quantity: number;
}

interface CheckoutAddressPayload {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreateCheckoutSessionPayload {
  items: CheckoutItemPayload[];
  address: CheckoutAddressPayload;
}

interface CreateCheckoutSessionResponse {
  url: string;
}

interface CreateCategoryPayload {
  name: string;
  email: string;
}

interface UpdateCategoryPayload {
  id: number;
  name: string;
  email: string;
}

interface DeleteCategoryPayload {
  id: number;
  name: string;
  email: string;
}

export const catalogApi = createApi({
  reducerPath: "catalogApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5030",
  }),
  tagTypes: ["Books", "Categories"],
  endpoints: (builder) => ({
    getBooks: builder.query<BookResponse[], void>({
      query: () => "/api/Books",
      providesTags: ["Books"],
    }),
    getBookById: builder.query<BookResponse, number>({
      query: (id) => `/api/Books/${id}`,
      providesTags: ["Books"],
    }),
    getCategories: builder.query<CategoryResponse[], void>({
      query: () => "/api/Categories",
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<CategoryResponse, CreateCategoryPayload>({
      query: (payload) => ({
        url: "/api/Categories",
        method: "POST",
        body: {
          email: payload.email,
          name: payload.name,
        },
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<void, UpdateCategoryPayload>({
      query: (payload) => ({
        url: `/api/Categories/${payload.id}`,
        method: "PUT",
        body: {
          email: payload.email,
          id: payload.id,
          name: payload.name,
        },
      }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<void, DeleteCategoryPayload>({
      query: (payload) => ({
        url: `/api/Categories/${payload.id}`,
        method: "DELETE",
        body: {
          email: payload.email,
          id: payload.id,
          name: payload.name,
        },
      }),
      invalidatesTags: ["Categories"],
    }),
    createBook: builder.mutation<BookResponse, CreateBookPayload>({
      query: (payload) => {
        const formData = new FormData();
        formData.append("Title", payload.title);
        formData.append("ISBN", payload.isbn);
        formData.append("Description", payload.description);
        formData.append("Author", payload.author);
        formData.append("Category", payload.category);
        formData.append("ImageFile", payload.imageFile);
        formData.append("Price", String(payload.price));
        formData.append("Email", payload.email);
        return {
          url: "/api/Books",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Books"],
    }),
    updateBook: builder.mutation<void, UpdateBookPayload>({
      query: (payload) => {
        const formData = new FormData();
        formData.append("Title", payload.title);
        formData.append("ISBN", payload.isbn);
        formData.append("Description", payload.description);
        formData.append("Author", payload.author);
        formData.append("Category", payload.category);
        if (payload.imageFile) {
          formData.append("ImageFile", payload.imageFile);
        }
        formData.append("Price", String(payload.price));
        formData.append("Email", payload.email);
        return {
          url: `/api/Books/${payload.id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Books"],
    }),
    deleteBook: builder.mutation<void, DeleteBookPayload>({
      query: (payload) => ({
        url: `/api/Books/${encodeURIComponent(payload.isbn)}`,
        method: "DELETE",
        body: {
          isbn: payload.isbn,
          email: payload.email,
        },
      }),
      invalidatesTags: ["Books"],
    }),
    createCheckoutSession: builder.mutation<CreateCheckoutSessionResponse, CreateCheckoutSessionPayload>({
      query: (payload) => ({
        url: "/api/Checkout/create-session",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useCreateCheckoutSessionMutation,
} = catalogApi;
