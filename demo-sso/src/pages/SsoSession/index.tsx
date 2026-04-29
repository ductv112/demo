/**
 * /sso/session
 *
 * Endpoint kiểm tra session SSO. Client app gọi để biết user đã login chưa.
 *
 * Query params:
 *   - redirect_uri   — URL app muốn nhận token sau khi xác nhận session
 *   - client_id      — app đang hỏi
 *
 * Luồng:
 *   - Đã login  → ghi nhận client, redirect về redirect_uri kèm token mock
 *   - Chưa login → redirect về /sso/login?redirect=redirect_uri
 *
 * Client apps sử dụng flow này để implement "auto-login":
 *   1. Khi load app, redirect đến /sso/session?client_id=xxx&redirect_uri=https://app/callback
 *   2. Nếu SSO session còn hiệu lực → nhận token, tự động đăng nhập
 *   3. Nếu không → được đẩy về trang login SSO
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Typography } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import {
  checkAuth,
  getCurrentUser,
  getToken,
  validateRedirectUri,
  registerClient,
} from '../../utils/ssoAuth';

const { Text } = Typography;

const SSO_LOGIN_PATH = '/sso/login';

export default function SsoSession() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Đang kiểm tra phiên đăng nhập...');

  const redirectUri = searchParams.get('redirect_uri') || '';
  const clientId = searchParams.get('client_id') || '';

  useEffect(() => {
    const isAuth = checkAuth();

    if (!isAuth) {
      // Chưa login → đẩy về login, kèm redirect_uri để sau login quay lại
      setMessage('Chưa đăng nhập. Đang chuyển đến trang đăng nhập...');
      const loginUrl = redirectUri
        ? `${SSO_LOGIN_PATH}?redirect=${encodeURIComponent(redirectUri)}&client_id=${encodeURIComponent(clientId)}`
        : `${SSO_LOGIN_PATH}?client_id=${encodeURIComponent(clientId)}`;

      setTimeout(() => {
        window.location.href = loginUrl;
      }, 800);
      return;
    }

    // Đã login → validate redirect_uri
    if (!redirectUri) {
      setMessage('Không có redirect_uri. Đang chuyển về trang quản trị...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 800);
      return;
    }

    if (!validateRedirectUri(redirectUri)) {
      setMessage('redirect_uri không hợp lệ. Đang chuyển về trang đăng nhập...');
      setTimeout(() => {
        window.location.href = SSO_LOGIN_PATH;
      }, 1500);
      return;
    }

    // Ghi nhận client vào danh sách SSO session
    if (clientId) registerClient(clientId);

    const user = getCurrentUser();
    const token = getToken();

    setMessage(`Session hợp lệ. Đang chuyển về ${clientId || 'ứng dụng'}...`);

    // Redirect về app kèm token (mock) trong query param
    // Production thực tế sẽ dùng short-lived authorization code thay vì token trực tiếp
    const url = new URL(redirectUri);
    url.searchParams.set('sso_token', token?.token || '');
    url.searchParams.set('sso_user_id', user?.id || '');
    url.searchParams.set('sso_username', user?.username || '');
    url.searchParams.set('sso_expires', token?.expiresAt || '');

    setTimeout(() => {
      window.location.href = url.toString();
    }, 600);
  }, [redirectUri, clientId]);

  return (
    <div style={fullscreenStyle}>
      <div style={cardStyle}>
        <div style={badgeStyle}>
          <SafetyCertificateOutlined style={{ fontSize: 28, color: '#0a1628' }} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1B3A5C', marginBottom: 8 }}>
          SSO — Kiểm tra phiên đăng nhập
        </div>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
          {message}
        </Text>
        <Spin />
        {clientId && (
          <div style={{ marginTop: 16, fontSize: 12, color: '#999' }}>
            Ứng dụng: <strong>{clientId}</strong>
          </div>
        )}
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
  padding: '36px 40px',
  textAlign: 'center',
  maxWidth: 360,
  width: '100%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};

const badgeStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 14,
  background: 'linear-gradient(135deg, #D4A843, #f0d890)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px',
};
