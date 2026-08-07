"use client";

import { useEffect, useMemo } from "react";
import {
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  useCreateTestMutation,
  useDeleteTestMutation,
  useGetTestsQuery,
} from "@/store/features/testsApi";

const { Text, Title } = Typography;

type McqQuestionDraft = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation: string;
};

type McqFormValues = {
  testName: string;
  marksPerQuestion: number;
  questions: McqQuestionDraft[];
};

interface Props {
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly onSave?: (values: McqFormValues) => void;
  readonly videoId?: string;
  readonly videoName?: string;
}

const createDefaultQuestion = (): McqQuestionDraft => ({
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  explanation: "",
});

export default function McqModal({ open, onCancel, onSave, videoId, videoName }: Props) {
  const [form] = Form.useForm<McqFormValues>();
  const [createTest, { isLoading: isCreating }] = useCreateTestMutation();
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();
  const { data, isFetching, refetch } = useGetTestsQuery(
    videoId ? { page: 1, limit: 50, videoId } : skipToken,
  );

  const tests = useMemo(() => data?.tests ?? [], [data]);

  useEffect(() => {
    if (!open) {
      return;
    }

    form.resetFields();
    form.setFieldsValue({
      testName: "",
      marksPerQuestion: 2,
      questions: [createDefaultQuestion()],
    });
  }, [form, open]);

  const handleFinish = async (values: McqFormValues) => {
    if (!videoId) {
      message.error("Select a video before creating a test.");
      return;
    }

    const questions = (values.questions ?? [])
      .map((question) => ({
        ...question,
        question: question.question?.trim(),
        optionA: question.optionA?.trim(),
        optionB: question.optionB?.trim(),
        optionC: question.optionC?.trim(),
        optionD: question.optionD?.trim(),
        correctOption: question.correctOption?.trim(),
        explanation: question.explanation?.trim(),
      }))
      .filter((question) => question.question);

    if (questions.length === 0) {
      message.error("Add at least one question to create the test.");
      return;
    }

    try {
      await createTest({
        videoId,
        testName: values.testName.trim(),
        marksPerQuestion: values.marksPerQuestion ?? 2,
        questions,
      }).unwrap();

      message.success("Test created successfully.");
      onSave?.(values);
      form.resetFields();
      await refetch();
    } catch (error: unknown) {
      message.error((error as Error)?.message || "Unable to create test.");
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await deleteTest(testId).unwrap();
      message.success("Test deleted successfully.");
      await refetch();
    } catch (error: unknown) {
      message.error((error as Error)?.message || "Unable to delete test.");
    }
  };

  return (
    <Modal
      title={videoName ? `Manage Test for ${videoName}` : "Manage Test"}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      width={980}
      footer={null}
      destroyOnHidden
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            <Form.Item
              label="Test Name"
              name="testName"
              rules={[{ required: true, message: "Enter a test name" }]}
            >
              <Input placeholder="Flutter Basics Test" />
            </Form.Item>

            <Form.Item
              label="Marks per question"
              name="marksPerQuestion"
              rules={[{ required: true, message: "Enter marks" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <div>
                {fields.map((field, index) => (
                  <Card key={field.key} size="small" style={{ marginBottom: 12 }}>
                    <Space align="center" style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      <Text strong>Question {index + 1}</Text>
                      {fields.length > 1 ? (
                        <Button danger type="text" icon={<DeleteOutlined />} onClick={() => remove(field.name)}>
                          Remove
                        </Button>
                      ) : null}
                    </Space>

                    <Form.Item
                      label="Question"
                      name={[field.name, "question"]}
                      rules={[{ required: true, message: "Enter question" }]}
                    >
                      <Input.TextArea rows={2} placeholder="What is the main language used in Flutter?" />
                    </Form.Item>

                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                      <Form.Item name={[field.name, "optionA"]} label="Option A" rules={[{ required: true, message: "Enter option A" }]}>
                        <Input placeholder="Java" />
                      </Form.Item>
                      <Form.Item name={[field.name, "optionB"]} label="Option B" rules={[{ required: true, message: "Enter option B" }]}>
                        <Input placeholder="Dart" />
                      </Form.Item>
                      <Form.Item name={[field.name, "optionC"]} label="Option C" rules={[{ required: true, message: "Enter option C" }]}>
                        <Input placeholder="Python" />
                      </Form.Item>
                      <Form.Item name={[field.name, "optionD"]} label="Option D" rules={[{ required: true, message: "Enter option D" }]}>
                        <Input placeholder="Kotlin" />
                      </Form.Item>
                    </div>

                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                      <Form.Item name={[field.name, "correctOption"]} label="Correct option" rules={[{ required: true, message: "Select correct answer" }]}>
                        <Select
                          options={[
                            { label: "A", value: "A" },
                            { label: "B", value: "B" },
                            { label: "C", value: "C" },
                            { label: "D", value: "D" },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item name={[field.name, "explanation"]} label="Explanation">
                        <Input.TextArea rows={2} placeholder="Explain why this is correct" />
                      </Form.Item>
                    </div>
                  </Card>
                ))}

                <Button icon={<PlusOutlined />} onClick={() => add(createDefaultQuestion())}>
                  Add another question
                </Button>
              </div>
            )}
          </Form.List>

          <Divider />

          <Space>
            <Button onClick={() => {
              form.resetFields();
              onCancel();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              Create Testsadas
            </Button>
          </Space>
        </Form>

        <Divider />

        <div>
          <Title level={5} style={{ marginBottom: 8 }}>Existing Tests</Title>
          {isFetching ? (
            <Text type="secondary">Loading tests...</Text>
          ) : tests.length === 0 ? (
            <Empty description="No tests created for this video yet." />
          ) : (
            <Space direction="vertical" style={{ width: "100%" }}>
              {tests.map((test) => (
                <Card key={test.id} size="small">
                  <Space align="center" style={{ display: "flex", justifyContent: "space-between", width: "100%" }} wrap>
                    <div>
                      <Text strong>{test.testName ?? "Untitled Test"}</Text>
                      <div>
                        <Text type="secondary">
                          Questions: {test._count?.questions ?? test.questions?.length ?? 0} • Marks: {test.marksPerQuestion ?? 1}
                        </Text>
                      </div>
                    </div>
                    <Button danger icon={<DeleteOutlined />} loading={isDeleting} onClick={() => handleDeleteTest(test.id)}>
                      Delete
                    </Button>
                  </Space>
                </Card>
              ))}
            </Space>
          )}
        </div>
      </Space>
    </Modal>
  );
}
