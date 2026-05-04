import React, { useState } from 'react';
import { Popover, Typography, Divider, Tooltip } from 'antd';
import { AppstoreOutlined, HomeOutlined, ArrowRightOutlined } from '@ant-design/icons';
import {
  BarChart2,
  Banknote,
  ShoppingCart,
  ClipboardList,
  Warehouse,
  Factory,
  Wrench,
  Hammer,
  RefreshCw,
  Network,
  ClipboardCheck,
  AlertOctagon,
  FlaskConical,
  Scale,
  HardHat,
  Fingerprint,
  LayoutDashboard,
  Bot,
  Files,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const { Text } = Typography;

interface App {
  key: string;
  name: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  url: string;
  description: string;
}

const APPS: App[] = [
  {
    key: 'sso',
    name: 'SSO & Phân quyền',
    icon: Fingerprint,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:5173/',
    description: 'Quản lý SSO & Phân quyền',
  },
  {
    key: 'cms',
    name: 'Quản trị CMS',
    icon: LayoutDashboard,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:3000/cms',
    description: 'Quản trị nội dung (CMS)',
  },
  {
    key: 'dieuhanhbi',
    name: 'TT Điều hành số',
    icon: BarChart2,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:5174/',
    description: 'Trung tâm điều hành số',
  },
  {
    key: 'taichinhketoan',
    name: 'Tài chính KT',
    icon: Banknote,
    color: '#4c1d95',
    bg: '#f5f3ff',
    url: 'http://localhost:5175/',
    description: 'Quản lý Tài chính Kế toán',
  },
  {
    key: 'hopdongnhiemvu',
    name: 'Hợp đồng & NV',
    icon: ClipboardList,
    color: '#4c1d95',
    bg: '#f5f3ff',
    url: 'http://localhost:5176/',
    description: 'Quản lý Hợp đồng & Nhiệm vụ',
  },
  {
    key: 'muahang',
    name: 'Mua hàng',
    icon: ShoppingCart,
    color: '#0369a1',
    bg: '#e0f2fe',
    url: 'http://localhost:5177/',
    description: 'Quản lý Mua hàng',
  },
  {
    key: 'kho',
    name: 'Kho',
    icon: Warehouse,
    color: '#0369a1',
    bg: '#e0f2fe',
    url: 'http://localhost:5178/',
    description: 'Quản lý Kho',
  },
  {
    key: 'sanxuat',
    name: 'Sản xuất',
    icon: Factory,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5179/',
    description: 'Quản lý Sản xuất',
  },
  {
    key: 'baotri',
    name: 'Bảo trì',
    icon: Wrench,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5180/',
    description: 'Quản lý Bảo trì',
  },
  {
    key: 'suachua',
    name: 'Sửa chữa',
    icon: Hammer,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5181/',
    description: 'Quản lý Sửa chữa',
  },
  {
    key: 'daitu',
    name: 'Đại tu',
    icon: RefreshCw,
    color: '#065f46',
    bg: '#d1fae5',
    url: 'http://localhost:5182/',
    description: 'Quản lý Đại tu',
  },
  {
    key: 'vongdoi',
    name: 'Vòng đời & CH',
    icon: Network,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5183/',
    description: 'Quản lý Vòng đời & Cấu hình',
  },
  {
    key: 'chatluong',
    name: 'Chất lượng',
    icon: ClipboardCheck,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5184/',
    description: 'Quản lý Chất lượng QA/QC',
  },
  {
    key: 'suco',
    name: 'Sự cố & CĐ',
    icon: AlertOctagon,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5185/',
    description: 'Quản lý Sự cố & Chẩn đoán',
  },
  {
    key: 'thunghiem',
    name: 'Thử nghiệm',
    icon: FlaskConical,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5186/',
    description: 'Quản lý Thử nghiệm & Nghiệm thu',
  },
  {
    key: 'doluong',
    name: 'Đo lường & KĐ',
    icon: Scale,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5187/',
    description: 'Quản lý Đo lường & Kiểm định',
  },
  {
    key: 'antoan',
    name: 'An toàn KT',
    icon: HardHat,
    color: '#92400e',
    bg: '#fef3c7',
    url: 'http://localhost:5188/',
    description: 'Quản lý An toàn Kỹ thuật',
  },
  {
    key: 'chatbot',
    name: 'Chatbot AI',
    icon: Bot,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:3011/',
    description: 'Tra cứu tài liệu & tư vấn quy trình nghiệp vụ 24/7',
  },
  {
    key: 'dms',
    name: 'Tài liệu DMS',
    icon: Files,
    color: '#1B3A5C',
    bg: '#e8eef6',
    url: 'http://localhost:3010/',
    description: 'Quản lý tài liệu kỹ thuật, quy trình và hồ sơ nội bộ',
  },
];

const APP_MAP = Object.fromEntries(APPS.map((a) => [a.key, a]));

const ALL_APP_KEYS = ['sso', 'dieuhanhbi', 'cms', 'chatbot', 'dms', 'taichinhketoan', 'hopdongnhiemvu', 'muahang', 'kho', 'sanxuat', 'baotri', 'suachua', 'daitu', 'vongdoi', 'chatluong', 'suco', 'thunghiem', 'doluong', 'antoan'];

interface AppSwitcherProps {
  currentApp: string;
}

const AppSwitcher: React.FC<AppSwitcherProps> = ({ currentApp }) => {
  const [open, setOpen] = useState(false);

  const renderApp = (app: App) => {
    const isCurrent = app.key === currentApp;
    const Icon = app.icon;
    return (
      <Tooltip key={app.key} title={app.description} placement="bottom" mouseEnterDelay={0.6}>
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          style={{ textDecoration: 'none' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 4px 8px',
              borderRadius: 10,
              cursor: 'pointer',
              background: isCurrent ? app.bg : 'transparent',
              border: isCurrent ? `1.5px solid ${app.color}44` : '1.5px solid transparent',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isCurrent) {
                (e.currentTarget as HTMLDivElement).style.background = app.bg;
                (e.currentTarget as HTMLDivElement).style.border = `1.5px solid ${app.color}30`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isCurrent) {
                (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                (e.currentTarget as HTMLDivElement).style.border = '1.5px solid transparent';
              }
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: app.bg,
                border: `1.5px solid ${app.color}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
                flexShrink: 0,
              }}
            >
              <Icon size={21} color={app.color} strokeWidth={1.75} />
            </div>
            <Text
              style={{
                fontSize: 11,
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent ? app.color : '#555',
                textAlign: 'center',
                lineHeight: '14px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
                maxWidth: 76,
              }}
            >
              {app.name}
            </Text>
          </div>
        </a>
      </Tooltip>
    );
  };

  const content = (
    <div style={{ width: 360, userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Ứng dụng</Text>
        <a
          href="http://localhost:3000/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#1B3A5C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
          onClick={() => setOpen(false)}
        >
          <HomeOutlined /> Cổng thông tin <ArrowRightOutlined style={{ fontSize: 10 }} />
        </a>
      </div>

      {/* All apps — 4-column flat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px 0' }}>
        {ALL_APP_KEYS.map((key) => renderApp(APP_MAP[key]))}
      </div>

      <Divider style={{ margin: '6px 0 4px' }} />

      {/* Footer */}
      <a
        href="http://localhost:3000/he-thong"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 12, color: '#1B3A5C', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={() => setOpen(false)}
      >
        <AppstoreOutlined />
        Xem tất cả phần mềm nghiệp vụ
        <ArrowRightOutlined style={{ fontSize: 10, marginLeft: 'auto' }} />
      </a>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomLeft"
      arrow={false}
      styles={{
        body: {
          padding: '14px 12px 12px',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          cursor: 'pointer',
          background: open ? '#f0f2f5' : 'transparent',
          transition: 'background 0.18s',
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = '#f5f7fa'; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0"   y="0"   width="5" height="5" rx="1" fill="#555"/>
          <rect x="6.5" y="0"   width="5" height="5" rx="1" fill="#555"/>
          <rect x="13"  y="0"   width="5" height="5" rx="1" fill="#555"/>
          <rect x="0"   y="6.5" width="5" height="5" rx="1" fill="#555"/>
          <rect x="6.5" y="6.5" width="5" height="5" rx="1" fill="#555"/>
          <rect x="13"  y="6.5" width="5" height="5" rx="1" fill="#555"/>
          <rect x="0"   y="13"  width="5" height="5" rx="1" fill="#555"/>
          <rect x="6.5" y="13"  width="5" height="5" rx="1" fill="#555"/>
          <rect x="13"  y="13"  width="5" height="5" rx="1" fill="#555"/>
        </svg>
      </div>
    </Popover>
  );
};

export default AppSwitcher;
