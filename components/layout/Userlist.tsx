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
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  type UserItem,
  useCreateUserMutation,
  useGetUserByIdQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/store/features/usersApi";

const { Title, Text } = Typography;

type UserFormValues = {
  name: string;
  email: string;
  mobile?: string;
  role?: string;
  isActive?: boolean;
  password?: string;
  confirmPassword?: string;
};

const pickUsers = (payload: unknown): UserItem[] => {
  if (Array.isArray(payload)) {
    return payload as UserItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const directCandidates = [data.data, data.items, data.results, data.rows, data.users];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) {
      return candidate as UserItem[];
    }
  }

  if (data.data && typeof data.data === "object") {
    const nested = data.data as Record<string, unknown>;
    const nestedCandidates = [nested.data, nested.items, nested.results, nested.rows, nested.users];

    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate as UserItem[];
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

export default function Userlist() {
  const [form] = Form.useForm<UserFormValues>();
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isFetching, refetch } = useGetUsersQuery({
    page,
    limit,
    search: searchText || undefined,
  });

  const userDetailArgs = editingId ?? skipToken;
  const { data: userDetail, isFetching: isLoadingUserDetail } = useGetUserByIdQuery(userDetailArgs);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const users = useMemo(() => pickUsers(data), [data]);
  const total = useMemo(() => pickTotal(data, users.length), [data, users.length]);

  useEffect(() => {
    if (!userDetail || !editingId) {
      return;
    }

    form.setFieldsValue({
      name: userDetail.name ?? "",
      email: userDetail.email ?? "",
      mobile: userDetail.mobile,
      role: userDetail.role,
      isActive: userDetail.isActive,
      password: undefined,
      confirmPassword: undefined,
    });
  }, [editingId, form, userDetail]);

  const resetModal = () => {
    setOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const onSubmit = async (values: UserFormValues) => {
      console.log("values",values);
    const payload: Partial<UserItem> = {

      name: values.name.trim(),
      email: values.email.trim(),
      mobile: values.mobile?.trim(),
    //   role: values.role,
    //   isActive: values?.isActive,
    };

    if (values.password) {
      payload.password = values.password;
    }

    try {
      if (editingId) {
        await updateUser({ id: editingId, body: payload }).unwrap();
        message.success("User updated successfully.");
      } else {
        await createUser(payload).unwrap();
        message.success("User created successfully.");
      }

      resetModal();
      refetch();
    } catch {
      message.error("Unable to save user.");
    }
  };

  const columns: ColumnsType<UserItem> = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Text strong>{record.name ?? "-"}</Text>
          <Text type="secondary">{record.email ?? "-"}</Text>
        </div>
      ),
    },
    {
      title: "Phone",
      key: "mobile",
      dataIndex: "mobile",
      render: (value: string | undefined) => value ?? "-",
    },
    {
      title: "Role",
      key: "role",
      render: (_, record) => <Tag>{record.role ?? "student"}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => <Tag color={record.isActive ? "green" : "default"}>{record.isActive ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            variant="outlined"
            disabled
            onClick={() => {
              setEditingId(record.id);
              setOpen(true);
            }}
          >
            Edit
          </Button>
          <Button
          className="ml-2"
          disabled
            icon={<DeleteOutlined />}
            variant="filled"
            color="danger"
          //   onClick={() => {
          //     setDeletingId(record.id);
          //     setDeleteModalOpen(true);
          //   }}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Card style={{ borderRadius: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        <Space align="center" style={{ display: "flex", justifyContent: "space-between" }} wrap>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Users List
            </Title>
            <Text type="secondary">Search, paginate, create, and edit users.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Add User
          </Button>
        </Space>

        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search user by name or email"
          value={searchText}
          onChange={(event) => {
            setPage(1);
            setSearchText(event.target.value);
          }}
        />

        <Table
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={users}
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
          scroll={{ x: 940 }}
        />
      </div>

      <Modal
        title={editingId ? "Edit User" : "Add User"}
        open={open}
        onCancel={resetModal}
        onOk={() => form.submit()}
        confirmLoading={isCreating || isUpdating || isLoadingUserDetail}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" requiredMark={false} onFinish={onSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Name is required." }]}>
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required." },
              { type: "email", message: "Please enter a valid email." },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item name="mobile" label="Phone" rules={[{ pattern: /^\d{10}$/, message: "Please enter a valid 10-digit phone number." }]}>
            <Input placeholder="Optional phone" />
          </Form.Item>

          {/* <Form.Item name="role" label="Role">
            <Select
              allowClear
              options={[
                { label: "Student", value: "student" },
                { label: "Admin", value: "admin" },
                { label: "Mentor", value: "mentor" },
              ]}
            />
          </Form.Item>

          <Form.Item name="status" label="Status">
            <Select
              allowClear
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </Form.Item> */}

          <Form.Item
            name="password"
            label={editingId ? "New Password" : "Password"}
            rules={editingId ? [] : [{ required: true, message: "Password is required." }]}
          >
            <Input.Password placeholder={editingId ? "Optional new password" : "Enter password"} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={editingId ? "Confirm New Password" : "Confirm Password"}
            dependencies={["password"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const password = getFieldValue("password");

                  if (!password && !value) {
                    return Promise.resolve();
                  }

                  if (password === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error("Password and confirm password must match."));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Re-enter password" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
