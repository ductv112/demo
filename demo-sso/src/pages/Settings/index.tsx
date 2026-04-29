import { Card, Form, InputNumber, Switch, Button, Typography, Row, Col, Divider, message } from 'antd';
import {
  SettingOutlined,
  LockOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { SystemSettings } from '../../types';

const { Title, Text } = Typography;

const defaultSettings: SystemSettings = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: false,
  sessionTimeout: 480,
  maxLoginAttempts: 3,
  lockDuration: 30,
  twoFactorEnabled: false,
};

export default function Settings() {
  const [form] = Form.useForm();

  const onSave = () => {
    message.success('Đã lưu cấu hình hệ thống');
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20, color: '#1B3A5C' }}>Cấu hình hệ thống</Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={defaultSettings}
        onFinish={onSave}
      >
        <Row gutter={[16, 16]}>
          {/* Password Policy */}
          <Col xs={24} lg={12}>
            <Card
              className="section-card"
              title={
                <span>
                  <span className="card-title-icon" style={{ background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', color: '#fff' }}>
                    <LockOutlined />
                  </span>
                  Chính sách mật khẩu
                </span>
              }
            >
              <Form.Item label="Độ dài tối thiểu" name="passwordMinLength">
                <InputNumber min={6} max={20} addonAfter="ký tự" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Yêu cầu chữ hoa" name="passwordRequireUppercase" valuePropName="checked">
                <Switch checkedChildren="Bắt buộc" unCheckedChildren="Không" />
              </Form.Item>
              <Form.Item label="Yêu cầu chữ số" name="passwordRequireNumber" valuePropName="checked">
                <Switch checkedChildren="Bắt buộc" unCheckedChildren="Không" />
              </Form.Item>
              <Form.Item label="Yêu cầu ký tự đặc biệt" name="passwordRequireSpecial" valuePropName="checked">
                <Switch checkedChildren="Bắt buộc" unCheckedChildren="Không" />
              </Form.Item>
            </Card>
          </Col>

          {/* Session & Security */}
          <Col xs={24} lg={12}>
            <Card
              className="section-card"
              title={
                <span>
                  <span className="card-title-icon" style={{ background: 'linear-gradient(135deg, #D4A843, #f0d890)', color: '#0a1628' }}>
                    <ClockCircleOutlined />
                  </span>
                  Phiên & Bảo mật
                </span>
              }
            >
              <Form.Item label="Thời gian phiên tối đa" name="sessionTimeout">
                <InputNumber min={30} max={1440} addonAfter="phút" style={{ width: '100%' }} />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: -16, marginBottom: 16 }}>
                Mặc định: 480 phút (8 giờ làm việc)
              </Text>
              <Form.Item label="Số lần đăng nhập sai tối đa" name="maxLoginAttempts">
                <InputNumber min={1} max={10} addonAfter="lần" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label="Thời gian khóa tài khoản" name="lockDuration">
                <InputNumber min={5} max={1440} addonAfter="phút" style={{ width: '100%' }} />
              </Form.Item>

              <Divider />

              <Form.Item
                label={
                  <span>
                    <SafetyCertificateOutlined style={{ marginRight: 6 }} />
                    Xác thực 2 yếu tố (2FA)
                  </span>
                }
                name="twoFactorEnabled"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Khi bật, người dùng cần xác nhận qua thiết bị phụ khi đăng nhập
              </Text>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button type="primary" htmlType="submit" icon={<SettingOutlined />} size="large">
            Lưu cấu hình
          </Button>
        </div>
      </Form>
    </div>
  );
}
