import { appApi } from "../api";
import type { PaginatedResponse } from "./coursesApi";

interface Course {
  courseName?: string;
}
export type VideoItem = {
  id: string;
  courseId?: string;
  classKey?: string;
  course?: Course;
  subject?: string;
  chapter?: string;
  youtubeUrl?: string;
  videoUrl?: string;
  topicName?: string;
  videoName?: string;
  title?: string;
  description?: string;
};

type VideoQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export const videosApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideos: builder.query<PaginatedResponse<VideoItem>, VideoQueryParams>({
      query: ({ page = 1, limit = 20, search }) => ({
        url: "/videos",
        method: "GET",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: ["Video"],
    }),
    createVideo: builder.mutation<VideoItem, Partial<VideoItem>>({
      query: (body) => ({
        url: "/videos",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Video"],
    }),
    getVideoById: builder.query<VideoItem, string>({
      query: (id) => ({
        url: `/videos/${id}`,
        method: "GET",
      }),
      providesTags: ["Video"],
    }),
    updateVideo: builder.mutation<VideoItem, { id: string; body: Partial<VideoItem> }>({
      query: ({ id, body }) => ({
        url: `/videos/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Video"],
    }),
  }),
});

export const {
  useGetVideosQuery,
  useCreateVideoMutation,
  useGetVideoByIdQuery,
  useUpdateVideoMutation,
} = videosApi;
