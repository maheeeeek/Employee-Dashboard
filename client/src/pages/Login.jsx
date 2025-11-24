import React, { useState } from "react";
import { Form, Input, Button, Typography, message, Alert, Card } from "antd";

const { Title } = Typography;

const Login = ({ onSuccess }) => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const API_URL = "http://localhost:4000/api/auth";

  const onFinish = async (values) => {
    setLoading(true);
    setApiError("");

    try {
      const endpoint =
        mode === "login" ? `${API_URL}/login` : `${API_URL}/register`;

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || "Something went wrong");
        return;
      }

      message.success(
        mode === "login"
          ? "Logged in successfully!"
          : "Account created successfully!"
      );

      if (mode === "register") {
        setMode("login");
        return;
      }

      // Call the onSuccess callback passed from App
      if (props.onSuccess) {
        props.onSuccess();
      }

      if (mode === "register") {
        setMode("login");
        return;
      }


      // Call parent callback if provided
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload(); // or better, use proper routing
      }
    } catch (err) {
      setApiError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });
      message.success("Logged out");
    } catch (err) {
      message.error("Unable to logout");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <Card style={{ width: 400, padding: "20px" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          {mode === "login" ? "Login" : "Create Account"}
        </Title>

        {apiError && (
          <Alert
            message={apiError}
            type="error"
            showIcon
            style={{ marginBottom: "15px" }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input placeholder="your@email.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Password is required" },
              { min: 6, message: "Minimum 6 characters" },
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>

          {mode === "register" && (
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Name is required" },
                { min: 3, message: "Name must be at least 3 characters long" },
              ]}
            >
              <Input placeholder="John Doe" />
            </Form.Item>
          )}

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ marginTop: "10px" }}
          >
            {mode === "login" ? "Login" : "Create Account"}
          </Button>
        </Form>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          {mode === "login" ? (
            <p>
              New here?{" "}
              <span
                style={{ color: "#1677ff", cursor: "pointer" }}
                onClick={() => {
                  setApiError("");
                  setMode("register");
                }}
              >
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <span
                style={{ color: "#1677ff", cursor: "pointer" }}
                onClick={() => {
                  setApiError("");
                  setMode("login");
                }}
              >
                Login
              </span>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
