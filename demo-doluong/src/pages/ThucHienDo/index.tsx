import React, { useState } from 'react';
import { Typography, Card, Row, Col, Input, Select, Button, Table, Tag, InputNumber, Form, message, Divider, Steps } from 'antd';
import {
  ExperimentOutlined, PlusOutlined, SaveOutlined,
  CheckCircleOutlined, PlayCircleOutlined, DeleteOutlined,
  FileTextOutlined, UserOutlined, CalendarOutlined,
  CalculatorOutlined, RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { PageHeader } from '../../components';
import { danhSachKeHoach } from '../../data/keHoachDo';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface DiemDoRow {
  key: string;
  diemDo: string;
  giaTriChuan: string;
  giaTriDo1: string;
  giaTriDo2: string;
  giaTriDo3: string;
  trungBinh: string;
  saiSo: string;
  saiSoCP: string;
  ketLuan: 'dat' | 'khong_dat' | '';
}

const defaultPoints: DiemDoRow[] = [
  { key: '1', diemDo: '10%', giaTriChuan: '', giaTriDo1: '', giaTriDo2: '', giaTriDo3: '', trungBinh: '', saiSo: '', saiSoCP: '', ketLuan: '' },
  { key: '2', diemDo: '25%', giaTriChuan: '', giaTriDo1: '', giaTriDo2: '', giaTriDo3: '', trungBinh: '', saiSo: '', saiSoCP: '', ketLuan: '' },
  { key: '3', diemDo: '50%', giaTriChuan: '', giaTriDo1: '', giaTriDo2: '', giaTriDo3: '', trungBinh: '', saiSo: '', saiSoCP: '', ketLuan: '' },
  { key: '4', diemDo: '75%', giaTriChuan: '', giaTriDo1: '', giaTriDo2: '', giaTriDo3: '', trungBinh: '', saiSo: '', saiSoCP: '', ketLuan: '' },
  { key: '5', diemDo: '100%', giaTriChuan: '', giaTriDo1: '', giaTriDo2: '', giaTriDo3: '', trungBinh: '', saiSo: '', saiSoCP: '', ketLuan: '' },
];

const ThucHienDoPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedKH, setSelectedKH] = useState<string | null>(null);
  const [diemDo, setDiemDo] = useState<DiemDoRow[]>(defaultPoints);
  const [step, setStep] = useState(0);

  const kh = selectedKH ? danhSachKeHoach.find((k) => k.id === selectedKH) : null;

  const updatePoint = (key: string, field: keyof DiemDoRow, value: string) => {
    setDiemDo((prev) => prev.map((p) => p.key === key ? { ...p, [field]: value } : p));
  };

  const addPoint = () => {
    const newKey = String(diemDo.length + 1);
    setDiemDo((prev) => [...prev, { key: newKey, diemDo: '', giaTriChuan: '', giaTriDo1: '', giaTriDo2: '', giaTriDo3: '', trungBinh: '', saiSo: '', saiSoCP: '', ketLuan: '' }]);
  };

  const removePoint = (key: string) => {
    setDiemDo((prev) => prev.filter((p) => p.key !== key));
  };

  const columns = [
    { title: '#', width: 40, render: (_: unknown, __: unknown, idx: number) => <Text style={{ fontSize: 12, color: '#6b7280' }}>{idx + 1}</Text> },
    { title: 'Điểm đo', dataIndex: 'diemDo', width: 90, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'diemDo', e.target.value)} style={{ fontFamily: 'monospace' }} /> },
    { title: 'Giá trị chuẩn', dataIndex: 'giaTriChuan', width: 120, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'giaTriChuan', e.target.value)} placeholder="0.000" style={{ fontFamily: 'monospace' }} /> },
    { title: 'Lần 1', dataIndex: 'giaTriDo1', width: 100, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'giaTriDo1', e.target.value)} placeholder="—" style={{ fontFamily: 'monospace' }} /> },
    { title: 'Lần 2', dataIndex: 'giaTriDo2', width: 100, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'giaTriDo2', e.target.value)} placeholder="—" style={{ fontFamily: 'monospace' }} /> },
    { title: 'Lần 3', dataIndex: 'giaTriDo3', width: 100, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'giaTriDo3', e.target.value)} placeholder="—" style={{ fontFamily: 'monospace' }} /> },
    { title: 'TB', dataIndex: 'trungBinh', width: 100, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'trungBinh', e.target.value)} style={{ fontFamily: 'monospace', background: '#f8fafc' }} /> },
    { title: 'Sai số', dataIndex: 'saiSo', width: 100, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'saiSo', e.target.value)} style={{ fontFamily: 'monospace', color: '#d97706', fontWeight: 600 }} /> },
    { title: 'Sai số CP', dataIndex: 'saiSoCP', width: 100, render: (v: string, r: DiemDoRow) => <Input size="small" value={v} onChange={(e) => updatePoint(r.key, 'saiSoCP', e.target.value)} style={{ fontFamily: 'monospace' }} /> },
    { title: 'KL', dataIndex: 'ketLuan', width: 90, render: (v: string, r: DiemDoRow) => (
      <Select size="small" value={v || undefined} onChange={(val) => updatePoint(r.key, 'ketLuan', val)} style={{ width: '100%' }} placeholder="—">
        <Option value="dat"><span style={{ color: '#16a34a' }}>Đạt</span></Option>
        <Option value="khong_dat"><span style={{ color: '#dc2626' }}>K.Đạt</span></Option>
      </Select>
    )},
    { title: '', width: 36, render: (_: unknown, r: DiemDoRow) => (
      <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removePoint(r.key)} />
    )},
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<ExperimentOutlined />}
        title="Nhập dữ liệu đo thô (MDC)"
        subtitle="Measurement Data Collection — Giao diện nhập kết quả đo thực tế tại phòng lab"
      />

      {/* Step indicator */}
      <Card style={{ borderRadius: 10, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} styles={{ body: { padding: '16px 24px' } }}>
        <Steps current={step} size="small" items={[
          { title: 'Chọn kế hoạch đo' },
          { title: 'Nhập dữ liệu đo' },
          { title: 'Kiểm tra & Lưu' },
        ]} />
      </Card>

      <Row gutter={24}>
        {/* Left: form */}
        <Col xs={24} xl={17}>
          {/* Step 0: Chọn KH */}
          <Card style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Text strong style={{ fontSize: 14, color: '#374151', display: 'block', marginBottom: 12 }}>
              <FileTextOutlined style={{ marginRight: 6, color: colors.navy }} />Kế hoạch đo liên kết
            </Text>
            <Select placeholder="Chọn kế hoạch đo đang thực hiện..." value={selectedKH || undefined}
              onChange={(v) => { setSelectedKH(v); setStep(v ? 1 : 0); }}
              style={{ width: '100%' }} showSearch optionFilterProp="children" size="large">
              {danhSachKeHoach.filter((k) => ['dang_thuc_hien', 'da_duyet'].includes(k.trangThai)).map((k) => (
                <Option key={k.id} value={k.id}>{k.id} — {k.tenKeHoach}</Option>
              ))}
            </Select>
            {kh && (
              <div style={{ marginTop: 12, padding: '12px 16px', background: '#f8faff', borderRadius: 8, border: '1px solid #dbeafe', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 16px' }}>
                <div><Text style={{ fontSize: 10, color: '#9ca3af' }}>Đối tượng đo</Text><Text style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{kh.thietBiCanDo}</Text></div>
                <div><Text style={{ fontSize: 10, color: '#9ca3af' }}>Chuẩn đo</Text><Text style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{kh.tenChuanDo}</Text></div>
                <div><Text style={{ fontSize: 10, color: '#9ca3af' }}>KTV phụ trách</Text><Text style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{kh.tenKtv}</Text></div>
                <div><Text style={{ fontSize: 10, color: '#9ca3af' }}>Tiêu chuẩn</Text><Text style={{ fontSize: 12, fontWeight: 600, display: 'block' }}>{kh.tieuChuan}</Text></div>
              </div>
            )}
          </Card>

          {/* Step 1: Điều kiện môi trường */}
          {kh && (
            <Card style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <Text strong style={{ fontSize: 14, color: '#374151', display: 'block', marginBottom: 12 }}>Điều kiện môi trường tại thời điểm đo</Text>
              <Row gutter={16}>
                <Col span={8}><Form.Item label="Nhiệt độ (°C)"><Input placeholder="23.5" style={{ fontFamily: 'monospace' }} /></Form.Item></Col>
                <Col span={8}><Form.Item label="Độ ẩm (%RH)"><Input placeholder="45" style={{ fontFamily: 'monospace' }} /></Form.Item></Col>
                <Col span={8}><Form.Item label="Áp suất (hPa)"><Input placeholder="1013.25" style={{ fontFamily: 'monospace' }} /></Form.Item></Col>
              </Row>
            </Card>
          )}

          {/* Step 1: Bảng nhập liệu */}
          {kh && (
            <Card style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 14, color: '#374151' }}>
                  <PlayCircleOutlined style={{ marginRight: 6, color: colors.navy }} />Bảng dữ liệu đo ({diemDo.length} điểm)
                </Text>
                <Button size="small" icon={<PlusOutlined />} onClick={addPoint}>Thêm điểm đo</Button>
              </div>
              <Table dataSource={diemDo} columns={columns} pagination={false} size="small" scroll={{ x: 1050 }}
                rowKey="key" bordered style={{ borderRadius: 8, overflow: 'hidden' }} />
            </Card>
          )}

          {/* Ghi chú */}
          {kh && (
            <Card style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <Text strong style={{ fontSize: 14, color: '#374141', display: 'block', marginBottom: 12 }}>Ghi chú kỹ thuật viên</Text>
              <TextArea rows={3} placeholder="Nhận xét, lưu ý trong quá trình đo..." />
            </Card>
          )}
        </Col>

        {/* Right: sidebar */}
        <Col xs={24} xl={7}>
          {kh && (
            <div style={{ position: 'sticky', top: 80 }}>
              <Card style={{ borderRadius: 10, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <Text strong style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 12 }}>Tổng hợp</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 700, color: '#16a34a' }}>{diemDo.filter((p) => p.ketLuan === 'dat').length}</Text>
                    <Text style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>Đạt</Text>
                  </div>
                  <div style={{ padding: 12, background: '#fef2f2', borderRadius: 8, textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 700, color: '#dc2626' }}>{diemDo.filter((p) => p.ketLuan === 'khong_dat').length}</Text>
                    <Text style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>Không đạt</Text>
                  </div>
                  <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 700, color: '#6b7280' }}>{diemDo.filter((p) => !p.ketLuan).length}</Text>
                    <Text style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>Chưa đánh giá</Text>
                  </div>
                  <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, textAlign: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 700, color: colors.navy }}>{diemDo.length}</Text>
                    <Text style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>Tổng điểm đo</Text>
                  </div>
                </div>
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button type="primary" icon={<SaveOutlined />} block size="large"
                  onClick={() => { message.success('Đã lưu dữ liệu đo'); setStep(2); }}>
                  Lưu dữ liệu đo
                </Button>
                <Button icon={<CalculatorOutlined />} block
                  onClick={() => navigate('/phan-tich-sai-so')}>
                  Phân tích sai số <RightOutlined style={{ fontSize: 10 }} />
                </Button>
                <Button icon={<CheckCircleOutlined />} block
                  onClick={() => { if (kh) navigate(`/yeu-cau/${kh.maYeuCau}`); }}>
                  Đánh giá kết quả <RightOutlined style={{ fontSize: 10 }} />
                </Button>
              </div>

              {/* Luồng xử lý */}
              <Card style={{ borderRadius: 10, marginTop: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 10 }}>Luồng xử lý</Text>
                <Steps direction="vertical" size="small" current={1} items={[
                  { title: <Text style={{ fontSize: 12 }}>Nhập dữ liệu đo (MDC)</Text>, description: <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Đang thực hiện</Text> },
                  { title: <Text style={{ fontSize: 12, cursor: 'pointer', color: colors.navy }} onClick={() => navigate('/phan-tich-sai-so')}>Phân tích sai số</Text>, description: <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Ngân sách sai số, Độ KĐB</Text> },
                  { title: <Text style={{ fontSize: 12, cursor: 'pointer', color: colors.navy }} onClick={() => { if (kh) navigate(`/yeu-cau/${kh.maYeuCau}`); }}>Đánh giá kết quả</Text>, description: <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Đạt / Không đạt</Text> },
                  { title: <Text style={{ fontSize: 12, cursor: 'pointer', color: colors.navy }} onClick={() => navigate('/ket-qua')}>Cấp chứng chỉ</Text>, description: <Text style={{ fontSize: 11, color: '#8c8c8c' }}>e-Certificate, K-Stamp</Text> },
                ]} />
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ThucHienDoPage;
