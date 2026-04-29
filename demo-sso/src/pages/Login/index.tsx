import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Typography } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  AppstoreOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/UserContext';

const { Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const onFinish = (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    setTimeout(() => {
      const result = login(values.username, values.password);
      if (result.success && result.user) {
        const redirect = searchParams.get('redirect');
        if (redirect) {
          // Có redirect param từ app gọi → quay về app đó trực tiếp
          message.success('Đăng nhập thành công');
          window.location.href = redirect;
        } else {
          // Không có redirect → về "/" để RootRedirect xử lý (admin/portal)
          // Dùng navigate nội bộ, tránh double redirect với AuthLayout
          message.success('Đăng nhập thành công');
          navigate('/', { replace: true });
        }
      } else {
        message.error(result.error || 'Đăng nhập thất bại');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="login-container">
      {/* Left - Branding with background image */}
      <div className="login-branding">
        <div className="login-branding-bg" />
        <div className="login-branding-content">
          <div className="login-logo-title">DOANH NGHIỆP A</div>
          <h1>Nền tảng đăng nhập tập trung (SSO)</h1>
          <h2>
            Nền tảng quản trị doanh nghiệp công nghệ
          </h2>
          <div className="login-features">
            <div className="login-feature-item">
              <div className="login-feature-icon"><SafetyCertificateOutlined /></div>
              <span>Xác thực tập trung cho 16 phần mềm nghiệp vụ</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon"><TeamOutlined /></div>
              <span>Phân quyền chi tiết theo vai trò và đơn vị</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon"><AppstoreOutlined /></div>
              <span>Truy cập nhanh từ Cổng thông tin nội bộ</span>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon"><AuditOutlined /></div>
              <span>Giám sát phiên và nhật ký truy cập toàn hệ thống</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="login-form-side">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h3>Đăng nhập</h3>
            <p>Nhập thông tin tài khoản để truy cập hệ thống</p>
          </div>

          <Form
            name="login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#1B3A5C' }} />}
                placeholder="Tên đăng nhập"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#1B3A5C' }} />}
                placeholder="Mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                </Form.Item>
                <a style={{ color: '#1B3A5C', fontSize: 13 }}>Quên mật khẩu?</a>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Text type="secondary" style={{ fontSize: 11 }}>
              Doanh nghiệp A — Nền tảng quản trị doanh nghiệp công nghệ
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
