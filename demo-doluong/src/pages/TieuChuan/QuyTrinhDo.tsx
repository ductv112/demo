import React, { useState } from 'react';
import { Typography, Card, Tag, Input, Steps, Collapse, Empty, Button, message } from 'antd';
import {
  OrderedListOutlined, SearchOutlined, FileTextOutlined,
  CheckCircleOutlined, ExperimentOutlined, PlusOutlined,
  EditOutlined, EyeOutlined,
} from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';
import { PageHeader } from '../../components';

const { Text } = Typography;

interface QuyTrinh {
  id: string;
  ma: string;
  ten: string;
  linhVuc: string;
  phienBan: string;
  ngayBanHanh: string;
  nguoiSoanThao: string;
  trangThai: 'hieu_luc' | 'du_thao' | 'het_hieu_luc';
  cacBuoc: { buoc: number; ten: string; moTa: string }[];
}

const quyTrinhData: QuyTrinh[] = [
  {
    id: 'QT-001', ma: 'QT-HC-01', ten: 'Quy trình hiệu chuẩn điện áp DC', linhVuc: 'Điện - Điện tử',
    phienBan: 'v3.2', ngayBanHanh: '2025-06-15', nguoiSoanThao: 'Nguyễn Hoàng Sơn', trangThai: 'hieu_luc',
    cacBuoc: [
      { buoc: 1, ten: 'Chuẩn bị', moTa: 'Kiểm tra điều kiện môi trường phòng lab, bật thiết bị warm-up 30 phút' },
      { buoc: 2, ten: 'Kết nối', moTa: 'Kết nối chuẩn Fluke 732B với thiết bị cần đo theo sơ đồ đấu nối' },
      { buoc: 3, ten: 'Đo tại 5 điểm', moTa: 'Thực hiện đo tại 10%, 25%, 50%, 75%, 100% dải đo, mỗi điểm 3 lần' },
      { buoc: 4, ten: 'Ghi nhận dữ liệu', moTa: 'Nhập kết quả đo vào hệ thống MDC, tính trung bình và sai số' },
      { buoc: 5, ten: 'Tính toán KĐB', moTa: 'Xây dựng ngân sách sai số, tính Độ KĐB mở rộng U (k=2)' },
      { buoc: 6, ten: 'Kết luận', moTa: 'So sánh sai số với Sai số CP, đưa ra kết luận Đạt/Không đạt' },
    ],
  },
  {
    id: 'QT-002', ma: 'QT-HC-02', ten: 'Quy trình hiệu chuẩn tần số tín hiệu', linhVuc: 'Truyền dẫn - Tín hiệu',
    phienBan: 'v2.1', ngayBanHanh: '2025-03-20', nguoiSoanThao: 'Phạm Quang Huy', trangThai: 'hieu_luc',
    cacBuoc: [
      { buoc: 1, ten: 'Chuẩn bị', moTa: 'Kiểm tra môi trường, warm-up chuẩn tần số Rubidium 2 giờ' },
      { buoc: 2, ten: 'Hiệu chuẩn chuẩn nội', moTa: 'Self-calibration máy phân tích phổ' },
      { buoc: 3, ten: 'Đo tần số', moTa: 'Đo tại các điểm tần số quy định trong ĐLVN 154:2022' },
      { buoc: 4, ten: 'Đo công suất', moTa: 'Đo công suất phát tại mỗi tần số bằng cảm biến công suất chuẩn' },
      { buoc: 5, ten: 'Đánh giá', moTa: 'Tính sai số, KĐB và kết luận' },
    ],
  },
  {
    id: 'QT-003', ma: 'QT-HC-03', ten: 'Quy trình hiệu chuẩn áp suất thủy lực', linhVuc: 'Áp suất',
    phienBan: 'v1.5', ngayBanHanh: '2024-11-10', nguoiSoanThao: 'Lê Thanh Tùng', trangThai: 'hieu_luc',
    cacBuoc: [
      { buoc: 1, ten: 'Chuẩn bị', moTa: 'Kiểm tra chuẩn áp suất DH-Budenberg CPB5000, xả áp dư' },
      { buoc: 2, ten: 'Tăng áp từ từ', moTa: 'Tăng áp từ 0 đến điểm đo theo bước quy định' },
      { buoc: 3, ten: 'Đo tăng/giảm', moTa: 'Thực hiện đo cả chiều tăng và giảm áp' },
      { buoc: 4, ten: 'Tính sai số', moTa: 'Tính sai số hysteresis và linearity' },
    ],
  },
  {
    id: 'QT-004', ma: 'QT-HC-04', ten: 'Quy trình đo rung động cooling fan rack server', linhVuc: 'Rung động - Gia tốc',
    phienBan: 'v1.0', ngayBanHanh: '2025-09-01', nguoiSoanThao: 'Trần Quốc Việt', trangThai: 'du_thao',
    cacBuoc: [
      { buoc: 1, ten: 'Lắp cảm biến', moTa: 'Gắn gia tốc kế B&K 4534-B lên vị trí đo theo bản vẽ' },
      { buoc: 2, ten: 'Cấu hình', moTa: 'Cài đặt dải tần, độ nhạy, bộ lọc trên hệ thống thu thập' },
      { buoc: 3, ten: 'Thu tín hiệu', moTa: 'Thu tín hiệu rung động trong 30 giây mỗi điểm' },
      { buoc: 4, ten: 'Phân tích FFT', moTa: 'Phân tích phổ FFT, xác định tần số đặc trưng' },
    ],
  },
];

const ttConfig: Record<string, { label: string; color: string }> = {
  hieu_luc: { label: 'Hiệu lực', color: '#16a34a' },
  du_thao: { label: 'Dự thảo', color: '#d97706' },
  het_hieu_luc: { label: 'Hết hiệu lực', color: '#6b7280' },
};

const QuyTrinhDoPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = quyTrinhData.filter((qt) => {
    const s = search.toLowerCase();
    return !s || qt.ten.toLowerCase().includes(s) || qt.ma.toLowerCase().includes(s) || qt.linhVuc.toLowerCase().includes(s);
  });

  return (
    <div style={{ padding: 24, maxWidth: 1440 }}>
      <PageHeader
        icon={<OrderedListOutlined />}
        title="Quản lý Quy trình đo"
        subtitle="Các bước thực hiện phép đo chuẩn, cập nhật phiên bản mới nhất"
        ctaLabel="Thêm quy trình"
        onCtaClick={() => message.info('Thêm quy trình mới')}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng quy trình', value: quyTrinhData.length, gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' },
          { label: 'Đang hiệu lực', value: quyTrinhData.filter((q) => q.trangThai === 'hieu_luc').length, gradient: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)' },
          { label: 'Dự thảo', value: quyTrinhData.filter((q) => q.trangThai === 'du_thao').length, gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '16px 18px', borderRadius: 10, background: s.gradient, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, display: 'block' }}>{s.label}</Text>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: 'monospace' }}>{s.value}</Text>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, padding: '14px 20px', background: '#fff', borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Input placeholder="Tìm quy trình, mã, lĩnh vực..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ flex: '1 1 300px', maxWidth: 400 }} />
        <Text style={{ fontSize: 12, color: '#9ca3af', alignSelf: 'center' }}>{filtered.length} quy trình</Text>
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((qt) => {
            const tt = ttConfig[qt.trangThai];
            return (
              <Card key={qt.id} style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} styles={{ body: { padding: 0 } }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: 'monospace', fontSize: 12, color: colors.navy, fontWeight: 600 }}>{qt.ma}</Text>
                      <Text strong style={{ fontSize: 14 }}>{qt.ten}</Text>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                      <Tag color="blue" style={{ margin: 0, borderRadius: 4 }}>{qt.linhVuc}</Tag>
                      <Tag style={{ margin: 0, borderRadius: 4, color: tt.color, background: tt.color + '12', border: `1px solid ${tt.color}30`, fontWeight: 600 }}>{tt.label}</Tag>
                      <Text style={{ fontSize: 11, color: '#9ca3af' }}>v{qt.phienBan} · {qt.ngayBanHanh.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1')} · {qt.nguoiSoanThao}</Text>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button type="text" size="small" icon={<EyeOutlined />} />
                    <Button type="text" size="small" icon={<EditOutlined />} />
                  </div>
                </div>
                {/* Steps */}
                <div style={{ padding: '16px 20px' }}>
                  <Steps size="small" direction="vertical"
                    items={qt.cacBuoc.map((b) => ({
                      title: <Text style={{ fontSize: 13, fontWeight: 500 }}>Bước {b.buoc}: {b.ten}</Text>,
                      description: <Text style={{ fontSize: 11, color: '#6b7280' }}>{b.moTa}</Text>,
                      status: 'finish' as const,
                    }))}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card style={{ borderRadius: 10, padding: 60, textAlign: 'center' }}><Empty description="Không tìm thấy quy trình" /></Card>
      )}
    </div>
  );
};

export default QuyTrinhDoPage;
