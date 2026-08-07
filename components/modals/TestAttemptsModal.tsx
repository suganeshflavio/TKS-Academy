"use client";

import { useMemo } from "react";
import { Empty, Modal, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useGetTestAttemptsQuery } from "@/store/features/testsApi";

const { Text } = Typography;

interface Props {
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly testId?: string;
  readonly testName?: string;
}

export default function TestAttemptsModal({ open, onCancel, testId, testName }: Props) {
  const { data, isFetching } = useGetTestAttemptsQuery(testId ?? "", { skip: !testId || !open });
  const attempts = useMemo(() => data?.attempts ?? [], [data]);

  const columns: ColumnsType<Record<string, unknown>> = [
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
      render: (_value, record) => {
        const student = record.student as { fullName?: string; name?: string; email?: string } | undefined;
        const studentName = String(student?.fullName || student?.name || record.studentName || "Unknown student");
        const studentEmail = String(student?.email || record.studentEmail || "");
        return (
          <div>
            <div>{studentName}</div>
            <Text type="secondary">{studentEmail}</Text>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => <Tag color={value === "completed" ? "green" : "orange"}>{String(value || "pending")}</Tag>,
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      render: (_value, record) => {
        const score = record.score ?? record.marksObtained;
        return <span>{score != null ? `${score}` : "-"}</span>;
      },
    },
    {
      title: "Total",
      dataIndex: "totalMarks",
      key: "totalMarks",
      render: (value) => <span>{value ?? "-"}</span>,
    },
    {
      title: "Submitted",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (value) => <span>{value ? new Date(String(value)).toLocaleString() : "-"}</span>,
    },
  ];

  return (
    <Modal title={testName ? `Attempts for ${testName}` : "Student Attempts"} open={open} onCancel={onCancel} footer={null} width={860} destroyOnHidden>
      <Space direction="vertical" style={{ width: "100%" }}>
        {isFetching ? (
          <Text type="secondary">Loading attempts...</Text>
        ) : attempts.length === 0 ? (
          <Empty description="No student attempts yet." />
        ) : (
          <Table dataSource={attempts as Record<string, unknown>[]} columns={columns} rowKey={(record) => String(record.id || Math.random())} pagination={false} />
        )}
      </Space>
    </Modal>
  );
}
