import React, { useState, useMemo } from 'react';
import { Typography, Card, Row, Col, Table, Tag, Progress, Button, Drawer, Form, Input, Select, InputNumber, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  CalculatorOutlined, WarningOutlined, CheckCircleOutlined,
  BarChartOutlined, ExperimentOutlined, PlusOutlined,
  DeleteOutlined, EditOutlined, MoreOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';
import { PageHeader, SummaryCard } from '../../components';
import type { SummaryCardItem } from '../../components';

const { Text } = Typography;
const { Option } = Select;

interface NguonSaiSo {
  key: string;
  nguon: string;
  loai: 'A' | 'B';
  giaTri: number;
  donVi: string;
  heSo: number;
  phanPhoi: string;
}

const initData: NguonSaiSo[] = [
  { key: '1', nguon: 'Chuẩn đo lường', loai: 'B', giaTri: 0.0005, donVi: '%', heSo: 1.0, phanPhoi: 'Chữ nhật' },
  { key: '2', nguon: 'Thiết bị đo (TMDE)', loai: 'B', giaTri: 0.0012, donVi: '%', heSo: 1.0, phanPhoi: 'Chuẩn' },
  { key: '3', nguon: 'Phương pháp đo', loai: 'B', giaTri: 0.0008, donVi: '%', heSo: 1.0, phanPhoi: 'Chữ nhật' },
  { key: '4', nguon: 'Người thực hiện', loai: 'A', giaTri: 0.0006, donVi: '%', heSo: 1.0, phanPhoi: 'Student-t' },
  { key: '5', nguon: 'Môi trường (nhiệt độ)', loai: 'B', giaTri: 0.0010, donVi: '%', heSo: 0.8, phanPhoi: 'Chữ nhật' },
  { key: '6', nguon: 'Độ phân giải', loai: 'B', giaTri: 0.0003, donVi: '%', heSo: 1.0, phanPhoi: 'Chữ nhật' },
];

const PhanTichSaiSoPage: React.FC = () => {
  const [data, setData] = useState<NguonSaiSo[]>(initData);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<NguonSaiSo | null>(null);
  const [form] = Form.useForm();
  const k = 2;

  const computed = useMemo(() => {
    const rows = data.map((r) => ({ ...r, dongGop: r.giaTri * r.heSo }));
    const ucSquared = rows.reduce((s, r) => s + r.dongGop ** 2, 0);
    const uc = Math.sqrt(ucSquared);
    const U = uc * k;
    const totalDongGop = rows.reduce((s, r) => s + r.dongGop, 0);
    const withPercent = rows.map((r) => ({
      ...r,
      tyLe: totalDongGop > 0 ? Math.round((r.dongGop / totalDongGop) * 100) : 0,
    }));
    const maxNguon = rows.reduce((max, r) => r.dongGop > max.dongGop ? r : max, rows[0]);
    return { rows: withPercent, uc, U, maxNguon };
  }, [data, k]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ loai: 'B', heSo: 1.0, donVi: '%', phanPhoi: 'Chữ nhật' }); setDrawerOpen(true); };
  const openEdit = (record: NguonSaiSo) => { setEditing(record); form.setFieldsValue(record); setDrawerOpen(true); };
  const handleSave = () => {
    form.validateFields().then((vals) => {
      if (editing) { setData((prev) => prev.map((r) => r.key === editing.key ? { ...r, ...vals } : r)); message.success('Đã cập nhật nguồn sai số'); }
      else { setData((prev) => [...prev, { ...vals, key: String(Date.now()) }]); message.success('Đã thêm nguồn sai số mới'); }
      setDrawerOpen(false); form.resetFields();
    });
  };
  const handleDelete = (key: string) => { setData((prev) => prev.filter((r) => r.key !== key)); message.success('Đã xóa nguồn sai số'); };

  const summaryItems: SummaryCardItem[] = [
    { key: 'uc', label: 'Độ KĐB tổng hợp uc(y)', value: computed.uc.toFixed(4) + ' %', icon: <CalculatorOutlined />, accentColor: '#1E6FD9', bgColor: '#e8f4fd' },
    { key: 'U', label: 'Độ KĐB mở rộng U', value: computed.U.toFixed(4) + ' %', icon: <BarChartOutlined />, accentColor: '#cf1322', bgColor: '#fff1f0' },
    { key: 'max', label: 'Nguồn lớn nhất', value: computed.maxNguon?.nguon || '—', icon: <WarningOutlined />, accentColor: '#d48806', bgColor: '#fff7e6' },
    { key: 'count', label: 'Tổng nguồn sai số', value: data.length, icon: <ExperimentOutlined />, accentColor: '#389e0d', bgColor: '#f0fce8' },
  ];

  const columns = [
    { title: '#', width: 50, render: (_: unknown, __: unknown, idx: number) => <Text style={{ fontSize: 13, color: '#595959' }}>{idx + 1}</Text> },
    { title: 'Nguồn sai số', dataIndex: 'nguon', width: 200, render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: 'Loại', dataIndex: 'loai', width: 70, render: (v: string) => <Tag color={v === 'A' ? 'blue' : 'green'} style={{ margin: 0, borderRadius: 4 }}>{v}</Tag> },
    { title: 'Phân phối', dataIndex: 'phanPhoi', width: 130, render: (v: string) => <Text style={{ fontSize: 13, color: '#595959' }}>{v}</Text> },
    { title: 'Giá trị u(xi)', dataIndex: 'giaTri', width: 120, render: (v: number) => <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{v.toFixed(4)}</Text> },
    { title: 'Hệ số ci', dataIndex: 'heSo', width: 90, render: (v: number) => <Text style={{ fontFamily: 'monospace', fontSize: 13 }}>{v}</Text> },
    { title: 'Đóng góp ui(y)', width: 130, render: (_: unknown, r: NguonSaiSo) => <Text style={{ fontFamily: 'monospace', fontWeight: 700, color: '#d48806', fontSize: 13 }}>{(r.giaTri * r.heSo).toFixed(4)}</Text> },
    { title: 'Tỷ lệ', width: 140, render: (_: unknown, r: NguonSaiSo & { tyLe?: number }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Progress percent={r.tyLe || 0} size="small" strokeColor={(r.tyLe || 0) > 25 ? '#ff4d4f' : colors.navy} showInfo={false} style={{ width: 60, margin: 0 }} />
        <Text style={{ fontSize: 12, fontWeight: 600, color: (r.tyLe || 0) > 25 ? '#ff4d4f' : '#595959' }}>{r.tyLe}%</Text>
      </div>
    )},
    { title: '', width: 44, fixed: 'right' as const, render: (_: unknown, r: NguonSaiSo) => {
      const menu: MenuProps = {
        items: [
          { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
          { type: 'divider' },
          { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
        ],
        onClick: ({ key }) => {
          if (key === 'edit') openEdit(r);
          if (key === 'delete') handleDelete(r.key);
        },
      };
      return (
        <Dropdown menu={menu} trigger={['click']} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined />} style={{ color: '#8c8c8c' }} onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      );
    }},
  ];

  const biasTotal = data.filter((r) => r.loai === 'B').reduce((s, r) => s + r.giaTri * r.heSo, 0);
  const precisionTotal = data.filter((r) => r.loai === 'A').reduce((s, r) => s + r.giaTri * r.heSo, 0);
  const riskRatio = (computed.U / 0.005 * 100);

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<CalculatorOutlined />}
        title="Phân tích sai số & Độ không đảm bảo đo"
        subtitle="Error & Measurement Uncertainty Analysis (EMA) — Ngân sách sai số theo GUM"
        ctaLabel="Thêm nguồn sai số"
        onCtaClick={openAdd}
      />

      {/* Summary cards — dùng chuẩn SummaryCard component */}
      <div style={{ marginBottom: 20 }}>
        <SummaryCard items={summaryItems} />
      </div>

      {/* Bảng ngân sách sai số — full width */}
      <Card
        style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20 }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Ngân sách sai số (Uncertainty Budget)</Text>
            <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginTop: 2 }}>
              {data.length} nguồn sai số · Loại A: {data.filter((r) => r.loai === 'A').length} · Loại B: {data.filter((r) => r.loai === 'B').length}
            </Text>
          </div>
          <Text style={{ fontSize: 12, color: '#8c8c8c' }}>k = {k}, P = 95%</Text>
        </div>
        <Table dataSource={computed.rows} columns={columns} pagination={false} size="middle" rowKey="key" scroll={{ x: 1000 }}
          style={{ margin: '0' }} />

        <div style={{ padding: '12px 24px 20px' }}>
          <div style={{ padding: '10px 16px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a' }}>
            <Text style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
              U = k × u<sub>c</sub>(y) = {k} × {computed.uc.toFixed(4)} = <strong>{computed.U.toFixed(4)} %</strong> &nbsp;(k={k}, P=95%)
            </Text>
          </div>
        </div>
      </Card>

      {/* Row thông tin bổ sung — 3 card ngang */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}
            styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Phân loại sai số</Text>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {[
                { label: 'Bias (sai số hệ thống)', value: biasTotal.toFixed(4) + ' %', color: '#cf1322' },
                { label: 'Precision (độ lặp lại)', value: precisionTotal.toFixed(4) + ' %', color: '#d48806' },
                { label: 'Resolution (phân giải)', value: data.find((r) => r.nguon.includes('phân giải'))?.giaTri.toFixed(4) + ' %' || '—', color: colors.navy },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Text style={{ fontSize: 13, color: '#595959' }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: item.color }}>{item.value}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{
            borderRadius: 10, height: '100%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            background: riskRatio > 33 ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${riskRatio > 33 ? '#fde68a' : '#bbf7d0'}`,
          }} styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${riskRatio > 33 ? '#fde68a' : '#bbf7d0'}` }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Rủi ro quyết định</Text>
            </div>
            <div style={{ padding: '16px 20px', textAlign: 'center' }}>
              <Text style={{ fontSize: 36, fontWeight: 700, fontFamily: 'monospace', color: riskRatio > 33 ? '#d48806' : '#389e0d', lineHeight: 1 }}>
                {riskRatio.toFixed(0)}%
              </Text>
              <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginTop: 4 }}>Tỷ số U / Sai số CP</Text>
              <Text style={{ fontSize: 12, color: '#595959', display: 'block', marginTop: 8 }}>
                {riskRatio > 33
                  ? 'Vượt ngưỡng 33% — cần xem xét xác suất Chấp nhận sai hoặc Loại bỏ sai.'
                  : 'Trong ngưỡng an toàn — kết quả đo đáng tin cậy.'}
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}
            styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>Thống kê nguồn</Text>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {[
                { label: 'Tổng nguồn sai số', value: data.length, color: '#1a1a2e' },
                { label: 'Loại A (thống kê)', value: data.filter((r) => r.loai === 'A').length, color: colors.navy },
                { label: 'Loại B (phi thống kê)', value: data.filter((r) => r.loai === 'B').length, color: '#389e0d' },
                { label: 'Đóng góp > 20%', value: computed.rows.filter((r) => r.tyLe > 20).length, color: '#cf1322' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <Text style={{ fontSize: 13, color: '#595959' }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: item.color }}>{item.value}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ═══ DRAWER ═══ */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        title={null} width={520} closable={false}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ background: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`, padding: '20px 24px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, display: 'block', marginBottom: 4 }}>{editing ? 'Chỉnh sửa' : 'Thêm mới'}</Text>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Nguồn sai số</Text>
          <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, display: 'block', marginTop: 4 }}>
            Xác định nguồn, phân loại và giá trị đóng góp vào ngân sách sai số
          </Text>
        </div>
        <div style={{ padding: '20px 24px' }}>
          <Form form={form} layout="vertical">
            <Form.Item name="nguon" label="Tên nguồn sai số" rules={[{ required: true, message: 'Nhập tên nguồn' }]}>
              <Input placeholder="VD: Chuẩn đo lường, Thiết bị đo, Môi trường..." />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="loai" label="Loại đánh giá" rules={[{ required: true }]}>
                  <Select>
                    <Option value="A">Loại A — Thống kê</Option>
                    <Option value="B">Loại B — Phi thống kê</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phanPhoi" label="Phân phối xác suất" rules={[{ required: true }]}>
                  <Select>
                    <Option value="Chuẩn">Chuẩn (Normal)</Option>
                    <Option value="Chữ nhật">Chữ nhật (Rectangular)</Option>
                    <Option value="Tam giác">Tam giác (Triangular)</Option>
                    <Option value="Student-t">Student-t</Option>
                    <Option value="U-shape">U-shape</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="giaTri" label="Giá trị u(xi)" rules={[{ required: true, message: 'Nhập' }]}>
                  <InputNumber style={{ width: '100%' }} step={0.0001} min={0} placeholder="0.0005" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="donVi" label="Đơn vị">
                  <Select>
                    {['%', 'V', 'Hz', '°C', 'Pa', 'm/s²', 'kW', 'dB'].map((u) => <Option key={u} value={u}>{u}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="heSo" label="Hệ số nhạy ci" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} step={0.1} min={0} max={10} placeholder="1.0" />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
              <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}>Hủy</Button>
              <Button type="primary" icon={editing ? <CheckCircleOutlined /> : <PlusOutlined />} onClick={handleSave}>
                {editing ? 'Cập nhật' : 'Thêm nguồn sai số'}
              </Button>
            </div>
          </Form>
        </div>
      </Drawer>
    </div>
  );
};

export default PhanTichSaiSoPage;
