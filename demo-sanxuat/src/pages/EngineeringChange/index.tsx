import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Tag, Space, Typography, Row, Col, Input, Select, Button, Dropdown, Modal, message,
} from 'antd';
import {
  FileTextOutlined, SearchOutlined, CheckCircleOutlined, CalendarOutlined,
  SwapOutlined, PlusOutlined, MoreOutlined, EyeOutlined, EditOutlined,
  ToolOutlined, SyncOutlined, InboxOutlined, DeleteOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { EngineeringChangeRequest, ECRStatus, ECRType } from '../../types';
import { ecrStatusConfig, ecrTypeConfig, formatDate } from '../../utils/format';

const { Text, Title, Paragraph } = Typography;

// --- Mock data — tham chiếu đúng BOM/lệnh SX thật ---
const ecrList: EngineeringChangeRequest[] = [
  {
    id: 'ECR-001', code: 'YCTD-2026-001',
    title: 'Thay bo mạch xử lý trung tần Alpha-18 sang thế hệ mới',
    type: 'design_change',
    description: 'Thay thế bo mạch xử lý trung tần FPGA Xilinx (BM-XL) bằng bo mạch mới BM-XL-V2 tiêu thụ điện thấp hơn, giảm nhiệt độ vận hành. Tạo BOM version V2.4 kế thừa từ V2.3.',
    reason: 'Bo mạch BM-XL không còn nguồn cung ổn định. Đồng thời hệ thống Alpha-18 gặp lỗi quá nhiệt tại module xử lý khi vận hành liên tục trên 8 giờ.',
    status: 'approved',
    affectedProducts: ['Module thu phát Alpha-18 (BOM-001)'],
    affectedOrders: 2,
    affectedInventory: 4,
    requestedBy: 'Trần Văn Đức',
    requestedAt: '2026-03-01',
    approvedBy: 'Phạm Quốc Hưng',
    approvedAt: '2026-03-15',
    effectiveDate: '2026-07-01',
    newVersion: 'V2.4',
    previousVersion: 'V2.3',
  },
  {
    id: 'ECR-002', code: 'YCTD-2026-002',
    title: 'Thay tụ điện công suất Module nguồn AC/DC Alpha-18',
    type: 'material_change',
    description: 'Thay thế tụ điện công suất 470uF/400V Nichicon (TD-CS) bằng Rubycon YXF series do Nichicon ngừng sản xuất dòng này.',
    reason: 'Nhà cung cấp Nichicon thông báo ngừng cung cấp dòng UHE. Rubycon YXF có thông số tương đương, đã test tương thích.',
    status: 'implementing',
    affectedProducts: ['Module nguồn AC/DC Alpha-18 (BOM-004)'],
    affectedOrders: 1,
    affectedInventory: 6,
    requestedBy: 'Lê Minh Quân',
    requestedAt: '2026-02-10',
    approvedBy: 'Trần Văn Đức',
    approvedAt: '2026-02-20',
    effectiveDate: '2026-03-01',
    newVersion: 'V2.2',
    previousVersion: 'V2.1',
  },
  {
    id: 'ECR-003', code: 'YCTD-2026-003',
    title: 'Thay đổi quy trình hàn SMT bo mạch xử lý 36D6',
    type: 'process_change',
    description: 'Chuyển từ hàn reflow profile đơn sang profile kép cho PCB 6 lớp. Cập nhật routing RT-002 bước 2 (Hàn SMT & gắn IC).',
    reason: 'Tỉ lệ lỗi hàn IC DSP TMS320C6748 đạt 3%, vượt ngưỡng 1.5%. Profile kép giảm stress nhiệt trên IC.',
    status: 'evaluating',
    affectedProducts: ['Module xử lý tín hiệu 36D6 (BOM-003)'],
    affectedOrders: 2,
    affectedInventory: 0,
    requestedBy: 'Lê Minh Quân',
    requestedAt: '2026-03-20',
  },
  {
    id: 'ECR-004', code: 'YCTD-2026-004',
    title: 'Thay đổi thiết kế đầu nối RF Module thu phát Beta-37',
    type: 'design_change',
    description: 'Chuyển từ đầu nối Type-N sang SMA cho RF-P37 để giảm suy hao tại tần số 2.7GHz. Cập nhật BOM-006.',
    reason: 'Đo kiểm phát hiện suy hao RF tại đầu nối Type-N cao hơn dự kiến 0.3dB ở 2.7GHz. SMA cho suy hao thấp hơn.',
    status: 'draft',
    affectedProducts: ['Module thu phát Beta-37 (BOM-006)'],
    affectedOrders: 1,
    affectedInventory: 12,
    requestedBy: 'Nguyễn Hữu Long',
    requestedAt: '2026-04-01',
  },
  {
    id: 'ECR-005', code: 'YCTD-2026-005',
    title: 'Bổ sung cầu chì bảo vệ cho Module nguồn AC/DC Alpha-18',
    type: 'material_change',
    description: 'Thêm 2 cầu chì bảo vệ đầu vào AC cho BOM-004. Cập nhật định mức từ 6 lên 8 cầu chì.',
    reason: 'Phát hiện 1 bộ nguồn bị cháy do quá tải đầu vào không có bảo vệ. Cần thêm cầu chì ở đầu vào AC.',
    status: 'completed',
    affectedProducts: ['Module nguồn AC/DC Alpha-18 (BOM-004)'],
    affectedOrders: 0,
    affectedInventory: 30,
    requestedBy: 'Lê Minh Quân',
    requestedAt: '2025-12-15',
    approvedBy: 'Trần Văn Đức',
    approvedAt: '2025-12-20',
    effectiveDate: '2026-01-01',
    newVersion: 'V2.1',
    previousVersion: 'V2.0',
  },
];

const statusBorderColor: Record<ECRStatus, string> = {
  draft: '#d9d9d9',
  evaluating: '#1890ff',
  approved: '#52c41a',
  implementing: '#faad14',
  completed: '#52c41a',
  rejected: '#ff4d4f',
};

const statCards = [
  {
    title: 'Tổng yêu cầu',
    value: ecrList.length,
    icon: <FileTextOutlined />,
    gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
  },
  {
    title: 'Đang đánh giá',
    value: ecrList.filter(e => e.status === 'evaluating').length,
    icon: <SearchOutlined />,
    gradient: 'linear-gradient(135deg, #1890ff, #40a9ff)',
  },
  {
    title: 'Đã duyệt',
    value: ecrList.filter(e => e.status === 'approved').length,
    icon: <CheckCircleOutlined />,
    gradient: 'linear-gradient(135deg, #52c41a, #73d13d)',
  },
];

const EngineeringChangePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState<ECRStatus | undefined>(undefined);
  const [filterType, setFilterType] = useState<ECRType | undefined>(undefined);

  const filteredList = useMemo(() => {
    return ecrList.filter((e) => {
      const matchSearch = !searchText ||
        e.code.toLowerCase().includes(searchText.toLowerCase()) ||
        e.title.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = !filterStatus || e.status === filterStatus;
      const matchType = !filterType || e.type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [searchText, filterStatus, filterType]);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileTextOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C' }}>
              Thay đổi kỹ thuật
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Quản lý thay đổi thiết kế, vật tư và quy trình sản xuất
            </Text>
          </div>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/engineering-changes/new')}
          style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}>
          Tạo yêu cầu mới
        </Button>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={8} key={idx}>
            <Card
              style={{
                borderRadius: 14, border: 'none', overflow: 'hidden',
                background: card.gradient,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
              }}
              hoverable
              styles={{ body: { padding: '20px 24px', position: 'relative' } }}
            >
              <div style={{
                position: 'absolute', top: 12, right: 16,
                fontSize: 64, opacity: 0.1, color: '#fff',
              }}>
                {card.icon}
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <span style={{ color: '#fff', fontSize: 16 }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{card.value}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.title}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter */}
      <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 20 }} styles={{ body: { padding: '14px 20px' } }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={7}>
            <Input placeholder="Tìm kiếm theo mã, tiêu đề..."
              prefix={<SearchOutlined style={{ color: '#1B3A5C' }} />}
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              allowClear style={{ borderRadius: 6 }} />
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Trạng thái" value={filterStatus} onChange={setFilterStatus}
              allowClear style={{ width: '100%' }}
              options={Object.entries(ecrStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Col>
          <Col xs={12} sm={4}>
            <Select placeholder="Loại thay đổi" value={filterType} onChange={setFilterType}
              allowClear style={{ width: '100%' }}
              options={Object.entries(ecrTypeConfig).map(([k, v]) => ({ value: k, label: v.label }))} />
          </Col>
          <Col xs={24} sm={9} style={{ textAlign: 'right' }}>
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>{filteredList.length}/{ecrList.length} kết quả</Text>
              <Button size="small" onClick={() => { setSearchText(''); setFilterStatus(undefined); setFilterType(undefined); }}>Xóa bộ lọc</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ECR Cards */}
      <Row gutter={[16, 16]}>
        {filteredList.map(ecr => {
          const statusCfg = ecrStatusConfig[ecr.status];
          const typeCfg = ecrTypeConfig[ecr.type];
          return (
            <Col xs={24} md={12} key={ecr.id}>
              <Card
                className="db-chart-card"
                style={{
                  borderRadius: 14,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                }}
                hoverable
                styles={{ body: { padding: 20 } }}
                onClick={() => navigate(`/engineering-changes/${ecr.id}`)}
              >
                {/* Header — giống pattern Quy trình */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <Space size={8} style={{ marginBottom: 6 }}>
                      <Text strong style={{ color: '#1B3A5C', fontSize: 14, fontFamily: 'monospace' }}>{ecr.code}</Text>
                      <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
                      <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                    </Space>
                    <div>
                      <Text strong style={{ fontSize: 15, color: '#1B3A5C' }}>{ecr.title}</Text>
                    </div>
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
                        ...(ecr.status === 'draft' ? [
                          { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
                          { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true as const },
                        ] : []),
                      ],
                      onClick: ({ key, domEvent }) => {
                        domEvent.stopPropagation();
                        if (key === 'view') navigate(`/engineering-changes/${ecr.id}`);
                        if (key === 'edit') navigate(`/engineering-changes/${ecr.id}/edit`);
                        if (key === 'delete') {
                          Modal.confirm({
                            title: 'Xác nhận xóa',
                            icon: <ExclamationCircleOutlined />,
                            content: `Xóa yêu cầu thay đổi "${ecr.title}" (${ecr.code})?`,
                            okText: 'Xóa',
                            okType: 'danger',
                            cancelText: 'Hủy',
                            onOk: () => message.success('Đã xóa yêu cầu thay đổi kỹ thuật'),
                          });
                        }
                      },
                    }}
                    trigger={['click']}
                  >
                    <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />}
                      onClick={(e) => e.stopPropagation()} />
                  </Dropdown>
                </div>

                {/* Body — 3 stat boxes */}
                <Row gutter={[12, 10]} style={{ marginBottom: 14 }}>
                  <Col span={8}>
                    <div style={{ background: '#f5f7fa', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <FileTextOutlined style={{ color: '#1B3A5C', fontSize: 16, marginBottom: 4 }} />
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#1B3A5C', lineHeight: 1.3 }}>{ecr.affectedOrders}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>Lệnh SX ảnh hưởng</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ background: '#f5f7fa', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <InboxOutlined style={{ color: '#D4A843', fontSize: 16, marginBottom: 4 }} />
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#D4A843', lineHeight: 1.3 }}>{ecr.affectedInventory}</div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>Tồn kho ảnh hưởng</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ background: '#f5f7fa', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                      <CalendarOutlined style={{ color: '#52c41a', fontSize: 16, marginBottom: 4 }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1B3A5C', lineHeight: 1.3, marginTop: 2 }}>
                        {formatDate(ecr.requestedAt)}
                      </div>
                      <div style={{ fontSize: 11, color: '#8c8c8c' }}>Ngày yêu cầu</div>
                    </div>
                  </Col>
                </Row>

                {/* Sản phẩm ảnh hưởng */}
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>Sản phẩm ảnh hưởng: </Text>
                  {ecr.affectedProducts.map((p, i) => (
                    <Tag key={i} style={{ fontSize: 11, margin: '2px 2px' }}>{p}</Tag>
                  ))}
                </div>

                {/* Footer — phê duyệt + version */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                  <div>
                    {ecr.approvedBy ? (
                      <Space size={6}>
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 12 }} />
                        <Text style={{ fontSize: 12, color: '#595959' }}>
                          Duyệt: <Text strong style={{ fontSize: 12 }}>{ecr.approvedBy}</Text>
                        </Text>
                        {ecr.approvedAt && (
                          <Text type="secondary" style={{ fontSize: 11 }}>({formatDate(ecr.approvedAt)})</Text>
                        )}
                      </Space>
                    ) : (
                      <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>Chưa phê duyệt</Text>
                    )}
                  </div>
                  {ecr.newVersion && (
                    <Text style={{ fontSize: 12, color: '#52c41a', fontWeight: 600 }}>
                      {ecr.previousVersion} → {ecr.newVersion}
                    </Text>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default EngineeringChangePage;
