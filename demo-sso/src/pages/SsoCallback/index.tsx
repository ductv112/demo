/**
 * /sso/callback
 *
 * OAuth2-style callback handler.
 * Trong tương lai khi có backend thật, đây là nơi xử lý authorization code flow.
 *
 * Hiện tại (prototype mock):
 *   - Nhận code từ query param (mock)
 *   - Đổi code lấy token (mock — chỉ check session localStorage)
 *   - Redirect về redirect_uri kèm token
 *
 * Query params (nhận vào):
 *   - code          — authorization code (mock)
 *   - state         — CSRF state token (nên validate ở production)
 *   - redirect_uri  — URL app muốn quay về
 *   - client_id     — app đang thực hiện callback
 *   - error         — nếu có lỗi từ SSO
 *   - error_description
 *
 * Client apps gọi flow này như sau:
 *   1. App redirect → /sso/login?client_id=xxx&redirect_uri=https://app/sso/callback
 *   2. User login thành công → SSO redirect về https://app/sso/callback?code=xxx&state=yyy
 *   3. App backend đổi code lấy token (hoặc frontend tự xử lý với mock)
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Spin, Typography, Result, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { checkAuth, validateRedirectUri, registerClient } from '../../utils/ssoAuth';

const { Text } = Typography;
const SSO_LOGIN_PATH = '/sso/login';

type CallbackStatus = 'processing' | 'success' | 'error' | 'invalid';

export default function SsoCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  const code = searchParams.get('code') || '';
  const state = searchParams.get('state') || '';
  const redirectUri = searchParams.get('redirect_uri') || '';
  const clientId = searchParams.get('client_id') || '';
  const error = searchParams.get('error') || '';
  const errorDesc = searchParams.get('error_description') || '';

  useEffect(() => {
    // Trường hợp SSO báo lỗi
    if (error) {
      setStatus('error');
      setErrorMsg(errorDesc || error);
      return;
    }

    // Validate redirect_uri
    if (redirectUri && !validateRedirectUri(redirectUri)) {
      setStatus('invalid');
      setErrorMsg(`redirect_uri không hợp lệ: ${redirectUri}`);
      return;
    }

    // Mock: kiểm tra session hiện tại (thay cho việc đổi code lấy token)
    if (!checkAuth()) {
      setStatus('error');
      setErrorMsg('Phiên đăng nhập đã hết hạn hoặc không hợp lệ');
      setTimeout(() => {
        window.location.href = redirectUri
          ? `${SSO_LOGIN_PATH}?redirect=${encodeURIComponent(redirectUri)}&client_id=${clientId}`
          : SSO_LOGIN_PATH;
      }, 2000);
      return;
    }

    // Session hợp lệ
    if (clientId) registerClient(clientId);
    setStatus('success');

    // Redirect về app sau 1 giây
    setTimeout(() => {
      if (redirectUri) {
        window.location.href = redirectUri;
      } else {
        window.location.href = '/admin';
      }
    }, 1000);
  }, [code, state, redirectUri, clientId, error, errorDesc]);

  if (status === 'error' || status === 'invalid') {
    return (
      <div style={fullscreenStyle}>
        <div style={{ ...cardStyle, maxWidth: 480 }}>
          <Result
            icon={<CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 48 }} />}
            title={status === 'invalid' ? 'Tham số không hợp lệ' : 'Xác thực thất bại'}
            subTitle={errorMsg}
            extra={
              <Button type="primary" onClick={() => window.location.href = SSO_LOGIN_PATH}>
                Đăng nhập lại
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={fullscreenStyle}>
        <div style={cardStyle}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1B3A5C', marginBottom: 8 }}>
            Xác thực thành công
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Đang chuyển về {clientId || 'ứng dụng'}...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div style={fullscreenStyle}>
      <div style={cardStyle}>
        <Spin size="large" style={{ marginBottom: 20 }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1B3A5C', marginBottom: 8 }}>
          Đang xử lý xác thực
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {clientId ? `Ứng dụng: ${clientId}` : 'Vui lòng chờ...'}
        </Text>
        {state && (
          <div style={{ marginTop: 12, fontSize: 11, color: '#bbb' }}>
            state: {state.substring(0, 8)}...
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
  padding: '40px',
  textAlign: 'center',
  maxWidth: 360,
  width: '100%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
};
