"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
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
import {
  type CourseItem,
  useCreateCourseMutation,
  useGetCourseByIdQuery,
  useGetCoursesQuery,
  useUpdateCourseMutation,
} from "@/store/features/coursesApi";

const { Title, Text } = Typography;

type CourseFormValues = {
  courseName: string;
  subjects: string[];
  accessType?: "free" | "paid";
  paymentType?: "full" | "emi";
  price?: number;
  strikePrice?: number;
  validityMonths?: number;
  installments?: number;
};

const pickCourseList = (payload: unknown): CourseItem[] => {
  if (Array.isArray(payload)) {
    return payload as CourseItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const directCandidates = [
    data.data,
    data.items,
    data.results,
    data.rows,
    data.courses,
  ];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate as CourseItem[];
    }
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as Record<string, unknown>;
    const nestedCandidates = [
      nested.data,
      nested.items,
      nested.results,
      nested.rows,
      nested.courses,
    ];

    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate as CourseItem[];
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

export default function CoursePage() {
  const [form] = Form.useForm<CourseFormValues>();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isFetching, refetch } = useGetCoursesQuery({
    page,
    limit,
    search: searchText || undefined,
  });

  const courseDetailArgs = editingId ?? skipToken;
  const { data: courseDetail, isFetching: isLoadingCourseDetail } =
    useGetCourseByIdQuery(courseDetailArgs);

  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();

  const courses = useMemo(() => pickCourseList(data), [data]);
  const total = useMemo(
    () => pickTotal(data, courses.length),
    [courses.length, data],
  );

  useEffect(() => {
    if (!courseDetail || !editingId) {
      return;
    }

    form.setFieldsValue({
      courseName:
        courseDetail.courseName ??
        courseDetail.name ??
        courseDetail.title ??
        "",
      subjects:
        courseDetail.subjects ??
        (courseDetail.subject ? [courseDetail.subject] : []),
      accessType: courseDetail.accessType ?? "free",
      paymentType: courseDetail.paymentType,
      price: courseDetail.price,
      strikePrice: courseDetail.strikePrice,
      validityMonths: courseDetail.validityMonths,
      installments: courseDetail.installments,
    });
  }, [courseDetail, editingId, form]);

  const resetModal = () => {
    setOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onSubmit = async (values: CourseFormValues) => {
    const cleanSubjects = values.subjects
      .map((subject) => subject.trim())
      .filter((subject) => subject.length > 0);

    const payload = {
      courseName: values.courseName.trim(),
      subjects: cleanSubjects,
    //   accessType: values.accessType,
    //   paymentType:
    //     values.accessType === "paid"
    //       ? (values.paymentType ?? "full")
    //       : undefined,
    //   price: values.accessType === "paid" ? values.price : undefined,
    //   strikePrice:
    //     values.accessType === "paid" ? values.strikePrice : undefined,
    //   validityMonths:
    //     values.accessType === "paid" ? values.validityMonths : undefined,
    //   installments:
    //     values.accessType === "paid" && values.paymentType === "emi"
    //       ? values.installments
    //       : undefined,
    };

    try {
      if (editingId) {
        await updateCourse({ courseId: editingId, body: payload }).unwrap();
        message.success("Course updated successfully.");
      } else {
        await createCourse(payload).unwrap();
        message.success("Course created successfully.");
      }

      resetModal();
      refetch();
    } catch(error:unknown) {
      message.error((error as Error)?.message || "Unable to save course.");
    }
  };

  const columns: ColumnsType<CourseItem> = [
    {
      title: "Course",
      key: "courseName",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Text strong>
            {record.courseName ?? record.name ?? record.title ?? "-"}
          </Text>
          {/* <Text type="secondary">ID: {record.id}</Text> */}
        </div>
      ),
    },
    {
      title: "Subject",
      key: "subject",
      render: (_, record) => {
        const subjects =
          record.subjects ?? (record.subject ? [record.subject] : []);

        return subjects.length > 0 ? subjects.join(", ") : "-";
      },
    },
    // {
    //   title: "Access",
    //   key: "access",
    //   render: (_, record) => (
    //     <Space size={4}>
    //       <Tag color={record.accessType === "paid" ? "blue" : "green"}>{record.accessType ?? "free"}</Tag>
    //       {record.accessType === "paid" && record.paymentType ? <Tag>{record.paymentType}</Tag> : null}
    //     </Space>
    //   ),
    // },
    {
      title: "Status",
      key: "isActive",
      render: (_, record) => {
        // if (record.accessType !== "paid") {
        //   return "-";
        // }
        return (
          <Tag color={record.isActive ? "green" : "red"}>
            {record.isActive ? "Active" : "Inactive"}
          </Tag>
        );
      },
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

//   const accessType = Form.useWatch("accessType", form);
//   const paymentType = Form.useWatch("paymentType", form);

  return (
    <Card style={{ borderRadius: 8 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          width: "100%",
        }}
      >
        <Space
          align="center"
          style={{ display: "flex", justifyContent: "space-between" }}
          wrap
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Courses List
            </Title>
            <Text type="secondary">
              Search, paginate, create, and edit courses.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.setFieldsValue({
                // accessType: "free",
                // paymentType: "full",
                subjects: [],
              });
              setOpen(true);
            }}
          >
            Add Course
          </Button>
        </Space>

        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search course by name or subject"
          value={searchText}
          onChange={(event) => {
            setPage(1);
            setSearchText(event.target.value);
          }}
        />

        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={courses}
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
          scroll={{ x: 900 }}
        />
      </div>

      <Modal
        title={editingId ? "Edit Course" : "Add Course"}
        open={open}
        onCancel={resetModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating || isLoadingCourseDetail}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        //   initialValues={{
        //     accessType: "paid",
        //   }}
          onFinish={onSubmit}
        >
          <Form.Item
            name="courseName"
            label="Course Name"
            rules={[{ required: true, message: "Course name is required." }]}
          >
            <Input placeholder="Example: Class 10" />
          </Form.Item>

          <Form.Item
            name="subjects"
            label="Subjects"
            rules={[
              { required: true, message: "At least one subject is required." },
            ]}
          >
            <Select
              mode="tags"
              placeholder="Type subject and press Enter (Example: Tamil, English, Maths)"
              tokenSeparators={[","]}
            />
          </Form.Item>

          {/* <Form.Item
            name="accessType"
            label="Access"
            rules={[{ required: true, message: "Select access type." }]}
          >
            <Radio.Group
              defaultValue={"paid"}
              optionType="button"
              buttonStyle="solid"
              options={[
                { label: "Free", value: "free", disabled: true },
                { label: "Paid", value: "paid" },
              ]}
            />
          </Form.Item> */}

          {/* {accessType === "paid" ? (
            <>
              <Form.Item
                name="paymentType"
                label="Payment Type"
                rules={[{ required: true, message: "Payment type is required." }]}
              >
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  options={[
                    { label: "Full", value: "full" },
                    { label: "EMI", value: "emi" },
                  ]}
                />
              </Form.Item>

              <Form.Item name="price" label="Price" rules={[{ required: true, message: "Price is required." }]}>
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item name="strikePrice" label="Strike Price">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="validityMonths"
                label="Validity (months)"
                rules={[{ required: true, message: "Validity is required." }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              {paymentType === "emi" ? (
                <Form.Item
                  name="installments"
                  label="Installments"
                  rules={[{ required: true, message: "Installment count is required." }]}
                >
                  <InputNumber min={1} max={24} style={{ width: "100%" }} />
                </Form.Item>
              ) : null}
            </>
          ) : null} */}
        </Form>
      </Modal>
    </Card>
  );
}
