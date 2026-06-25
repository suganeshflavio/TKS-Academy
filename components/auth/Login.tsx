"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

const { Title, Text, Link } = Typography;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (values: { identifier: string; password: string }) => {
    const email = values.identifier?.trim();
    const password = values.password?.trim();

    if (email === "TKS@gmail.com" && password === "TkS@12345") {
      router.push("/dashboard");
      return;
    }

    message.error("Invalid credentials. Please use the approved login details.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {/* <Image
            src="/tks-academy-logo.svg"
            alt="TKS Academy logo"
            width={180}
            height={72}
            preload
            unoptimized
            style={{
              height: "auto",
              margin: "0 auto 18px",
            }}
          /> */}
          <Title level={2} style={{ color: '#40a3d8' }}>
            TKS Academy
          </Title>

          <Title level={4} style={{ marginBottom: 8 }}>
            Sign in with your account to continue
          </Title>

          {/* <Text type="secondary">Sign in with your account to continue</Text> */}
        </div>

        <Form
          layout="vertical"
          requiredMark={false}
          onFinish={handleLogin}
          autoComplete="on"
        >
          <Form.Item
            label="Username or email"
            name="identifier"
            rules={[
              {
                required: true,
                message: "Please enter your username or email.",
              },
              {
                validator: (_, value: string | undefined) => {
                  if (
                    !value ||
                    !value.includes("@") ||
                    emailPattern.test(value)
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Please enter a valid email address."),
                  );
                },
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter username or email"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password.",
              },
              {
                pattern: passwordPattern,
                message:
                  "Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.",
              },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            type="primary"
            size="large"
            block
            htmlType="submit"
            style={{
              height: 48,
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            Sign in
          </Button>
        </Form>
        <Text
          style={{
            display: "block",
            marginBottom: 16,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Already have an account? <Link>Sign up</Link>
        </Text>
      </Card>
    </div>
  );
}
