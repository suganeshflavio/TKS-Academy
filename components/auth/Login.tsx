"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { useAdminLoginMutation } from "@/store/features/authApi";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { useEffect } from "react";
import Image from "next/image";

const { Title, Text, Link } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const handleLogin = async (values: { email: string; password: string }) => {
    const email = values.email?.trim();
    const password = values.password?.trim();
    const deviceId = "web"; // You can replace this with a unique device identifier if needed
    try {
      const response = await adminLogin({
        email,
        password,
        deviceId,
      }).unwrap();

      const token =
        response.token ?? response.accessToken ?? response.data?.token ?? response.data?.accessToken;

      if (!token) {
        message.error("Login failed: token not found in response.");
        return;
      }

      dispatch(setCredentials({ token }));
      message.success("Login successful.");
      router.push("/dashboard");
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : "Invalid credentials");
    }
  };

  const adminToken = typeof window !== "undefined" ? sessionStorage.getItem("adminToken") : null;

  useEffect(() => {
    if (adminToken) {
      router.push("/dashboard");
    }
  }, [adminToken, router]);

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
          <Image
            src="/tks_academy_logo.png"
            alt="TKS Academy logo"
            width={100}
            height={50}
            preload
            unoptimized
            style={{
              height: "auto",
              borderRadius: 50,
              margin: "0 auto 18px",
            }}
          />
          {/* <Title level={2} style={{ color: '#40a3d8' }}>
            TKS Academy
          </Title> */}

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
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email.",
              },
            ]}
          >
            <Input
              size="large"
              placeholder="Enter email"
              autoComplete="email"
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
            loading={isLoading}
            style={{
              height: 48,
              fontWeight: 600,
              marginTop: 8,
            }}
          >
            Sign in
          </Button>
        </Form>
        {/* <Text
          style={{
            display: "block",
            marginBottom: 16,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          Already have an account? <Link>Sign up</Link>
        </Text> */}
      </Card>
    </div>
  );
}
