import { appApi } from "../api";
import type { PaginatedResponse } from "./coursesApi";

export type UserItem = {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
};

type UserQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const usersApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<UserItem>, UserQueryParams>({
      async queryFn({ page = 1, limit = 20, search }, _api, _extraOptions, fetchWithBQ) {
        const params = {
          page,
          limit,
          ...(search ? { search } : {}),
        };

        const primary = await fetchWithBQ({
          url: "/users",
          method: "GET",
          params,
        });

        if (!primary.error) {
          return { data: primary.data as PaginatedResponse<UserItem> };
        }

        const fallback = await fetchWithBQ({
          url: "/user",
          method: "GET",
          params,
        });

        if (!fallback.error) {
          return { data: fallback.data as PaginatedResponse<UserItem> };
        }

        return { error: primary.error };
      },
      providesTags: ["User"],
    }),
    createUser: builder.mutation<UserItem, Partial<UserItem>>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    getUserById: builder.query<UserItem, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateUser: builder.mutation<UserItem, { id: string; body: Partial<UserItem> }>({
      query: ({ id, body }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useUpdateUserMutation,
} = usersApi;
