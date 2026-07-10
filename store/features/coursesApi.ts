import { appApi } from "../api";

export type CourseItem = {
  id: string;
  title?: string;
  name?: string;
  courseName?: string;
  isActive?: boolean;
  subject?: string;
  subjects?: string[];
  accessType?: "free" | "paid";
  paymentType?: "full" | "emi";
  price?: number;
  strikePrice?: number;
  validityMonths?: number;
  installments?: number;
  bannerFileName?: string;
};

export type PaginatedResponse<T> = {
  data?: T[];
  items?: T[];
  results?: T[];
  total?: number;
  count?: number;
  page?: number;
  limit?: number;
};

type CourseQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const coursesApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<PaginatedResponse<CourseItem>, CourseQueryParams>({
      async queryFn({ page = 1, limit = 10, search }, _api, _extraOptions, fetchWithBQ) {
        const params = {
          page,
          limit,
          ...(search ? { search } : {}),
        };

        const primary = await fetchWithBQ({
          url: "/courses",
          method: "GET",
          params,
        });

        if (!primary.error) {
          return { data: primary.data as PaginatedResponse<CourseItem> };
        }

        const fallback = await fetchWithBQ({
          url: "/course",
          method: "GET",
          params,
        });

        if (!fallback.error) {
          return { data: fallback.data as PaginatedResponse<CourseItem> };
        }

        return { error: primary.error };
      },
      providesTags: ["Course"],
    }),
    createCourse: builder.mutation<CourseItem, Partial<CourseItem>>({
      query: (body) => ({
        url: "/courses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Course"],
    }),
    getCourseById: builder.query<CourseItem, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "GET",
      }),
      providesTags: ["Course"],
    }),
    updateCourse: builder.mutation<CourseItem, { courseId: string; body: Partial<CourseItem> }>({
      query: ({ courseId, body }) => ({
        url: `/courses/${courseId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Course"],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useCreateCourseMutation,
  useGetCourseByIdQuery,
  useUpdateCourseMutation,
} = coursesApi;
