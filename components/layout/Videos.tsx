"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { skipToken } from "@reduxjs/toolkit/query";
import { type CourseItem, useGetCoursesQuery } from "@/store/features/coursesApi";
import {
  type VideoItem,
  useCreateVideoMutation,
  useGetVideoByIdQuery,
  useGetVideosQuery,
  useUpdateVideoMutation,
} from "@/store/features/videosApi";

const { Title, Text } = Typography;

type VideoFormValues = {
  courseId?: string;
  subject?: string;
  chapter?: string;
  videoName: string;
  youtubeUrl?: string;
  description?: string;
};

const pickCourses = (payload: unknown): CourseItem[] => {
  if (Array.isArray(payload)) {
    return payload as CourseItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const directCandidates = [data.data, data.items, data.results, data.rows, data.courses];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate as CourseItem[];
    }
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as Record<string, unknown>;
    const nestedCandidates = [nested.data, nested.items, nested.results, nested.rows, nested.courses];

    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate as CourseItem[];
      }
    }
  }

  return [];
};

const pickVideoList = (payload: unknown): VideoItem[] => {
  if (Array.isArray(payload)) {
    return payload as VideoItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const directCandidates = [data.data, data.items, data.results, data.rows, data.videos];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate as VideoItem[];
    }
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as Record<string, unknown>;
    const nestedCandidates = [nested.data, nested.items, nested.results, nested.rows, nested.videos];

    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate as VideoItem[];
      }
    }
  }

  return [];
};

const pickTotal = (payload: unknown, fallbackLength: number) => {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (!payload || typeof payload !== "object") {
    return fallbackLength;
  }

  const data = payload as Record<string, unknown>;

  if (typeof data.total === "number") {
    return data.total;
  }

  if (typeof data.count === "number") {
    return data.count;
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as Record<string, unknown>;

    if (typeof nested.total === "number") {
      return nested.total;
    }

    if (typeof nested.count === "number") {
      return nested.count;
    }
  }

  return fallbackLength;
};

export default function Videos() {
  const [form] = Form.useForm<VideoFormValues>();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const selectedCourseId = Form.useWatch("courseId", form);

  const { data, isFetching, refetch } = useGetVideosQuery({
    page,
    limit,
    search: searchText || undefined,
  });

  const { data: coursesPayload } = useGetCoursesQuery({ page: 1, limit: 100 });
  const videos = useMemo(() => pickVideoList(data), [data]);
  const courses = useMemo(() => pickCourses(coursesPayload), [coursesPayload]);
  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );
  const subjectOptions = useMemo(
    () => (selectedCourse?.subjects ?? []).map((subject) => ({ label: subject, value: subject })),
    [selectedCourse?.subjects],
  );

  const videoDetailArgs = editingId ?? skipToken;
  const { data: videoDetail, isFetching: isLoadingVideoDetail } = useGetVideoByIdQuery(videoDetailArgs);

  const [createVideo, { isLoading: isCreating }] = useCreateVideoMutation();
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();

  const total = useMemo(() => pickTotal(data, videos.length), [data, videos.length]);

  useEffect(() => {
    if (!videoDetail || !editingId) {
      return;
    }

    form.setFieldsValue({
      courseId: videoDetail.courseId ?? videoDetail.classKey,
      subject: videoDetail.subject,
      chapter: videoDetail.chapter,
      videoName: videoDetail.videoName ?? videoDetail.title ?? "",
      youtubeUrl: videoDetail.youtubeUrl ?? videoDetail.videoUrl,
      description: videoDetail.description,
    });
  }, [editingId, form, videoDetail]);

  const resetModal = () => {
    setOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onSubmit = async (values: VideoFormValues) => {
    const payload = {
      courseId: values.courseId,
      subject: values.subject?.trim(),
      chapter: values.chapter?.trim(),
      videoName: values.videoName.trim(),
      youtubeUrl: values.youtubeUrl?.trim(),
      description: values.description?.trim(),
    };

    try {
      if (editingId) {
        await updateVideo({ id: editingId, body: payload }).unwrap();
        message.success("Video updated successfully.");
      } else {
        await createVideo(payload).unwrap();
        message.success("Video created successfully.");
      }

      resetModal();
      refetch();
    } catch {
      message.error("Unable to save video.");
    }
  };

  const columns: ColumnsType<VideoItem> = [
    {
      title: "Course",
      key: "courseName",
      render: (_, record) => <Text strong>{record.course?.courseName ?? record.courseId ?? record.classKey ?? "-"}</Text>,
    },
    {
      title: "Subject",
      key: "subject",
      render: (_, record) => <Text strong>{record.subject ?? "-"}</Text>
    },
    {
      title: "Chapter / Topic",
      key: "chapter",
      render: (_, record) => (
        <Space size={4} wrap>
          {record.chapter ? <Tag style={{fontWeight:"600"}}>{record.chapter}</Tag> : null}
          {/* {record.topicName ? <Tag color="blue">Topic: {record.topicName}</Tag> : null}
          {!record.chapterName && !record.topicName ? "-" : null} */}
        </Space>
      ),
    },
    {
      title: "Video Name",
      key: "video",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Text strong>{record.videoName ?? record.title ?? "-"}</Text>
          {/* <Text type="secondary">ID: {record.id}</Text> */}
        </div>
      ),
    },
    {
      title: "Video URL",
      key: "video",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Text >{record.youtubeUrl ?? record.videoUrl ?? "-"}</Text>
          {/* <Text type="secondary">ID: {record.id}</Text> */}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button
          icon={<EditOutlined />}
          disabled
          onClick={() => {
            setEditingId(record.id);
            setOpen(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <Space align="center" style={{ display: "flex", justifyContent: "space-between" }} wrap>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Video List
            </Title>
            <Text type="secondary">Search, paginate, create, and edit videos.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Add Video
          </Button>
        </Space>

        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search video by name, chapter, or topic"
          value={searchText}
          onChange={(event) => {
            setPage(1);
            setSearchText(event.target.value);
          }}
        />

        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={videos}
          loading={isFetching}
          pagination={{
            current: page,
            pageSize: limit,
            total,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setLimit(nextPageSize);
            },
          }}
          scroll={{ x: 960 }}
        />
      </div>

      <Modal
        title={editingId ? "Edit Video" : "Add Video"}
        open={open}
        style={{ top:50 }}
        width={700}
        height={500}
        onCancel={resetModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating || isLoadingVideoDetail}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <Form.Item name="courseId" label="Course" rules={[{ required: true, message: "Course is required." }]}>
            <Select
              allowClear
              placeholder="Select course"
              options={courses.map((course) => ({
                value: course.id,
                label: course.courseName ?? course.name ?? course.title ?? course.id,
              }))}
              onChange={() => {
                form.setFieldValue("subject", undefined);
              }}
            />
          </Form.Item>

          <Form.Item
          name="subject"
          label="Subject"
        //   rules={[{ required: true, message: "Subject is required." }]}
          >
            <Select
              allowClear
              showSearch
              placeholder={selectedCourse ? "Select subject" : "Select a course first"}
              options={subjectOptions}
              disabled={!selectedCourse}
            />
          </Form.Item>
          </div>
          <Form.Item
          name="chapter"
          label="Chapter"
          // rules={[{ required: true, message: "Chapter is required." }]}
          >
            <Input placeholder="Optional chapter" />
          </Form.Item>

          <Form.Item
            name="videoName"
            label="Video Name"
            rules={[{ required: true, message: "Video name is required." }]}
          >
            <Input placeholder="Example: Algebra Basics" />
          </Form.Item>

          <Form.Item name="youtubeUrl" label="Video URL" rules={[{ required: true, message: "Video URL is required." }]}>
            <Input placeholder="video URL"/>
          </Form.Item>

          <Form.Item name="description" label="Description" rules={[{ required: true, message: "Description is required." }]}>
            <Input.TextArea rows={4} placeholder="Optional description" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
