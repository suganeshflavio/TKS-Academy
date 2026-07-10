"use client";

import { Modal, Form, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

type NoteFile = {
  uid: string;
  name: string;
};

type NotesFormValues = {
  notes: NoteFile[];
};

interface Props {
  readonly open: boolean;
  readonly onCancel: () => void;
  readonly onSave: (file: NoteFile[]) => void;
}

export default function NotesModal({
  open,
  onCancel,
  onSave,
}: Props) {
  const [form] = Form.useForm<NotesFormValues>();

  return (
    <Modal
      title="Upload Notes"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
    >
      <Form
        form={form}
        onFinish={(values) => {
          onSave(values.notes);
        }}
      >
        <Form.Item
          name="notes"
          label="PDF Notes"
          valuePropName="fileList"
          rules={[
            {
              required: true,
              message: "Please upload PDF",
            },
          ]}
        >
          <Upload
            maxCount={1}
            accept=".pdf"
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>
              Upload PDF
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}