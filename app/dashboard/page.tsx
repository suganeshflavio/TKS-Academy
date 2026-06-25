"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  ReadOutlined,
  // FormOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  // SettingOutlined,
  UserOutlined,
  CreditCardOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import CoursePage from "@/components/layout/Course";
import Videos from "@/components/layout/Videos";
import type { ClassRecord, VideoRecord } from "@/components/layout/types";
import {
  Avatar,
  Breadcrumb,
  Button,
  Drawer,
  Dropdown,
  Flex,
  Grid,
  Layout,
  Menu,
  Segmented,
  theme,
} from "antd";

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("Course Details", "sub1", <ReadOutlined />, [
    getItem("Add Course", "1", <ReadOutlined />),
    getItem("Add Video", "2", <VideoCameraAddOutlined />),
    getItem("Add Mcq", "3", <CheckCircleOutlined />),
  ]),
  // getItem("Claim Form", "1", <FormOutlined />),
  // getItem("Claim Status", "2", <FileOutlined />),
  //   getItem('User', 'sub1', <UserOutlined />, [
  //     getItem('Tom', '3'),
  //     getItem('Bill', '4'),
  //     getItem('Alex', '5'),
  //   ]),
  // getItem("Approval Section", "3", <CheckCircleOutlined />),
  getItem("User Details", "sub2", <UserOutlined />, [
    getItem("User List", "4", <UserOutlined />),
    getItem("Payment List", "5", <CreditCardOutlined />),
  ]),
];

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [selectedMenu, setSelectedMenu] = useState("1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [claimsData, setClaimsData] = useState<any[]>([]);
  const [settingData, setsettingData] = useState([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [videos, setVideos] = useState<VideoRecord[]>([]);

  const isMobile = !screens.lg;
  const renderContent = () => {
    switch (selectedMenu) {
      case "1":
        return <CoursePage classes={classes} setClasses={setClasses} />;

      case "2":
        return (
          <Videos classes={classes} videos={videos} setVideos={setVideos} />
        );

      // case "3":
      //   return <ApprovalSection claimsData={claimsData} refunction={fetchClaims} />;

      // case "4":
      //   return <Uploaduserlist />;

      // case "5":
      //   return <Setapprovelimit settingData={settingData} refunction={fetchSavesetting} />;

      default:
        return <CoursePage classes={classes} setClasses={setClasses} />;
    }
  };
  const userMenu = {
    items: [
      {
        key: "1",
        label: "Profile",
      },
      {
        key: "2",
        label: "Logout",
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "2") {
        console.log("Logout");
      }
    },
  };

  const SidebarContent = (
    <>
      <div
        style={{
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <img
          src={collapsed ? "/tks-academy-logo.svg" : "/tks-academy-logo.svg"}
          alt="logo"
          style={{
            maxWidth: collapsed ? 70 : 120,
            height: "auto",
            transition: "all 0.3s",
          }}
          // width={32}
          // height={32}
        />

        {/* {!collapsed && (
        <span style={{ marginLeft: 10 }}>
          Expense Portal
        </span>
      )} */}
      </div>

      <Menu
        theme="dark"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={items}
        selectedKeys={[selectedMenu]}
        onClick={({ key }) => setSelectedMenu(key)}
      />
    </>
  );

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // const currentYear = new Date().getFullYear();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          {SidebarContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          bodyStyle={{
            padding: 0,
          }}
          width={250}
        >
          <Menu
            mode="inline"
            items={items}
            selectedKeys={[selectedMenu]}
            style={{ border: "none" }}
            onClick={({ key }) => {
              setSelectedMenu(key);
              setMobileOpen(false);
            }}
          />
        </Drawer>
      )}

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Left Side */}
          <div>
            {isMobile && (
              <Button
                type="text"
                icon={
                  mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />
                }
                onClick={() => setMobileOpen(!mobileOpen)}
              />
            )}
          </div>

          {/* Right Side */}
          <Dropdown menu={userMenu} trigger={["click"]}>
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Avatar icon={<UserOutlined />} />

              {!isMobile && <span>John Doe</span>}
            </div>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 24,
              minHeight: 630,
            }}
          >
            {/* Content Here */}
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
