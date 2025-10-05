import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config.js";

 export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: `${server}/api/` }),
  tagTypes: ["Complaint", "User", "Notification"],

  endpoints: (builder) => ({
    // ---------- Citizen Endpoints ----------
    getMyComplaints: builder.query({
      query: (token) => ({
        headers: {
          Authorization: `Bearer ${token}`,
        },
        url: "complaints/my",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Complaint"],
    }),

    createComplaint: builder.mutation({
      query: (data) => ({
        url: "complaints/new",
        method: "POST",
        credentials: "include",
        body: data,
      }),
      invalidatesTags: ["Complaint"],
    }),

    getComplaintDetails: builder.query({
      query: (complaintId) => ({
        url: `complaints/${complaintId}`,
        credentials: "include",
      }),
      providesTags: ["Complaint"],
    }),

    // ---------- Staff Endpoints ----------
    getAssignedComplaints: builder.query({
      query: () => ({
        url: "staff/complaints",
        credentials: "include",
      }),
      providesTags: ["Complaint"],
    }),

    updateComplaintStatus: builder.mutation({
      query: ({ complaintId, status }) => ({
        url: `staff/complaints/${complaintId}`,
        method: "PUT",
        credentials: "include",
        body: { status },
      }),
      invalidatesTags: ["Complaint"],
    }),

    // ---------- Admin Endpoints ----------
    getAllComplaints: builder.query({
      query: () => ({
        url: "admin/complaints",
        credentials: "include",
      }),
      providesTags: ["Complaint"],
    }),

    updateComplaintStatusByAdmin: builder.mutation({
      query: ({ complaintId, status }) => ({
        url: `admin/complaints/${complaintId}`,
        method: "PUT",
        credentials: "include",
        body: { status },
      }),
      invalidatesTags: ["Complaint"],
    }),
    assignComplaint: builder.mutation({
      query: ({ complaintId, staffId }) => ({
        url: `admin/complaints/assign`,
        method: "PUT",
        credentials: "include",
        body: { complaintId, staffId },
      }),
      invalidatesTags: ["Complaint"],
    }),

    getAllUsers: builder.query({
      query: () => ({
        url: "admin/users",
        credentials: "include",
      }),
      providesTags: ["User"],
    }),

    // ---------- Notifications ----------
    getNotifications: builder.query({
      query: () => ({
        url: "notifications",
        credentials: "include",
      }),
      providesTags: ["Notification"],
      keepUnusedDataFor: 0,
    }),

    // ---------- Search Users (e.g. for assigning) ----------
    searchUsers: builder.query({
      query: (name) => ({
        url: `user/search?name=${name}`,
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetMyComplaintsQuery,
  useCreateComplaintMutation,
  useGetComplaintDetailsQuery,

  useGetAssignedComplaintsQuery,
  useUpdateComplaintStatusMutation,

  useGetAllComplaintsQuery,
  useAssignComplaintMutation,
  useGetAllUsersQuery,

  useGetNotificationsQuery,
    useLazySearchUsersQuery,
    useUpdateComplaintStatusByAdminMutation,
} = api;
