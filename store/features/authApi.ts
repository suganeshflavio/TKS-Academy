import { appApi } from "../api";

type LoginRequest = {
  email?: string;
//   username?: string;
//   identifier?: string;
  password: string;
  deviceId?: string;
};

type LoginResponse = {
  token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: {
      name?: string;
    };
  };
};

export const authApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/admin/login",
        method: "POST",
        contentType: "application/json",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const { useAdminLoginMutation } = authApi;
