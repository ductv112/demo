import { Card, Table, Tag, Typography, Button } from 'antd';
import { AppstoreOutlined, EditOutlined } from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

interface DanhMucItem {
  key: number;
  ten: string;
  soMuc: number;
  moTa: string;
}

const danhSachDanhMuc: DanhMucItem[] = [
  { key: 1, ten: 'Lĩnh vực đo',       soMuc: 10, moTa: 'Phân loại lĩnh vực đo lường: Điện, Nhiệt, Áp suất, Tần số, Quang học...' },
  { key: 2, ten: 'Đơn vị đo',          soMuc: 25, moTa: 'Đơn vị đo lường cơ bản và dẫn xuất: V, A, Hz, Pa, °C, m/s²...' },
  { key: 3, ten: 'Loại thiết bị',      soMuc: 12, moTa: 'Phân loại thiết bị đo: Đồng hồ, Máy phân tích phổ, Cân, Nhiệt kế...' },
  { key: 4, ten: 'Trạng thái thiết bị', soMuc: 5,  moTa: 'Trạng thái thiết bị đo: Còn hạn, Sắp hạn, Quá hạn, Bảo dưỡng, Hỏng' },
  { key: 5, ten: 'Mức ưu tiên',        soMuc: 4,  moTa: 'Mức độ ưu tiên yêu cầu: Khẩn cấp, Cao, Trung bình, Thấp' },
  { key: 6, ten: 'Cấp chuẩn',          soMuc: 3,  moTa: 'Cấp chuẩn đo lường: Quốc gia, Tổng công ty, Làm việc' },
  { key: 7, ten: 'Loại tiêu chuẩn',    soMuc: 5,  moTa: 'Loại tiêu chuẩn/quy trình: ĐLVN, TCVN, QCVN, ISO, Lệnh KT' },
  { key: 8, ten: 'Phòng thí nghiệm',   soMuc: 6,  moTa: 'Danh sách phòng thí nghiệm/hiệu chuẩn trực thuộc Ban Đo lường' },
];

const columns = [
  {
    title: '#',
    dataIndex: 'key',
    key: 'key',
    width: 50,
    align: 'center' as const,
    render: (v: number) => <Text style={{ fontSize: 13, color: colors.textSecondary }}>{v}</Text>,
  },
  {
    title: 'Tên danh mục',
    dataIndex: 'ten',
    key: 'ten',
    width: 200,
    render: (v: string) => <Text style={{ fontSize: 13, fontWeight: 600 }}>{v}</Text>,
  },
  {
    title: 'Số mục',
    dataIndex: 'soMuc',
    key: 'soMuc',
    width: 100,
    align: 'center' as const,
    render: (v: number) => (
      <Tag color="blue" style={{ fontSize: 12, fontWeight: 600, minWidth: 32, textAlign: 'center' }}>
        {v}
      </Tag>
    ),
  },
  {
    title: 'Mô tả',
    dataIndex: 'moTa',
    key: 'moTa',
    ellipsis: true,
    render: (v: string) => <Text style={{ fontSize: 12, color: colors.textSecondary }}>{v}</Text>,
  },
  {
    title: '',
    key: 'action',
    width: 80,
    render: () => (
      <Button
        type="text"
        icon={<EditOutlined />}
        size="small"
        style={{ color: colors.navy, fontSize: 12 }}
      >
        Sửa
      </Button>
    ),
  },
];

export default function DanhMuc() {
  return (
    <div style={{ padding: 24 }}>
      {/* ── Gradient header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #3b82f6 100%)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 20,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -20, top: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <AppstoreOutlined style={{ fontSize: 20 }} />
            <Title level={4} style={{ margin: 0, color: '#fff' }}>Danh mục dùng chung</Title>
          </div>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            Quản lý các danh mục dữ liệu dùng chung trong hệ thống đo lường – Doanh nghiệp A
          </Text>
        </div>
      </div>

      {/* ── Table ── */}
      <Card style={{ borderRadius: 10, border: '1px solid #e8e8e8' }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={danhSachDanhMuc}
          columns={columns}
          rowKey="key"
          size="middle"
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
}
