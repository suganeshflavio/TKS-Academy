"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch,
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
} from "@ant-design/icons";
import type { AccessType, ClassRecord, PaymentType } from "./types";

const { Title, Text } = Typography;

type UploadValue = {
  name?: string;
}[];

type ClassFormValues = {
  className: string;
  subjectName: string;
  banner?: UploadValue;
  accessType: AccessType;
  paymentType?: PaymentType;
  price?: number;
  strikePrice?: number;
  validityMonths?: number;
  installments?: number;
};

type CategoriesProps = {
  classes: ClassRecord[];
  setClasses: React.Dispatch<React.SetStateAction<ClassRecord[]>>;
};

const validityOptions = [
  { label: "1 month", value: 1 },
  { label: "2 months", value: 2 },
  { label: "3 months", value: 3 },
  { label: "6 months", value: 6 },
  { label: "12 months", value: 12 },
  { label: "Lifetime", value: 0 },
];

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

export default function Course({ classes, setClasses }: CategoriesProps) {
  const [form] = Form.useForm<ClassFormValues>();
  const [subjects, setSubjects] = useState<string[]>([]);

  const subjectName = Form.useWatch("subjectName", form);
  const className = Form.useWatch("className", form);
  const accessType = Form.useWatch("accessType", form);
  const paymentType = Form.useWatch("paymentType", form);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const showPaidFields = accessType === "paid";
  const showEmiFields = accessType === "paid" && paymentType === "emi";
  const canSaveClass = Boolean(className?.trim()) && subjects.length > 0;
  const enableEmi = Form.useWatch("enableEmi", form);
  const price = Form.useWatch("price", form);
  const validityMonths = Form.useWatch("installments", form);
  const calculateInstallments = (totalPrice: number, months: number) => {
    if (!months || months <= 1) {
      return [totalPrice];
    }

    // First installment rounded up to nearest 500
    const firstInstallment = Math.ceil(totalPrice / months / 500) * 500;

    const remaining = totalPrice - firstInstallment;

    const installmentAmount = Math.floor(remaining / (months - 1));

    const installments = [
      firstInstallment,
      ...Array(months - 1).fill(installmentAmount),
    ];

    // Fix remainder
    const total = installments.reduce((a, b) => a + b, 0);

    installments[installments.length - 1] += totalPrice - total;

    return installments;
  };

  const installmentData =
    enableEmi && price && validityMonths
      ? calculateInstallments(price, validityMonths)
      : [];

  const openVideoForm = (classKey?: string) => {
    setIsFormVisible(true);
    form.resetFields();
    // form.setFieldsValue({ classKey });
  };

  const addSubject = () => {
    const nextSubject = form.getFieldValue("subjectName")?.trim();

    if (!nextSubject) {
      form.setFields([
        {
          name: "subjectName",
          errors: ["Please enter a subject."],
        },
      ]);
      return;
    }

    const isDuplicate = subjects.some(
      (subject) => subject.toLowerCase() === nextSubject.toLowerCase(),
    );

    if (isDuplicate) {
      form.setFields([
        {
          name: "subjectName",
          errors: ["This subject is already added."],
        },
      ]);
      return;
    }

    setSubjects((currentSubjects) => [...currentSubjects, nextSubject]);
    form.setFieldValue("subjectName", "");
    form.setFields([{ name: "subjectName", errors: [] }]);
  };

  const removePendingSubject = (subjectToRemove: string) => {
    setSubjects((currentSubjects) =>
      currentSubjects.filter((subject) => subject !== subjectToRemove),
    );
  };

  const removeSavedClass = (classKey: string) => {
    setClasses((currentClasses) =>
      currentClasses.filter((classItem) => classItem.key !== classKey),
    );
  };

  const removeSavedSubject = (classKey: string, subjectToRemove: string) => {
    setClasses((currentClasses) =>
      currentClasses.map((classItem) =>
        classItem.key === classKey
          ? {
            ...classItem,
            subjects: classItem?.subjects?.filter(
              (subject) => subject !== subjectToRemove,
            ),
          }
          : classItem,
      ),
    );
  };

  const saveClass = (values: ClassFormValues) => {
    const nextClassName = values.className?.trim();
    console.log("values", values);

    if (
      !nextClassName
      // || subjects.length === 0
    ) {
      return;
    }

    setClasses((currentClasses) => [
      ...currentClasses,
      {
        key: `${Date.now()}-${nextClassName}`,
        className: nextClassName,
        subjects: subjects ?? [],
        bannerFileName: values.banner?.[0]?.name,
        accessType: values.accessType,
        paymentType:
          values.accessType === "paid" ? values.paymentType : undefined,
        price: values.accessType === "paid" ? values.price : undefined,
        strikePrice:
          values.accessType === "paid" ? values.strikePrice : undefined,
        validityMonths:
          values.accessType === "paid" ? values.validityMonths : undefined,
        installments:
          values.accessType === "paid" && values.paymentType === "emi"
            ? values.installments
            : undefined,
      },
    ]);

    setSubjects([]);
    form.resetFields();
    setIsFormVisible(false);
    form.setFieldsValue({
      accessType: "demo",
      paymentType: "full",
      installments: 1,
    });
  };

  const columns: ColumnsType<ClassRecord> = [
    {
      title: "Course",
      dataIndex: "className",
      key: "className",
      width: 180,
      render: (value: string, record) => (
        <Space direction="vertical" size={2}>
          <Text strong>{value}</Text>
          {record.bannerFileName && (
            <Tag icon={<FileImageOutlined />}>{record.bannerFileName}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      key: "subjects",
      render: (classSubjects: string[], record) =>
        classSubjects.length > 0 ? (
          <Space size={[0, 8]} wrap>
            {classSubjects.map((subject) => (
              <Tag
                key={subject}
                closable
                onClose={(event) => {
                  event.preventDefault();
                  removeSavedSubject(record.key, subject);
                }}
                style={{ marginInlineEnd: 0 }}
              >
                {subject}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">No subjects</Text>
        ),
    },
    {
      title: "Access",
      key: "access",
      width: 220,
      render: (_, record) =>
        record.accessType === "demo" ? (
          <Tag color="green">Demo</Tag>
        ) : (
          <Space direction="vertical" size={2}>
            <Tag color="blue">
              {record.paymentType === "emi" ? "Paid - EMI" : "Paid - Full"}
            </Tag>
            <Text type="secondary">
              Rs. {record.price}
              {record.strikePrice ? (
                <>
                  {" "}
                  <Text delete type="secondary">
                    Rs. {record.strikePrice}
                  </Text>
                </>
              ) : null}
            </Text>
            <Text type="secondary">
              {formatValidity(record.validityMonths)}
            </Text>
            {record.paymentType === "emi" && (
              <Text type="secondary">{record.installments} installments</Text>
            )}
          </Space>
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 110,
      align: "right",
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => removeSavedClass(record.key)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      {isFormVisible ? (
        <>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Add Course
            </Title>

            <Text type="secondary">
              Create a Course, upload its banner, attach subjects, and configure
              its access.
            </Text>
          </div>

          <Card style={{ borderRadius: 8 }}>
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              initialValues={{
                accessType: "demo",
                paymentType: "full",
                installments: 1,
              }}
              onFinish={saveClass}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Course name"
                    name="className"
                    rules={[
                      {
                        required: true,
                        message: "Please enter a Course name.",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="Example: Class 10" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Course banner"
                    name="banner"
                    valuePropName="fileList"
                    getValueFromEvent={normalizeUpload}
                    rules={[
                      {
                        required: true,
                        message: "Please upload a Course banner.",
                      },
                    ]}
                  >
                    <Upload
                      listType="picture"
                      maxCount={1}
                      accept="image/*"
                      beforeUpload={() => false}
                    >
                      <Button icon={<FileImageOutlined />}>
                        Upload banner
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Subject" name="subjectName">
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    size="large"
                    placeholder={
                      subjects.length > 0
                        ? "Add another subject"
                        : "Example: Mathematics"
                    }
                    prefix={
                      subjects.length > 0 ? (
                        <Space size={[4, 4]} wrap>
                          {subjects.map((subject) => (
                            <Tag
                              key={subject}
                              closable
                              onClose={(event) => {
                                event.preventDefault();
                                removePendingSubject(subject);
                              }}
                              style={{ marginInlineEnd: 0 }}
                            >
                              {subject}
                            </Tag>
                          ))}
                        </Space>
                      ) : null
                    }
                    onPressEnter={(event) => {
                      event.preventDefault();
                      addSubject();
                    }}
                  />
                  <Button
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={addSubject}
                    disabled={!subjectName?.trim()}
                  >
                    Add subject
                  </Button>
                </Space.Compact>
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Access"
                    name="accessType"
                    rules={[
                      { required: true, message: "Please choose access type." },
                    ]}
                  >
                    <Radio.Group
                      optionType="button"
                      buttonStyle="solid"
                      onChange={(e) => {
                        if (e.target.value === "paid") {
                          form.setFieldValue("paymentType", "full");
                        } else {
                          form.setFieldsValue({
                            paymentType: undefined,
                            price: undefined,
                            strikePrice: undefined,
                            validityMonths: undefined,
                            installments: undefined,
                          });
                        }
                      }}
                      options={[
                        { label: "Demo", value: "demo" },
                        { label: "Paid", value: "paid" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                {showPaidFields && (
                  // <Col xs={24} md={12}>
                  //   <Form.Item
                  //     label="Payment mode"
                  //     name="paymentType"
                  //     rules={[
                  //       {
                  //         required: true,
                  //         message: "Please choose payment mode.",
                  //       },
                  //     ]}
                  //   >
                  //     <Radio.Group
                  //       optionType="button"
                  //       buttonStyle="solid"
                  //       options={[
                  //         { label: "Full payment", value: "full" },
                  //         { label: "EMI", value: "emi" },
                  //       ]}
                  //       onChange={(e) => {
                  //         if (e.target.value === "full") {
                  //           form.setFieldValue("installments", undefined);
                  //         }
                  //       }}
                  //     />
                  //   </Form.Item>
                  // </Col>
                  <Form.Item
                    label="Enable EMI"
                    name="enableEmi"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Switch />
                  </Form.Item>
                )}
              </Row>

              {showPaidFields && (
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Price"
                      name="price"
                      rules={[
                        { required: true, message: "Please enter price." },
                      ]}
                    >
                      <InputNumber
                        size="large"
                        min={0}
                        prefix="₹."
                        style={{ width: "100%" }}
                        placeholder="499"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item label="Strike out price" name="strikePrice">
                      <InputNumber
                        size="large"
                        min={0}
                        prefix="₹."
                        style={{ width: "100%" }}
                        placeholder="999"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Validity after payment"
                      name="validityMonths"
                      rules={[
                        { required: true, message: "Please choose validity." },
                      ]}
                    >
                      <Select
                        size="large"
                        placeholder="Choose validity"
                        options={validityOptions}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}

              {enableEmi && (
                <Form.Item
                  label="Installments"
                  name="installments"
                  rules={[
                    {
                      required: true,
                      message: "Please enter installment count.",
                    },
                  ]}
                >
                  <InputNumber
                    size="large"
                    min={1}
                    max={12}
                    style={{ width: 220 }}
                    addonAfter="video parts"
                  />
                </Form.Item>
              )}
              {enableEmi && (
                <Table
                  pagination={false}
                  columns={[
                    {
                      title: "Month",
                      render: (_, __, index) => `Installment ${index + 1}`,
                    },
                    {
                      title: "Amount",
                      dataIndex: "amount",
                      render: (v) => `₹${v}`,
                    },
                  ]}
                  dataSource={installmentData.map((amount, index) => ({
                    key: index,
                    amount,
                  }))}
                />
              )}
              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                // disabled={!canSaveClass}
                >
                  Add Course
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
              Courses List
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              // disabled={classes.length === 0}
              onClick={() => openVideoForm()}
            >
              Add Course
            </Button>
          </Space>
          {classes.length > 0 ? (
            <Table
              columns={columns}
              dataSource={classes}
              pagination={false}
              scroll={{ x: 840 }}
            />
          ) : (
            <Empty description="No Courses added yet" />
          )}
        </Card>
      )}
    </Space>
  );
}
