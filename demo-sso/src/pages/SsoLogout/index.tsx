/**
 * /sso/logout
 *
 * Endpoint xử lý global logout cho toàn bộ hệ thống SSO.
 *
 * Query params:
 *   - client_id             (optional) — app đang gọi logout
 *   - post_logout_redirect_uri (optional) — nơi redirect sau logout
 *
 * Luồng:
 *   1. Đọc params
 *   2. Xóa SSO session (localStorage token + user + clients)
 *   3. Validate post_logout_redirect_uri theo whitelist
 *   4. Redirect về URI hợp lệ hoặc về /sso/login
 *
 * Client apps gọi bằng cách redirect trình duyệt đến:
 *   http://localhost:5173/sso/logout
 *     ?client_id=pkkq-portal
 *     &post_logout_redirect_uri=http://localhost:3000/dang-nhap
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Typography, Result } from 'antd';
import { LogoutOutlined, WarningOutlined } from '@ant-design/icons';
import { globalLogout, validateRedirectUri, checkAuth } from '../../utils/ssoAuth';

const { Text } = Typography;

const SSO_LOGIN_PATH = '/sso/login';

export default function SsoLogout() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'invalid_redirect' | 'done'>('processing');
  const [redirectTarget, setRedirectTarget] = useState('');

  const clientId = searchParams.get('client_id') || '';
  const postLogoutRedirectUri = searchParams.get('post_logout_redirect_uri') || '';

  useEffect(() => {
    // Bước 1: Dù user đã login hay chưa, vẫn thực hiện clear session
    if (checkAuth()) {
      globalLogout();
    } else {
      // Chưa login → vẫn clear để đảm bảo sạch
      globalLogout();
    }

    // Bước 2: Xác định redirect target
    let target = SSO_LOGIN_PATH;

    if (postLogoutRedirectUri) {
      if (validateRedirectUri(postLogoutRedirectUri)) {
        target = postLogoutRedirectUri;
      } else {
        // URI không hợp lệ → hiện cảnh báo rồi về trang login
        setStatus('invalid_redirect');
        setRedirectTarget(SSO_LOGIN_PATH);
        setTimeout(() => {
          window.location.href = SSO_LOGIN_PATH;
        }, 3000);
        return;
      }
    }

    // Bước 3: Redirect sau 1 giây (cho user thấy màn hình logout)
    setRedirectTarget(target);
    const timer = setTimeout(() => {
      window.location.href = target;
    }, 1200);

    setStatus('done');

    return () => clearTimeout(timer);
  }, [postLogoutRedirectUri]);

  if (status === 'invalid_redirect') {
    return (
      <div style={fullscreenStyle}>
        <Result
          icon={<WarningOutlined style={{ color: '#faad14' }} />}
          title="URI redirect không hợp lệ"
          subTitle={
            <div>
              <Text>URI <code>{postLogoutRedirectUri}</code> không nằm trong danh sách cho phép.</Text>
              <br />
              <Text type="secondary">Đang chuyển về trang đăng nhập...</Text>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div style={fullscreenStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={badgeStyle}>
          <LogoutOutlined style={{ fontSize: 28, color: '#0a1628' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1B3A5C', marginBottom: 6 }}>
            Đang đăng xuất
          </div>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Phiên đăng nhập SSO đã được xóa trên toàn hệ thống
          </Text>
        </div>

        <Spin size="large" />

        <div style={{ marginTop: 24 }}>
          {clientId && (
            <div style={infoRowStyle}>
              <Text type="secondary" style={{ fontSize: 13 }}>Ứng dụng:</Text>
              <Text strong style={{ fontSize: 13 }}>{clientId}</Text>
            </div>
          )}
          <div style={infoRowStyle}>
            <Text type="secondary" style={{ fontSize: 13 }}>Trạng thái:</Text>
            <Text style={{ fontSize: 13, color: '#52c41a' }}>Session đã xóa</Text>
          </div>
          <div style={infoRowStyle}>
            <Text type="secondary" style={{ fontSize: 13 }}>Chuyển về:</Text>
            <Text style={{ fontSize: 13, color: '#1890ff' }}>
              {redirectTarget === SSO_LOGIN_PATH ? 'Trang đăng nhập' : redirectTarget}
            </Text>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: '12px 16px', background: '#f0f2f5', borderRadius: 8, fontSize: 12, color: '#999' }}>
          Doanh nghiệp A — Nền tảng quản trị doanh nghiệp công nghệ
        </div>
      </div>
    </div>
  );
}

const fullscreenStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #0a1628 100%)',
};

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: 16,
  padding: '40px 48px',
  textAlign: 'center',
  maxWidth: 400,
  width: '100%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const badgeStyle: React.CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 16,
  background: 'linear-gradient(135deg, #D4A843, #f0d890)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 20px',
  boxShadow: '0 4px 16px rgba(212,168,67,0.3)',
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '6px 0',
  borderBottom: '1px solid #f0f2f5',
};
