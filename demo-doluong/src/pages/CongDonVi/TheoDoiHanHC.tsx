import React, { useMemo, useState } from 'react';
import { Typography, Tag, Progress, Select, Input, Empty } from 'antd';
import {
  ClockCircleOutlined, WarningOutlined, SearchOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined, CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { colors } from '../../theme/themeConfig';
import { PageHeader } from '../../components';
import { danhSachThietBi } from '../../data/thietBi';
import { danhSachDonVi } from '../../data/donVi';

const { Text } = Typography;
const { Option } = Select;

const donViMap = Object.fromEntries(danhSachDonVi.map((d) => [d.id, d.ten]));
const today = dayjs('2026-03-31');

function getDaysLeft(dateStr: string) {
  return dayjs(dateStr).diff(today, 'day');
}

function getUrgency(days: number): { label: string; color: string; bg: string; icon: React.ReactNode } {
  if (days < 0) return { label: 'Quá hạn', color: '#dc2626', bg: '#fef2f2', icon: <ExclamationCircleOutlined /> };
  if (days <= 30) return { label: 'Khẩn cấp', color: '#ea580c', bg: '#fff7ed', icon: <WarningOutlined /> };
  if (days <= 90) return { label: 'Sắp hạn', color: '#d97706', bg: '#fffbeb', icon: <ClockCircleOutlined /> };
  return { label: 'Còn hạn', color: '#16a34a', bg: '#f0fdf4', icon: <CheckCircleOutlined /> };
}

const TheoDoiHanHCPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');

  const tbWithDays = useMemo(() => {
    return danhSachThietBi.map((tb) => ({
      ...tb,
      daysLeft: getDaysLeft(tb.hanHieuChuan),
      urgency: getUrgency(getDaysLeft(tb.hanHieuChuan)),
    })).sort((a, b) => a.daysLeft - b.daysLeft);
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return tbWithDays.filter((tb) => {
      const matchText = !s || tb.ten.toLowerCase().includes(s) || tb.id.toLowerCase().includes(s);
      const matchUrgency = !filterUrgency || (
        filterUrgency === 'qua_han' ? tb.daysLeft < 0 :
        filterUrgency === 'khan_cap' ? (tb.daysLeft >= 0 && tb.daysLeft <= 30) :
        filterUrgency === 'sap_han' ? (tb.daysLeft > 30 && tb.daysLeft <= 90) :
        tb.daysLeft > 90
      );
      return matchText && matchUrgency;
    });
  }, [search, filterUrgency, tbWithDays]);

  const stats = useMemo(() => ({
    quaHan: tbWithDays.filter((t) => t.daysLeft < 0).length,
    khanCap: tbWithDays.filter((t) => t.daysLeft >= 0 && t.daysLeft <= 30).length,
    sapHan: tbWithDays.filter((t) => t.daysLeft > 30 && t.daysLeft <= 90).length,
    conHan: tbWithDays.filter((t) => t.daysLeft > 90).length,
  }), [tbWithDays]);

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<ClockCircleOutlined />}
        title="Theo dõi hạn hiệu chuẩn"
        subtitle="Cảnh báo thiết bị sắp đến hạn & quá hạn hiệu chuẩn — chủ động lập kế hoạch"
      />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Quá hạn', value: stats.quaHan, gradient: 'linear-gradient(135deg, #991b1b 0%, #ef4444 100%)' },
          { label: 'Khẩn cấp (≤30 ngày)', value: stats.khanCap, gradient: 'linear-gradient(135deg, #9a3412 0%, #f97316 100%)' },
          { label: 'Sắp hạn (≤90 ngày)', value: stats.sapHan, gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)' },
          { label: 'Còn hạn', value: stats.conHan, gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '16px 18px', borderRadius: 10, background: s.gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, display: 'block' }}>{s.label}</Text>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{s.value}</Text>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, padding: '14px 20px', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Input placeholder="Tìm thiết bị..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ flex: '1 1 250px', maxWidth: 320 }} />
        <Select placeholder="Mức độ" value={filterUrgency || undefined} onChange={(v) => setFilterUrgency(v || '')} allowClear style={{ flex: '0 1 180px', minWidth: 140 }}>
          <Option value="qua_han">Quá hạn</Option>
          <Option value="khan_cap">Khẩn cấp (≤30 ngày)</Option>
          <Option value="sap_han">Sắp hạn (≤90 ngày)</Option>
          <Option value="con_han">Còn hạn</Option>
        </Select>
        <Text style={{ fontSize: 12, color: '#9ca3af', alignSelf: 'center' }}>{filtered.length} thiết bị</Text>
      </div>

      {/* List */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((tb) => {
            const u = tb.urgency;
            const pct = Math.max(0, Math.min(100, ((365 - Math.max(0, tb.daysLeft)) / 365) * 100));
            return (
              <div key={tb.id} style={{
                background: '#fff', borderRadius: 10, border: `1px solid ${u.color}20`,
                borderLeft: `4px solid ${u.color}`, padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: u.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.color, fontSize: 18, flexShrink: 0 }}>
                  {u.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text strong style={{ fontSize: 13, color: colors.navy }}>{tb.id}</Text>
                    <Text style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{tb.ten}</Text>
                  </div>
                  <Text style={{ fontSize: 11, color: '#6b7280' }}>{donViMap[tb.donVi] || tb.donVi} · {tb.linhVuc}</Text>
                </div>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <Text style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>Hạn HC</Text>
                  <Text style={{ fontSize: 13, fontWeight: 600, color: u.color }}>{tb.hanHieuChuan.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')}</Text>
                </div>
                <div style={{ width: 100, flexShrink: 0, textAlign: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: 700, color: u.color, fontFamily: 'monospace' }}>
                    {tb.daysLeft < 0 ? `${Math.abs(tb.daysLeft)}` : tb.daysLeft}
                  </Text>
                  <Text style={{ fontSize: 9, color: '#9ca3af', display: 'block' }}>
                    {tb.daysLeft < 0 ? 'ngày quá hạn' : 'ngày còn lại'}
                  </Text>
                </div>
                <Tag style={{ margin: 0, borderRadius: 4, fontWeight: 600, fontSize: 11, background: u.bg, color: u.color, border: `1px solid ${u.color}30` }}>
                  {u.label}
                </Tag>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 10, padding: 60, textAlign: 'center' }}>
          <Empty description="Không có thiết bị nào" />
        </div>
      )}
    </div>
  );
};

export default TheoDoiHanHCPage;
