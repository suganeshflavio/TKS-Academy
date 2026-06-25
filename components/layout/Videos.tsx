"use client";

import React, { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  FileImageOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { ClassRecord, VideoRecord } from "./types";
import McqModal from "./modals/McqModal";
import NotesModal from "./modals/NotesModal";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type UploadValue = {
  name?: string;
}[];

type VideosProps = {
  classes: ClassRecord[];
  videos: VideoRecord[];
  setVideos: React.Dispatch<React.SetStateAction<VideoRecord[]>>;
};

type VideoFormValues = {
  classKey: string;
  subject: string;
  chapterName?: string;
  topicName?: string;
  videoName: string;
  videoFile?: UploadValue;
  description: string;
  parts?: { title?: string }[];
};

const normalizeUpload = (
  event: UploadValue | { fileList?: UploadValue },
): UploadValue => {
  if (Array.isArray(event)) {
    return event;
  }

  return event?.fileList ?? [];
};

const formatValidity = (validityMonths?: number) => {
  if (typeof validityMonths !== "number") {
    return "";
  }

  return validityMonths === 0 ? "Lifetime" : `${validityMonths} months`;
};

export default function Videos({ classes, videos, setVideos }: VideosProps) {
  const [form] = Form.useForm<VideoFormValues>();
  const [isFormVisible, setIsFormVisible] = useState(false);
const [selectedVideo, setSelectedVideo] =
  useState<VideoRecord | null>(null);

const [notesOpen, setNotesOpen] =
  useState(false);

const [mcqOpen, setMcqOpen] =
  useState(false);
  const selectedClassKey = Form.useWatch("classKey", form);

  const selectedClass = classes.find(
    (classItem) => classItem.key === selectedClassKey,
  );

  const subjectOptions =
    selectedClass?.subjects?.map((subject) => ({
      label: subject,
      value: subject,
    })) ?? [];

  const selectedCategoryUsesEmi =
    selectedClass?.accessType === "paid" && selectedClass.paymentType === "emi";
  const installmentCount = selectedCategoryUsesEmi
    ? (selectedClass?.installments ?? 1)
    : 1;

  const openVideoForm = (classKey?: string) => {
    setIsFormVisible(true);
    form.resetFields();
    form.setFieldsValue({ classKey });
  };

  const saveVideo = (values: VideoFormValues) => {
    const classItem = classes.find((item) => item.key === values.classKey);

    if (!classItem) {
      return;
    }

    const parts = Array.from({ length: installmentCount }, (_, index) => {
      const partTitle = form.getFieldValue(["parts", index, "title"])?.trim();

      return {
        installment: index + 1,
        title: partTitle || `${values.videoName} - Part ${index + 1}`,
      };
    });

    setVideos((currentVideos) => [
      ...currentVideos,
      {
        key: `${Date.now()}-${values.videoName}`,
        classKey: classItem.key,
        className: classItem.className,
        subject: values.subject,
        chapterName: values.chapterName?.trim() || undefined,
        topicName: values.topicName?.trim() || undefined,
        videoName: values.videoName.trim(),
        videoFileName: values.videoFile?.[0]?.name,
        description: values.description.trim(),
        parts,
      },
    ]);

    setIsFormVisible(false);
    form.resetFields();
  };

  const removeVideo = (videoKey: string) => {
    setVideos((currentVideos) =>
      currentVideos.filter((video) => video.key !== videoKey),
    );
  };

  const saveNotes = (fileList: any) => {
  if (!selectedVideo) return;

  setVideos((prev) =>
    prev.map((video:any) =>
      video.key === selectedVideo.key
        ? {
            ...video,
            notes: [
              ...(video.notes || []),
              fileList?.[0]?.name,
            ],
          }
        : video
    )
  );

  setNotesOpen(false);
};

const saveMcq = (values: any) => {
  if (!selectedVideo) return;

  const mcq = {
    id: Date.now().toString(),
    question: values.question,
    options: values.answers,
  };

  setVideos((prev) =>
    prev.map((video:any) =>
      video.key === selectedVideo.key
        ? {
            ...video,
            mcqs: [
              ...(video.mcqs || []),
              mcq,
            ],
          }
        : video
    )
  );

  setMcqOpen(false);
};

  const videoColumns: ColumnsType<VideoRecord> = [
    {
      title: "Video",
      dataIndex: "videoName",
      key: "videoName",
      render: (value: string, record) => {
        const category = classes.find((item) => item.key === record.classKey);

        return (
          <Space direction="vertical" size={2}>
            <Text strong>{value}</Text>
            <Text type="secondary">
              {record.className} / {record.subject}
            </Text>
            {category?.bannerFileName && (
              <Tag icon={<FileImageOutlined />}>{category.bannerFileName}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Chapter / Topic",
      key: "chapterTopic",
      render: (_, record) => (
        <Space size={[0, 8]} wrap>
          {record.chapterName && (
            <Tag color="purple" style={{ marginInlineEnd: 0 }}>
              Chapter: {record.chapterName}
            </Tag>
          )}
          {record.topicName && (
            <Tag color="geekblue" style={{ marginInlineEnd: 0 }}>
              Topic: {record.topicName}
            </Tag>
          )}
          {!record.chapterName && !record.topicName && (
            <Text type="secondary">Not added</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Category Access",
      key: "categoryAccess",
      width: 220,
      render: (_, record) => {
        const category = classes.find((item) => item.key === record.classKey);

        if (!category) {
          return <Text type="secondary">Category removed</Text>;
        }

        return category.accessType === "demo" ? (
          <Tag color="green">Demo</Tag>
        ) : (
          <Space direction="vertical" size={2}>
            <Tag color="blue">
              {category.paymentType === "emi" ? "Paid - EMI" : "Paid - Full"}
            </Tag>
            <Text type="secondary">
              Rs. {category.price}
              {category.strikePrice ? (
                <>
                  {" "}
                  <Text delete type="secondary">
                    Rs. {category.strikePrice}
                  </Text>
                </>
              ) : null}
            </Text>
            <Text type="secondary">
              Validity: {formatValidity(category.validityMonths)}
            </Text>
            {category.paymentType === "emi" && (
              <Text type="secondary">{category.installments} installments</Text>
            )}
          </Space>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 320,
      // align: "right",
      render: (_, record) => (
        <Space>
      <Button
        onClick={() => {
          setSelectedVideo(record);
          setNotesOpen(true);
        }}
      >
        Upload Notes
      </Button>

      <Button
        type="primary"
        onClick={() => {
          setSelectedVideo(record);
          setMcqOpen(true);
        }}
      >
        Add MCQ
      </Button>
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => removeVideo(record.key)}
        >
          Delete
        </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      {isFormVisible ? (
        <>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Add Video
            </Title>
            <Text type="secondary">
              Choose a category and subject, then add video details. Access and
              pricing are inherited from the selected category.
            </Text>
          </div>
          <Card style={{ borderRadius: 8 }}>
            <Title level={4} style={{ marginTop: 0 }}>
              Video Details
            </Title>

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={saveVideo}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Category"
                    name="classKey"
                    rules={[
                      { required: true, message: "Please choose a category." },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Choose category"
                      options={classes.map((classItem) => ({
                        label: classItem.className,
                        value: classItem.key,
                      }))}
                      onChange={() => form.setFieldValue("subject", undefined)}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Subject"
                    name="subject"
                    //   rules={[
                    //     { required: true, message: "Please choose a subject." },
                    //   ]}
                  >
                    <Select
                      size="large"
                      placeholder="Choose subject"
                      disabled={!selectedClass}
                      options={subjectOptions}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {selectedClass && (
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={
                    selectedClass.accessType === "demo"
                      ? "This category is demo access"
                      : `This category is paid ${
                          selectedClass.paymentType === "emi"
                            ? `with ${selectedClass.installments} installments`
                            : "with full payment"
                        }`
                  }
                  description={
                    selectedClass.accessType === "paid"
                      ? `Price Rs. ${selectedClass.price}. Validity ${formatValidity(
                          selectedClass.validityMonths,
                        )}.`
                      : "No payment fields are needed for videos in this category."
                  }
                />
              )}

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Chapter name" name="chapterName">
                    <Input
                      size="large"
                      placeholder="Optional: Example: Algebra basics"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item label="Topic name" name="topicName">
                    <Input
                      size="large"
                      placeholder="Optional: Example: Linear equations"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Video name"
                    name="videoName"
                    rules={[
                      { required: true, message: "Please enter a video name." },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Example: Algebra Masterclass"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Video upload"
                    name="videoFile"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeUpload}
                    rules={[
                      {
                        required: true,
                        message: "Please upload a video file.",
                      },
                    ]}
                  >
                    <Upload
                      maxCount={1}
                      accept="video/*"
                      beforeUpload={() => false}
                    >
                      <Button icon={<UploadOutlined />}>Upload video</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter a description." },
                ]}
              >
                <TextArea rows={4} placeholder="What will students learn?" />
              </Form.Item>

              <Divider>Video parts</Divider>
              {selectedCategoryUsesEmi && (
                <Alert
                  type="success"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message="EMI unlock rule"
                  description="Each paid installment unlocks the matching video part from this category."
                />
              )}

              <Row gutter={[16, 16]}>
                {Array.from({ length: installmentCount }, (_, index) => (
                  <Col
                    xs={24}
                    md={selectedCategoryUsesEmi ? 8 : 24}
                    key={index}
                  >
                    <Form.Item
                      label={
                        selectedCategoryUsesEmi
                          ? `Installment ${index + 1} unlocks`
                          : "Video part"
                      }
                      name={["parts", index, "title"]}
                      rules={[
                        {
                          required: true,
                          message: "Please enter video part name.",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder={`Video part ${index + 1}`}
                      />
                    </Form.Item>
                  </Col>
                ))}
              </Row>

              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                >
                  Save video
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setIsFormVisible(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form>
          </Card>
        </>
      ) : (
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
            <Title level={4} style={{ marginTop: 0 }}>
              Video List
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={classes.length === 0}
              onClick={() => openVideoForm()}
            >
              Add video
            </Button>
          </Space>

          {classes.length === 0 && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message="No Courses added yet"
              description="Add a Course before creating videos."
            />
          )}

          {videos.length > 0 ? (
            <Table
              columns={videoColumns}
              dataSource={videos}
              pagination={false}
              expandable={{
                expandedRowRender: (record) => (
                  <Space direction="vertical" size={8}>
                    <Paragraph style={{ marginBottom: 0 }}>
                      {record.description}
                    </Paragraph>
                    <Space size={[0, 8]} wrap>
                      {record.videoFileName && (
                        <Tag icon={<UploadOutlined />}>
                          Video: {record.videoFileName}
                        </Tag>
                      )}
                    </Space>
                    <Space size={[0, 8]} wrap>
                      {record.parts.map((part) => (
                        <Tag key={`${record.key}-${part.installment}`}>
                          Part {part.installment}: {part.title}
                        </Tag>
                      ))}
                    </Space>
                  </Space>
                ),
              }}
              scroll={{ x: 900 }}
            />
          ) : (
            <Empty description="No videos added yet" />
          )}
        </Card>
      )}
      <NotesModal
  open={notesOpen}
  onCancel={() => setNotesOpen(false)}
  onSave={saveNotes}
/>

<McqModal
  open={mcqOpen}
  onCancel={() => setMcqOpen(false)}
  onSave={saveMcq}
/>
    </Space>
  );
}
