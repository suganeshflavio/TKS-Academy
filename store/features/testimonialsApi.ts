import { appApi } from "../api";

export type TestimonialItem = {
  id: string;
  username: string;
  star: number;
  review: string;
  isActive?: boolean;
  createdAt?: string;
};

const unwrapTestimonial = (response: unknown): TestimonialItem => {
  if (response && typeof response === "object" && !Array.isArray(response)) {
    const data = (response as Record<string, unknown>).data;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      return data as TestimonialItem;
    }
  }

  return response as TestimonialItem;
};

export const testimonialsApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getTestimonials: builder.query<unknown, void>({
      query: () => ({
        url: "/testimonials",
        method: "GET",
      }),
      providesTags: ["Testimonial"],
    }),
    updateTestimonial: builder.mutation<TestimonialItem, { id: string; body: Partial<TestimonialItem> }>({
      query: ({ id, body }) => ({
        url: `/testimonials/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: unwrapTestimonial,
      invalidatesTags: ["Testimonial"],
    }),
    deleteTestimonial: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/testimonials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Testimonial"],
    }),
  }),
});

export const { useGetTestimonialsQuery, useUpdateTestimonialMutation, useDeleteTestimonialMutation } =
  testimonialsApi;
