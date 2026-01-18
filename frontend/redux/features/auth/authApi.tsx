import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Interfaces - UPDATED TO MATCH YOUR ACTUAL API RESPONSE
interface LoginResponse {
  status: string;
  message: string;
  data: {
    token: string;
    userId: number;
    name: string;
    email: string;
    initials: string;
    role?: string[];
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterResponse {
  status: string;
  message: string;
  data?: {
    token: string;
    userId: number;
    name: string;
    email: string;
    initials: string;
  };
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  initials: string;
}












interface LogoutResponse {
  code: number;
  message: string;
}







// Helper function to get token safely
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem("token") || localStorage.getItem("accessToken");
  }
  return null;
};


export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5030",
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      
      // Only set Content-Type for non-FormData endpoints
      if (endpoint !== 'updatePatientProfile' && endpoint !== 'uploadDocument') {
        headers.set("Content-Type", "application/json");
      }
      
      return headers;
    },
  }),
  tagTypes: ["Profile", "Team", "Documents", "Doctors", "Patient", "Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/Auth",  // This should match your actual endpoint
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (credentials) => ({
        url: "/api/Auth/register",  // Adjust based on your actual register endpoint
        method: "POST",
        body: credentials,
      }),
    }),
    




 
    
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    


    

    
   
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,




  useLogoutMutation,

} = authApi;