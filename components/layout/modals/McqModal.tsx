"use client";

import {
  Form,
  Input,
  Modal,
  Switch,
  Space,
} from "antd";

interface Props {
  open: boolean;
  onCancel: () => void;
  onSave: (values: any) => void;
}

export default function McqModal({
  open,
  onCancel,
  onSave,
}: Props) {
  const [form] = Form.useForm();

  const answers = Form.useWatch("answers", form);

  return (
    <Modal
      title="Add MCQ"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSave}
      >
        <Form.Item
          label="Question"
          name="question"
          rules={[
            {
              required: true,
              message: "Enter question",
            },
          ]}
        >
          <Input />
        </Form.Item>

        {[0, 1, 2, 3].map((index) => (
          <Space
            key={index}
            style={{
              display: "flex",
              marginBottom: 12,
            }}
          >
            <Form.Item
              name={["answers", index, "answer"]}
              style={{ flex: 1 }}
              rules={[
                {
                  required: true,
                  message: "Enter answer",
                },
              ]}
            >
              <Input
                placeholder={`Answer ${index + 1}`}
              />
            </Form.Item>

            <Form.Item
              name={["answers", index, "isCorrect"]}
              valuePropName="checked"
            >
              <Switch
                onChange={(checked) => {
                  if (checked) {
                    const updated =
                      answers?.map(
                        (item: any, idx: number) => ({
                          ...item,
                          isCorrect: idx === index,
                        })
                      ) || [];

                    form.setFieldValue(
                      "answers",
                      updated
                    );
                  }
                }}
              />
            </Form.Item>
          </Space>
        ))}
      </Form>
    </Modal>
  );
}