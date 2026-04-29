import React, { useState, useMemo } from 'react';
import { Typography, Card, Row, Col, Select, Tag, Button, Table, Drawer, message, Divider, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import {
  LineChartOutlined, WarningOutlined, CheckCircleOutlined,
  ExperimentOutlined, MoreOutlined, SendOutlined,
  EyeOutlined, HistoryOutlined, AlertOutlined,
  FileTextOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { PageHeader, SummaryCard } from '../../components';
import type { SummaryCardItem } from '../../components';

const { Text } = Typography;
const { Option } = Select;

// ─── Dữ liệu SPC cho nhiều thiết bị ──────────────────────────────────────────
interface SPCPoint { ngay: string; giaTri: number; lan: number }
interface ThietBiSPC {
  id: string; ten: string; donVi: string; thamSo: string;
  data: SPCPoint[]; UCL: number; LCL: number; CL: number;
  drift: { xuHuong: string; tocDo: string; duBao: string; mucDo: 'critical' | 'warning' | 'info' };
  rules: { rule: string; status: 'pass' | 'warn' | 'fail' }[];
}

const thietBiSPCData: ThietBiSPC[] = [
  {
    id: 'TB-006', ten: 'Máy phân tích phổ Keysight N9010B', donVi: 'dBm', thamSo: 'Công suất đo tại 1 GHz',
    data: [
      { ngay: '01/2024', giaTri: 10.002, lan: 1 }, { ngay: '04/2024', giaTri: 10.005, lan: 2 },
      { ngay: '07/2024', giaTri: 9.998, lan: 3 }, { ngay: '10/2024', giaTri: 10.008, lan: 4 },
      { ngay: '01/2025', giaTri: 10.012, lan: 5 }, { ngay: '04/2025', giaTri: 10.015, lan: 6 },
      { ngay: '07/2025', giaTri: 10.018, lan: 7 }, { ngay: '10/2025', giaTri: 10.020, lan: 8 },
      { ngay: '01/2026', giaTri: 10.022, lan: 9 }, { ngay: '03/2026', giaTri: 10.024, lan: 10 },
    ],
    UCL: 10.025, LCL: 9.975, CL: 10.000,
    drift: { xuHuong: 'Tăng dần', tocDo: '+0.003/lần', duBao: 'Vượt UCL sau 1–2 lần đo nữa', mucDo: 'warning' },
    rules: [
      { rule: 'Rule 1: 1 điểm ngoài 3σ', status: 'pass' },
      { rule: 'Rule 2: 9 điểm cùng phía CL', status: 'warn' },
      { rule: 'Rule 3: 6 điểm tăng/giảm liên tục', status: 'fail' },
      { rule: 'Rule 4: 2/3 điểm ngoài 2σ', status: 'pass' },
    ],
  },
  {
    id: 'TB-001', ten: 'Thiết bị kiểm tra chẩn đoán DTA-144C', donVi: 'V', thamSo: 'Điện áp DC output',
    data: [
      { ngay: '03/2024', giaTri: 5.0001, lan: 1 }, { ngay: '06/2024', giaTri: 4.9998, lan: 2 },
      { ngay: '09/2024', giaTri: 5.0003, lan: 3 }, { ngay: '12/2024', giaTri: 4.9999, lan: 4 },
      { ngay: '03/2025', giaTri: 5.0002, lan: 5 }, { ngay: '06/2025', giaTri: 5.0000, lan: 6 },
      { ngay: '09/2025', giaTri: 4.9997, lan: 7 }, { ngay: '12/2025', giaTri: 5.0004, lan: 8 },
    ],
    UCL: 5.005, LCL: 4.995, CL: 5.000,
    drift: { xuHuong: 'Ổn định', tocDo: '±0.0003/lần', duBao: 'Không cần can thiệp', mucDo: 'info' },
    rules: [
      { rule: 'Rule 1: 1 điểm ngoài 3σ', status: 'pass' },
      { rule: 'Rule 2: 9 điểm cùng phía CL', status: 'pass' },
      { rule: 'Rule 3: 6 điểm tăng/giảm liên tục', status: 'pass' },
      { rule: 'Rule 4: 2/3 điểm ngoài 2σ', status: 'pass' },
    ],
  },
  {
    id: 'TB-003', ten: 'Thiết bị phân tích ảnh nhiệt IR-384', donVi: '°C', thamSo: 'Sai lệch nhiệt độ tại 100°C',
    data: [
      { ngay: '01/2024', giaTri: 0.3, lan: 1 }, { ngay: '04/2024', giaTri: 0.5, lan: 2 },
      { ngay: '07/2024', giaTri: 0.8, lan: 3 }, { ngay: '10/2024', giaTri: 1.2, lan: 4 },
      { ngay: '01/2025', giaTri: 1.5, lan: 5 }, { ngay: '04/2025', giaTri: 1.9, lan: 6 },
      { ngay: '07/2025', giaTri: 2.3, lan: 7 }, { ngay: '01/2026', giaTri: 2.8, lan: 8 },
    ],
    UCL: 2.5, LCL: -2.5, CL: 0,
    drift: { xuHuong: 'Tăng mạnh', tocDo: '+0.5°C/lần', duBao: 'ĐÃ vượt UCL — cần hiệu chuẩn ngay', mucDo: 'critical' },
    rules: [
      { rule: 'Rule 1: 1 điểm ngoài 3σ', status: 'fail' },
      { rule: 'Rule 2: 9 điểm cùng phía CL', status: 'fail' },
      { rule: 'Rule 3: 6 điểm tăng/giảm liên tục', status: 'fail' },
      { rule: 'Rule 4: 2/3 điểm ngoài 2σ', status: 'fail' },
    ],
  },
  {
    id: 'TB-009', ten: 'Bộ mô-đun thu thập dữ liệu Keysight 34980A', donVi: 'mV', thamSo: 'Điện áp DC tại 100 mV',
    data: [
      { ngay: '06/2024', giaTri: 100.002, lan: 1 }, { ngay: '09/2024', giaTri: 100.001, lan: 2 },
      { ngay: '12/2024', giaTri: 99.998, lan: 3 }, { ngay: '03/2025', giaTri: 100.003, lan: 4 },
      { ngay: '06/2025', giaTri: 99.999, lan: 5 }, { ngay: '09/2025', giaTri: 100.004, lan: 6 },
      { ngay: '12/2025', giaTri: 100.001, lan: 7 },
    ],
    UCL: 100.010, LCL: 99.990, CL: 100.000,
    drift: { xuHuong: 'Ổn định', tocDo: '±0.002/lần', duBao: 'Thiết bị hoạt động tốt', mucDo: 'info' },
    rules: [
      { rule: 'Rule 1: 1 điểm ngoài 3σ', status: 'pass' },
      { rule: 'Rule 2: 9 điểm cùng phía CL', status: 'pass' },
      { rule: 'Rule 3: 6 điểm tăng/giảm liên tục', status: 'pass' },
      { rule: 'Rule 4: 2/3 điểm ngoài 2σ', status: 'pass' },
    ],
  },
];

const driftColor = { critical: '#dc2626', warning: '#d48806', info: '#389e0d' };
const driftBg = { critical: '#fef2f2', warning: '#fffbeb', info: '#f0fdf4' };
const driftBorder = { critical: '#fecaca', warning: '#fde68a', info: '#bbf7d0' };

const BieuDoSPCPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTB, setSelectedTB] = useState('TB-006');
  const [detailDrift, setDetailDrift] = useState<ThietBiSPC | null>(null);

  const tb = useMemo(() => thietBiSPCData.find((t) => t.id === selectedTB) || thietBiSPCData[0], [selectedTB]);

  const stats = useMemo(() => ({
    total: thietBiSPCData.length,
    critical: thietBiSPCData.filter((t) => t.drift.mucDo === 'critical').length,
    warning: thietBiSPCData.filter((t) => t.drift.mucDo === 'warning').length,
    stable: thietBiSPCData.filter((t) => t.drift.mucDo === 'info').length,
  }), []);

  const summaryItems: SummaryCardItem[] = [
    { key: 'total', label: 'Thiết bị giám sát', value: stats.total, icon: <ExperimentOutlined />, accentColor: colors.navy, bgColor: '#e8f4fd' },
    { key: 'critical', label: 'Nghiêm trọng', value: stats.critical, icon: <AlertOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'warning', label: 'Cảnh báo', value: stats.warning, icon: <WarningOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'stable', label: 'Ổn định', value: stats.stable, icon: <CheckCircleOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
  ];

  const range = tb.UCL - tb.LCL;

  // Build multi-series data: measured values + control limits
  const lineData: { x: string; value: number; category: string }[] = [];
  tb.data.forEach((d) => {
    const label = `#${d.lan}`;
    lineData.push({ x: label, value: d.giaTri, category: 'Giá trị đo' });
    lineData.push({ x: label, value: tb.UCL, category: 'UCL' });
    lineData.push({ x: label, value: tb.LCL, category: 'LCL' });
    lineData.push({ x: label, value: tb.CL, category: 'CL' });
  });

  const chartConfig = {
    data: lineData,
    xField: 'x',
    yField: 'value',
    colorField: 'category',
    scale: {
      y: { domainMin: tb.LCL - range * 0.4, domainMax: tb.UCL + range * 0.4 },
      color: {
        domain: ['Giá trị đo', 'UCL', 'LCL', 'CL'],
        range: [colors.navy, '#ef4444', '#ef4444', '#22c55e'],
      },
    },
    style: {
      lineWidth: (d: { category: string }) => d.category === 'Giá trị đo' ? 2.5 : 1.5,
      lineDash: (d: { category: string }) => d.category === 'Giá trị đo' ? undefined : [6, 4],
    },
    point: {
      shapeField: 'category',
      sizeField: 'category',
      style: {
        size: (d: { category: string }) => d.category === 'Giá trị đo' ? 5 : 0,
        fill: colors.navy,
        stroke: '#fff',
        lineWidth: 2,
      },
    },
    interaction: { tooltip: { crosshairs: true } },
    legend: { color: { position: 'top', layout: { justifyContent: 'flex-end' } } },
    axis: {
      y: { title: tb.donVi, labelFormatter: (v: number) => v.toFixed(3), grid: true, gridStroke: '#f0f0f0' },
      x: { title: false },
    },
  };

  // History table columns
  const histCols = [
    { title: 'Lần', dataIndex: 'lan', width: 60, render: (v: number) => <Text style={{ fontWeight: 600, fontSize: 13 }}>#{v}</Text> },
    { title: 'Thời gian', dataIndex: 'ngay', width: 100, render: (v: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{v}</Text> },
    { title: 'Giá trị', dataIndex: 'giaTri', width: 120, render: (v: number) => {
      const outOfLimit = v > tb.UCL || v < tb.LCL;
      return <Text style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: outOfLimit ? '#dc2626' : '#1a1a2e' }}>{v.toFixed(3)} {tb.donVi}</Text>;
    }},
    { title: 'Sai lệch vs CL', width: 120, render: (_: unknown, r: SPCPoint) => {
      const diff = r.giaTri - tb.CL;
      return <Text style={{ fontFamily: 'monospace', fontSize: 13, color: Math.abs(diff) > (tb.UCL - tb.CL) * 0.8 ? '#d48806' : '#595959' }}>{diff >= 0 ? '+' : ''}{diff.toFixed(3)}</Text>;
    }},
    { title: 'Trạng thái', width: 100, render: (_: unknown, r: SPCPoint) => {
      const outOfLimit = r.giaTri > tb.UCL || r.giaTri < tb.LCL;
      const nearLimit = Math.abs(r.giaTri - tb.CL) > (tb.UCL - tb.CL) * 0.8;
      return outOfLimit ? <Tag color="error" style={{ margin: 0, borderRadius: 4 }}>Vượt ngưỡng</Tag>
        : nearLimit ? <Tag color="warning" style={{ margin: 0, borderRadius: 4 }}>Gần ngưỡng</Tag>
        : <Tag color="success" style={{ margin: 0, borderRadius: 4 }}>Bình thường</Tag>;
    }},
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<LineChartOutlined />}
        title="Biểu đồ kiểm soát SPC & Cảnh báo Drift"
        subtitle="Statistical Process Control — Giám sát độ ổn định thiết bị qua nhiều lần đo"
      />

      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      {/* Chọn thiết bị */}
      <Card style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '12px 20px' } }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Text strong style={{ fontSize: 13 }}>Thiết bị:</Text>
          <Select value={selectedTB} onChange={setSelectedTB} style={{ flex: '1 1 300px', maxWidth: 450 }}>
            {thietBiSPCData.map((t) => (
              <Option key={t.id} value={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t.id} — {t.ten}</span>
                  <Tag color={t.drift.mucDo === 'critical' ? 'error' : t.drift.mucDo === 'warning' ? 'warning' : 'success'}
                    style={{ margin: 0, borderRadius: 4, fontSize: 10 }}>{t.drift.xuHuong}</Tag>
                </div>
              </Option>
            ))}
          </Select>
          <Text style={{ fontSize: 12, color: '#8c8c8c' }}>Tham số: <strong>{tb.thamSo}</strong> · {tb.data.length} lần đo</Text>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Biểu đồ */}
        <Col xs={24} xl={16}>
          <Card style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 }}
            styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Biểu đồ kiểm soát — {tb.id}</Text>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 2, borderTop: '2px dashed #ef4444', display: 'inline-block' }} /><Text style={{ fontSize: 11, color: '#6b7280' }}>UCL / LCL</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 2, borderTop: '2px dashed #16a34a', display: 'inline-block' }} /><Text style={{ fontSize: 11, color: '#6b7280' }}>CL</Text></div>
              </div>
            </div>
            <div style={{ padding: '16px 24px' }}>
              <Line {...(chartConfig as any)} height={340} />
            </div>
          </Card>

          {/* Bảng lịch sử đo */}
          <Card style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>
                <HistoryOutlined style={{ marginRight: 6, color: colors.navy }} />Lịch sử giá trị đo ({tb.data.length} lần)
              </Text>
              <Button size="small" onClick={() => navigate('/lich-su-kiem-dinh')}>Xem đầy đủ</Button>
            </div>
            <Table dataSource={[...tb.data].reverse()} columns={histCols} pagination={false} size="middle" rowKey="lan" />
          </Card>
        </Col>

        {/* Sidebar phải */}
        <Col xs={24} xl={8}>
          {/* Drift analysis */}
          <Card style={{
            borderRadius: 10, marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            background: driftBg[tb.drift.mucDo],
            border: `1px solid ${driftBorder[tb.drift.mucDo]}`,
          }} styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${driftBorder[tb.drift.mucDo]}` }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>
                <WarningOutlined style={{ marginRight: 6, color: driftColor[tb.drift.mucDo] }} />Phân tích Drift — {tb.id}
              </Text>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <Text style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>Xu hướng</Text>
                  <Tag color={tb.drift.mucDo === 'critical' ? 'error' : tb.drift.mucDo === 'warning' ? 'warning' : 'success'}
                    style={{ margin: 0, borderRadius: 4, fontWeight: 600 }}>{tb.drift.xuHuong}</Tag>
                </div>
                <div>
                  <Text style={{ fontSize: 11, color: '#6b7280', display: 'block' }}>Tốc độ trôi</Text>
                  <Text style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: driftColor[tb.drift.mucDo] }}>{tb.drift.tocDo}</Text>
                </div>
              </div>
              <Text style={{ fontSize: 12, fontWeight: 600, color: driftColor[tb.drift.mucDo], display: 'block' }}>{tb.drift.duBao}</Text>

              {/* Action buttons */}
              {tb.drift.mucDo !== 'info' && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tb.drift.mucDo === 'critical' && (
                    <Button type="primary" danger icon={<SendOutlined />} block size="small"
                      onClick={() => { message.success('Đã tạo yêu cầu hiệu chuẩn khẩn cấp'); navigate('/yeu-cau/tao-moi'); }}>
                      Tạo YC hiệu chuẩn ngay
                    </Button>
                  )}
                  {tb.drift.mucDo === 'warning' && (
                    <Button icon={<ClockCircleOutlined />} block size="small"
                      onClick={() => navigate('/theo-doi-han-hc')}>
                      Kiểm tra hạn HC
                    </Button>
                  )}
                  <Button size="small" block onClick={() => setDetailDrift(tb)}>
                    Xem phân tích chi tiết
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Western Electric Rules */}
          <Card style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>
                <CheckCircleOutlined style={{ marginRight: 6, color: '#16a34a' }} />Quy tắc Western Electric
              </Text>
            </div>
            <div style={{ padding: '8px 20px' }}>
              {tb.rules.map((r) => (
                <div key={r.rule} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Text style={{ fontSize: 12, color: '#374151' }}>{r.rule}</Text>
                  <Tag color={r.status === 'pass' ? 'success' : r.status === 'warn' ? 'warning' : 'error'}
                    style={{ margin: 0, borderRadius: 4, fontSize: 10 }}>
                    {r.status === 'pass' ? 'OK' : r.status === 'warn' ? 'Cảnh báo' : 'Vi phạm'}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>

          {/* Tổng quan tất cả TB */}
          <Card style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>
                <ExperimentOutlined style={{ marginRight: 6, color: colors.navy }} />Tổng quan thiết bị
              </Text>
            </div>
            <div style={{ padding: '4px 0' }}>
              {thietBiSPCData.map((t) => (
                <div key={t.id}
                  onClick={() => setSelectedTB(t.id)}
                  style={{
                    padding: '10px 20px', cursor: 'pointer',
                    borderBottom: '1px solid #f5f5f5',
                    background: t.id === selectedTB ? '#f0f5ff' : 'transparent',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'background 0.15s',
                  }}>
                  <div>
                    <Text style={{ fontSize: 13, fontWeight: t.id === selectedTB ? 600 : 400, color: t.id === selectedTB ? colors.navy : '#374151' }}>{t.id}</Text>
                    <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>{t.ten.substring(0, 30)}</Text>
                  </div>
                  <Tag color={t.drift.mucDo === 'critical' ? 'error' : t.drift.mucDo === 'warning' ? 'warning' : 'success'}
                    style={{ margin: 0, borderRadius: 4, fontSize: 10 }}>{t.drift.xuHuong}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ═══ DRAWER: Phân tích Drift chi tiết ═══ */}
      <Drawer
        open={!!detailDrift}
        onClose={() => setDetailDrift(null)}
        title={null} width={560} closable={false}
        styles={{ body: { padding: 0 } }}
      >
        {detailDrift && (
          <div>
            <div style={{
              background: `linear-gradient(135deg, ${driftColor[detailDrift.drift.mucDo]}cc 0%, ${driftColor[detailDrift.drift.mucDo]} 100%)`,
              padding: '20px 24px',
            }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginBottom: 4 }}>Phân tích Drift chi tiết</Text>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>{detailDrift.id} — {detailDrift.ten}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, display: 'block', marginTop: 4 }}>
                Tham số: {detailDrift.thamSo} · {detailDrift.data.length} lần đo
              </Text>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Kết quả phân tích */}
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block', marginBottom: 14 }}>Kết quả phân tích</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
                <div><Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Xu hướng</Text><Tag color={detailDrift.drift.mucDo === 'critical' ? 'error' : detailDrift.drift.mucDo === 'warning' ? 'warning' : 'success'} style={{ fontWeight: 600, borderRadius: 4 }}>{detailDrift.drift.xuHuong}</Tag></div>
                <div><Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Tốc độ trôi</Text><Text style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: driftColor[detailDrift.drift.mucDo] }}>{detailDrift.drift.tocDo}</Text></div>
                <div><Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>UCL / CL / LCL</Text><Text style={{ fontSize: 13, fontFamily: 'monospace' }}>{detailDrift.UCL} / {detailDrift.CL} / {detailDrift.LCL} {detailDrift.donVi}</Text></div>
                <div><Text style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Giá trị gần nhất</Text><Text style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>{detailDrift.data[detailDrift.data.length - 1].giaTri.toFixed(3)} {detailDrift.donVi}</Text></div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: 8, background: driftBg[detailDrift.drift.mucDo], border: `1px solid ${driftBorder[detailDrift.drift.mucDo]}`, marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: 600, color: driftColor[detailDrift.drift.mucDo] }}>{detailDrift.drift.duBao}</Text>
              </div>

              <Divider style={{ margin: '0 0 16px' }} />

              {/* Quy tắc */}
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block', marginBottom: 12 }}>Kiểm tra quy tắc</Text>
              {detailDrift.rules.map((r) => (
                <div key={r.rule} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Text style={{ fontSize: 13, color: '#374151' }}>{r.rule}</Text>
                  <Tag color={r.status === 'pass' ? 'success' : r.status === 'warn' ? 'warning' : 'error'} style={{ margin: 0, borderRadius: 4 }}>
                    {r.status === 'pass' ? 'OK' : r.status === 'warn' ? 'Cảnh báo' : 'Vi phạm'}
                  </Tag>
                </div>
              ))}

              <Divider style={{ margin: '16px 0' }} />

              {/* Hành động */}
              <Text strong style={{ fontSize: 14, color: '#1a1a2e', display: 'block', marginBottom: 12 }}>Hành động đề xuất</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detailDrift.drift.mucDo === 'critical' && (
                  <Button type="primary" danger icon={<SendOutlined />} block
                    onClick={() => { message.success('Đã tạo yêu cầu HC khẩn cấp'); setDetailDrift(null); navigate('/yeu-cau/tao-moi'); }}>
                    Tạo yêu cầu hiệu chuẩn khẩn cấp
                  </Button>
                )}
                <Button icon={<ClockCircleOutlined />} block onClick={() => { setDetailDrift(null); navigate('/theo-doi-han-hc'); }}>
                  Kiểm tra hạn hiệu chuẩn
                </Button>
                <Button icon={<HistoryOutlined />} block onClick={() => { setDetailDrift(null); navigate('/lich-su-kiem-dinh'); }}>
                  Xem lịch sử kiểm định
                </Button>
                <Button icon={<FileTextOutlined />} block onClick={() => { setDetailDrift(null); navigate('/giam-sat'); }}>
                  Tạo cảnh báo hệ thống
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default BieuDoSPCPage;
