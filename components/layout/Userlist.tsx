"use client";

import { Button, Card, Progress, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, FileDoneOutlined } from "@ant-design/icons";
import StudentDetailModal, { type StudentRecord } from "@/components/modals/StudentDetailModal";

const { Title, Text } = Typography;

type CourseInfo = {
  title: string;
  progress: number;
  access: "demo" | "paid";
  lastAccess: string;
};

type SessionRecord = {
  date: string;
  topic: string;
  duration: string;
  status: "Completed" | "Scheduled" | "Missed";
  score: string;
};

type StudentReport = {
  label: string;
  value: string;
};


const students: StudentRecord[] = [
  {
    key: "student-1",
    name: "Aarav Kumar",
    email: "aarav.kumar@example.com",
    phone: "+91 98765 43210",
    grade: "10",
    enrolledCourse: "Web Development Bootcamp",
    status: "Active",
    progress: 78,
    attendance: "94%",
    lastActive: "2026-06-23",
    enrollmentDate: "2026-01-08",
    guardian: "Neha Kumar",
    location: "Bengaluru, India",
    availableCourses: [
      {
        title: "Full Stack JavaScript",
        progress: 42,
        access: "demo",
        lastAccess: "2026-06-20",
      },
      {
        title: "React & Next.js Essentials",
        progress: 68,
        access: "paid",
        lastAccess: "2026-06-22",
      },
    ],
    sessionHistory: [
      {
        date: "2026-06-22",
        topic: "React Hooks",
        duration: "45 mins",
        status: "Completed",
        score: "88%",
      },
      {
        date: "2026-06-19",
        topic: "CSS Layouts",
        duration: "50 mins",
        status: "Completed",
        score: "92%",
      },
      {
        date: "2026-06-17",
        topic: "JavaScript Fundamentals",
        duration: "60 mins",
        status: "Completed",
        score: "84%",
      },
    ],
    report: [
      { label: "Academic Score", value: "85%" },
      { label: "Attendance", value: "94%" },
      { label: "Assignments", value: "8 / 10" },
      { label: "Next Goal", value: "Complete React module" },
    ],
  },
  {
    key: "student-2",
    name: "Sara Fernandes",
    email: "sara.fernandes@example.com",
    phone: "+91 91234 56780",
    grade: "12",
    enrolledCourse: "Data Science Fundamentals",
    status: "Active",
    progress: 92,
    attendance: "98%",
    lastActive: "2026-06-24",
    enrollmentDate: "2026-02-14",
    guardian: "Priya Fernandes",
    location: "Mumbai, India",
    availableCourses: [
      {
        title: "Python for Data Science",
        progress: 100,
        access: "paid",
        lastAccess: "2026-06-24",
      },
      {
        title: "Machine Learning Basics",
        progress: 55,
        access: "demo",
        lastAccess: "2026-06-18",
      },
    ],
    sessionHistory: [
      {
        date: "2026-06-24",
        topic: "Data Visualization",
        duration: "40 mins",
        status: "Completed",
        score: "95%",
      },
      {
        date: "2026-06-20",
        topic: "Pandas & NumPy",
        duration: "55 mins",
        status: "Completed",
        score: "90%",
      },
      {
        date: "2026-06-17",
        topic: "Statistics Review",
        duration: "50 mins",
        status: "Completed",
        score: "88%",
      },
    ],
    report: [
      { label: "Academic Score", value: "91%" },
      { label: "Attendance", value: "98%" },
      { label: "Assignments", value: "9 / 10" },
      { label: "Next Goal", value: "Finish ML project" },
    ],
  },
  {
    key: "student-3",
    name: "Neel Patel",
    email: "neel.patel@example.com",
    phone: "+91 90123 45678",
    grade: "11",
    enrolledCourse: "UI/UX Design Course",
    status: "At Risk",
    progress: 61,
    attendance: "82%",
    lastActive: "2026-06-21",
    enrollmentDate: "2026-03-10",
    guardian: "Rina Patel",
    location: "Ahmedabad, India",
    availableCourses: [
      {
        title: "Design Thinking",
        progress: 48,
        access: "demo",
        lastAccess: "2026-06-19",
      },
      {
        title: "Figma UI Workshop",
        progress: 72,
        access: "paid",
        lastAccess: "2026-06-21",
      },
    ],
    sessionHistory: [
      {
        date: "2026-06-21",
        topic: "Prototyping Basics",
        duration: "35 mins",
        status: "Completed",
        score: "79%",
      },
      {
        date: "2026-06-18",
        topic: "User Research",
        duration: "45 mins",
        status: "Missed",
        score: "0%",
      },
      {
        date: "2026-06-15",
        topic: "Visual Hierarchy",
        duration: "40 mins",
        status: "Completed",
        score: "82%",
      },
    ],
    report: [
      { label: "Academic Score", value: "73%" },
      { label: "Attendance", value: "82%" },
      { label: "Assignments", value: "6 / 10" },
      { label: "Next Goal", value: "Improve session attendance" },
    ],
  },
];

export default function Userlist() {
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (student: StudentRecord) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const columns: ColumnsType<StudentRecord> = [
    {
      title: "Student",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary">{record.email}</Text>
        </div>
      ),
    },
    {
      title: "Course",
      dataIndex: "enrolledCourse",
      key: "enrolledCourse",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
    },
    {
      title: "Attendance",
      dataIndex: "attendance",
      key: "attendance",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: StudentRecord["status"]) => {
        let color: string | undefined;
        if (status === "Active") {
          color = "green";
        } else if (status === "At Risk") {
          color = "orange";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (value: number) => <Progress percent={value} size="small" />,
    },
    {
      title: "Last Active",
      dataIndex: "lastActive",
      key: "lastActive",
    },
    {
      title: "Details",
      key: "details",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleOpenModal(record)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
        <Card style={{ borderRadius: 8 }}>
          <Space
            align="center"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
            wrap
          >
            <div>
              <Title level={4} style={{ marginTop: 0 }}>
                Student Dashboard
              </Title>
              <Text type="secondary">
                View all student details, enrolled courses, session history, and reports.
              </Text>
            </div>
            <Space>
              <Tag icon={<CheckCircleOutlined />} color="success">
                Active students
              </Tag>
              <Tag icon={<FileDoneOutlined />} color="processing">
                Reports ready
              </Tag>
            </Space>
          </Space>

          <Table columns={columns} dataSource={students} pagination={{ pageSize: 5 }} scroll={{ x: 900 }} />
        </Card>
      </div>

      <StudentDetailModal open={isModalOpen} student={selectedStudent} onCancel={handleCloseModal} />
    </div>
  );
}
