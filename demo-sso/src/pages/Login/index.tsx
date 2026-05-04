import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { PORTAL_URL } from '../../utils/portal';
import { getToken } from '../../utils/ssoAuth';

const { Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const onFinish = (values: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    setTimeout(() => {
      const result = login(values.username, values.password);
      if (result.success && result.user) {
        message.success('Đăng nhập thành công');
        const redirect = searchParams.get('redirect');
        if (redirect) {
          // Có redirect param từ app gọi → quay về app đó trực tiếp
          window.location.href = redirect;
        } else {
          // Mặc định: redirect sang Portal kèm SSO token để Portal nhận user.
          // Nếu Portal chưa chạy (localhost:3000 down), browser sẽ ERR_CONNECTION_REFUSED;
          // người dùng có thể quay lại http://localhost:5173/admin để dùng SSO admin.
          const token = getToken();
          const params = new URLSearchParams({
            sso_token: token?.token || '',
            sso_user_id: result.user.id,
            sso_username: result.user.username,
            sso_expires: token?.expiresAt || '',
          });
          window.location.href = `${PORTAL_URL}?${params.toString()}`;
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

          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              background: '#f0f5fa',
              border: '1px dashed #c8d3e0',
              borderRadius: 8,
              fontSize: 12,
              color: '#1B3A5C',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Tài khoản demo</div>
            <div>
              Username: <code style={{ background: '#fff', padding: '1px 6px', borderRadius: 4 }}>AdminDNA</code>
              {' · '}
              Password: <code style={{ background: '#fff', padding: '1px 6px', borderRadius: 4 }}>DNAdemo#2026</code>
            </div>
          </div>

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
