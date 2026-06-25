"use client";

import { Card, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

type PaymentRecord = {
  key: string;
  studentName: string;
  course: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  date: string;
  paymentMethod: string;
};

const payments: PaymentRecord[] = [
  {
    key: "payment-1",
    studentName: "Aarav Kumar",
    course: "Web Development Bootcamp",
    amount: "₹12,500",
    status: "Paid",
    date: "2026-06-22",
    paymentMethod: "Credit Card",
  },
  {
    key: "payment-2",
    studentName: "Sara Fernandes",
    course: "Data Science Fundamentals",
    amount: "₹15,900",
    status: "Pending",
    date: "2026-06-24",
    paymentMethod: "UPI",
  },
  {
    key: "payment-3",
    studentName: "Neel Patel",
    course: "UI/UX Design Course",
    amount: "₹9,800",
    status: "Failed",
    date: "2026-06-23",
    paymentMethod: "Net Banking",
  },
];

const columns: ColumnsType<PaymentRecord> = [
  {
    title: "Student",
    dataIndex: "studentName",
    key: "studentName",
    render: (value) => <Text strong>{value}</Text>,
  },
  {
    title: "Course",
    dataIndex: "course",
    key: "course",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: PaymentRecord["status"]) => {
      let color = "red";
      if (status === "Paid") {
        color = "green";
      } else if (status === "Pending") {
        color = "orange";
      }
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Payment Method",
    dataIndex: "paymentMethod",
    key: "paymentMethod",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
];

export default function PaymentList() {
  const totalPaid = payments.filter((payment) => payment.status === "Paid").length;
  const totalPending = payments.filter((payment) => payment.status === "Pending").length;
  const totalFailed = payments.filter((payment) => payment.status === "Failed").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
      <Card style={{ borderRadius: 8 }} bodyStyle={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 24,
          }}
        >
          <div style={{ minWidth: 280, flex: 1, maxWidth: 520 }}>
            <Title level={4} style={{ margin: 0 }}>
              Payment Details
            </Title>
            <Text type="secondary">
              Review recent payment activity, status, and payment methods for enrolled students.
            </Text>
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", flex: 2, minWidth: 280 }}>
            <Card type="inner" title="Paid" style={{ minWidth: 140, flex: 1 }}>
              <Text strong>{totalPaid}</Text>
            </Card>
            <Card type="inner" title="Pending" style={{ minWidth: 140, flex: 1 }}>
              <Text strong>{totalPending}</Text>
            </Card>
            <Card type="inner" title="Failed" style={{ minWidth: 140, flex: 1 }}>
              <Text strong>{totalFailed}</Text>
            </Card>
          </div>
        </div>
      </Card>

      {/* <Card title="Recent Transactions" style={{ borderRadius: 8, padding: 20 }}> */}
        <Table<PaymentRecord>
          columns={columns}
          dataSource={payments}
          pagination={{ pageSize: 5 }}
          rowKey="key"
          scroll={{ x: true }}
        />
      {/* </Card> */}
    </div>
  );
}
