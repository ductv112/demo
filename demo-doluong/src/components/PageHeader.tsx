import React from 'react';
import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  ctaLabel,
  onCtaClick,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#e8f4fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: '#1E6FD9',
          }}
        >
          {icon}
        </div>
        <div>
          <Title level={4} style={{ margin: 0, color: '#1a1a2e', fontWeight: 700 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {subtitle}
            </Text>
          )}
        </div>
      </div>

      {ctaLabel && onCtaClick && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={onCtaClick}
          style={{
            borderRadius: 8,
            fontWeight: 600,
            height: 42,
            paddingInline: 24,
            boxShadow: '0 2px 8px rgba(30,111,217,0.3)',
          }}
        >
          {ctaLabel}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
