import React, { useState, useMemo } from 'react';
import {
  Card, Tag, Button, Space, Input, Select, Typography, Drawer,
  Form, DatePicker, InputNumber, Dropdown, message, Row, Col, Progress, Pagination,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, FilterOutlined, EyeOutlined,
  EditOutlined, DatabaseOutlined,
  ToolOutlined,
  CheckCircleOutlined, WarningOutlined, MoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { equipmentList } from '../../data/equipment';
import type { Equipment, EquipmentType, EquipmentStatus } from '../../types';
import {
  equipmentStatusConfig, equipmentTypeConfig,
  getLifespanPercent, getHoursPercent, getProgressColor, formatHours,
} from '../../utils/format';
import { useUser } from '../../contexts/UserContext';

const { Title, Text } = Typography;
const { Option } = Select;

const EquipmentRegistry: React.FC = () => {
  const { isVongDoi } = useUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterUnit, setFilterUnit] = useState<string>('');

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const [form] = Form.useForm();
  const [msg, contextHolder] = message.useMessage();

  // ─── Filter ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return equipmentList.filter(e => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType && e.type !== filterType) return false;
      if (filterStatus && e.status !== filterStatus) return false;
      if (filterUnit && e.unitId !== filterUnit) return false;
      return true;
    });
  }, [search, filterType, filterStatus, filterUnit]);

  const uniqueUnits = Array.from(new Set(equipmentList.map(e => e.unitId)))
    .map(id => ({ id, name: equipmentList.find(e => e.unitId === id)?.unitName || id }));

  // ─── KPI stats ───────────────────────────────────────────────────
  const totalEq = equipmentList.length;
  const inServiceEq = equipmentList.filter(e => e.status === 'in_service').length;
  const inProgressEq = equipmentList.filter(e => ['maintenance', 'repair', 'overhaul'].includes(e.status)).length;
  const criticalEq = equipmentList.filter(e => {
    const lp = getLifespanPercent(e.yearReceived, e.designLifespan);
    const hp = getHoursPercent(e.operatingHours, e.maxOperatingHours);
    return lp >= 75 || hp >= 75;
  }).length;

  const handleView = (record: Equipment) => {
    navigate(`/equipment/${record.id}`);
  };

  const handleEdit = (record: Equipment) => {
    setSelectedEquipment(record);
    form.setFieldsValue({
      ...record,
      lastMaintenanceDate: dayjs(record.lastMaintenanceDate),
      nextMaintenanceDate: dayjs(record.nextMaintenanceDate),
      lastOverhaulDate: dayjs(record.lastOverhaulDate),
      nextOverhaulDate: dayjs(record.nextOverhaulDate),
    });
    setEditDrawerOpen(true);
  };

  const handleSaveEdit = () => {
    form.validateFields().then(() => {
      msg.success('Đã lưu thông tin trang thiết bị thành công');
      setEditDrawerOpen(false);
    });
  };

  const handleAddSave = () => {
    form.validateFields().then(() => {
      msg.success('Đã thêm trang thiết bị mới thành công');
      setAddDrawerOpen(false);
      form.resetFields();
    });
  };

  // ─── Card grid state ─────────────────────────────────────────────
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  // ─── Add/Edit form ───────────────────────────────────────────────
  const renderForm = () => (
    <Form form={form} layout="vertical" requiredMark={false}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="code" label="Mã thiết bị" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input placeholder="RD-XXXX-YYY-01" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="type" label="Loại sản phẩm" rules={[{ required: true }]}>
            <Select placeholder="Chọn loại">
              <Option value="radar">Monitoring</Option>
              <Option value="missile">Sản phẩm</Option>
              <Option value="electronics">Điện tử</Option>
              <Option value="communication">Truyền thông</Option>
              <Option value="mechanical">Hạ tầng</Option>
              <Option value="measurement">Đo lường</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="name" label="Tên trang thiết bị" rules={[{ required: true }]}>
            <Input placeholder="Nhập tên thiết bị" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="manufacturer" label="Nhà sản xuất">
            <Input placeholder="Nhà sản xuất" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="origin" label="Xuất xứ">
            <Input placeholder="Quốc gia xuất xứ" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="yearManufactured" label="Năm sản xuất">
            <InputNumber min={1950} max={2026} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="yearReceived" label="Năm tiếp nhận">
            <InputNumber min={1950} max={2026} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="serialNumber" label="Số seri">
            <Input placeholder="Serial number" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select placeholder="Trạng thái">
              {Object.entries(equipmentStatusConfig).map(([k, v]) => (
                <Option key={k} value={k}>{v.label}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="designLifespan" label="Tuổi thọ thiết kế (năm)">
            <InputNumber min={1} max={100} style={{ width: '100%' }} addonAfter="năm" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="maxOperatingHours" label="Giới hạn giờ HĐ">
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="giờ" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nextMaintenanceDate" label="Bảo trì tiếp theo">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nextOverhaulDate" label="Đại tu tiếp theo">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="location" label="Vị trí hiện tại">
            <Input placeholder="Vị trí đặt thiết bị" />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm về thiết bị" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div>
      {contextHolder}

      {/* Hero Banner */}
      <div className="hero-banner" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Row align="middle" justify="space-between">
            <Col>
              <Space size={12}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,168,67,0.2)', border: '1px solid rgba(212,168,67,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DatabaseOutlined style={{ fontSize: 20, color: '#D4A843' }} />
                </div>
                <div>
                  <Title level={5} style={{ color: '#fff', margin: 0, fontWeight: 700 }}>Hồ sơ Trang thiết bị</Title>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Quản lý hồ sơ kỹ thuật toàn bộ thiết bị / hệ thống Doanh nghiệp A</Text>
                </div>
              </Space>
            </Col>
            {isVongDoi && (
              <Col>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => { form.resetFields(); setAddDrawerOpen(true); }}
                  style={{ background: '#D4A843', borderColor: '#D4A843', color: '#0a1628', fontWeight: 600 }}
                >
                  Thêm thiết bị
                </Button>
              </Col>
            )}
          </Row>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { title: 'Tổng hồ sơ', value: totalEq, unit: 'thiết bị', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <DatabaseOutlined /> },
          { title: 'Đang vận hành', value: inServiceEq, unit: 'thiết bị', gradient: 'linear-gradient(135deg, #166534, #16a34a)', icon: <CheckCircleOutlined /> },
          { title: 'Đang bảo trì / SC / ĐT', value: inProgressEq, unit: 'thiết bị', gradient: 'linear-gradient(135deg, #7c3aed, #9333ea)', icon: <ToolOutlined /> },
          { title: 'Cần theo dõi (≥75%)', value: criticalEq, unit: 'thiết bị', gradient: 'linear-gradient(135deg, #b45309, #d97706)', icon: <WarningOutlined /> },
        ].map((card, i) => (
          <div key={i} style={{ flex: '1 1 160px', minWidth: 0 }}>
            <Card className="db-stat-card" style={{ background: card.gradient, border: 'none', borderRadius: 14 }} bodyStyle={{ padding: '16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <div className="db-bg-icon" style={{ position: 'absolute', top: -8, right: -4, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13 }}>{card.icon}</div>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>{card.title}</Text>
                </div>
                <div>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>{card.value}</span>
                  {card.unit && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginLeft: 6 }}>{card.unit}</span>}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16, borderRadius: 10 }} bodyStyle={{ padding: '12px 16px' }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined style={{ color: '#999' }} />}
            placeholder="Tìm theo tên hoặc mã..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder={<><FilterOutlined /> Loại sản phẩm</>}
            value={filterType || undefined}
            onChange={v => setFilterType(v || '')}
            style={{ width: 150 }}
            allowClear
          >
            {Object.entries(equipmentTypeConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Trạng thái"
            value={filterStatus || undefined}
            onChange={v => setFilterStatus(v || '')}
            style={{ width: 160 }}
            allowClear
          >
            {Object.entries(equipmentStatusConfig).map(([k, v]) => (
              <Option key={k} value={k}>{v.label}</Option>
            ))}
          </Select>
          <Select
            placeholder="Đơn vị sử dụng"
            value={filterUnit || undefined}
            onChange={v => setFilterUnit(v || '')}
            style={{ width: 160 }}
            allowClear
          >
            {uniqueUnits.map(u => <Option key={u.id} value={u.id}>{u.name}</Option>)}
          </Select>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hiển thị {filtered.length}/{equipmentList.length} thiết bị
          </Text>
        </Space>
      </Card>

      {/* Card grid */}
      {(() => {
        const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
        return (
          <>
            <Row gutter={[16, 16]}>
              {paged.map(eq => {
                const lifePct  = getLifespanPercent(eq.yearReceived, eq.designLifespan);
                const hoursPct = getHoursPercent(eq.operatingHours, eq.maxOperatingHours);
                const typeCfg   = equipmentTypeConfig[eq.type];
                const statusCfg = equipmentStatusConfig[eq.status];
                const isHovered = hoveredId === eq.id;
                return (
                  <Col key={eq.id} xs={24} sm={12} lg={8} xl={6}>
                    <div
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #e8e8e8',
                        background: '#fff',
                        boxShadow: isHovered ? '0 8px 28px rgba(27,58,92,0.14)' : '0 2px 8px rgba(0,0,0,0.06)',
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        transition: '0.25s cubic-bezier(0.4,0,0.2,1)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={() => setHoveredId(eq.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => handleView(eq)}
                    >
                      {/* Image */}
                      <div style={{ height: 160, position: 'relative', overflow: 'hidden', background: '#f0f2f5' }}>
                        {eq.images?.main ? (
                          <img
                            src={eq.images.main}
                            alt={eq.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                              transition: '0.4s cubic-bezier(0.4,0,0.2,1)',
                            }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#1B3A5C,#2d5a8e)' }}>
                            <DatabaseOutlined style={{ fontSize: 40, color: 'rgba(255,255,255,0.3)' }} />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 40%, rgba(0,0,0,0.35) 100%)', pointerEvents: 'none' }} />
                        {/* Top badges */}
                        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Tag style={{ background: typeCfg?.color, color: '#fff', border: 'none', fontSize: 10, fontWeight: 600, margin: 0, borderRadius: 4 }}>
                            {typeCfg?.label}
                          </Tag>
                          {(lifePct >= 75 || hoursPct >= 75) && (
                            <Tag style={{ background: '#dc2626', color: '#fff', border: 'none', fontSize: 10, margin: 0, borderRadius: 4 }}>
                              Cần theo dõi
                            </Tag>
                          )}
                        </div>
                        {/* Bottom status */}
                        <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
                          <Tag color={statusCfg?.color} style={{ fontSize: 10, margin: 0, borderRadius: 4, fontWeight: 600 }}>
                            {statusCfg?.label}
                          </Tag>
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ padding: '14px 14px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#1B3A5C', fontSize: 13, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {eq.name}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>{eq.category}</Text>
                          <Text code style={{ fontSize: 10 }}>{eq.code}</Text>
                        </div>

                        {/* Progress bars */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <Text style={{ fontSize: 11, color: '#6b7280' }}>Tuổi thọ</Text>
                            <Text style={{ fontSize: 11, fontWeight: 600, color: getProgressColor(lifePct) }}>{lifePct}%</Text>
                          </div>
                          <Progress percent={lifePct} size="small" showInfo={false} strokeColor={getProgressColor(lifePct)} style={{ margin: 0 }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, marginTop: 7 }}>
                            <Text style={{ fontSize: 11, color: '#6b7280' }}>Giờ HĐ</Text>
                            <Text style={{ fontSize: 11, fontWeight: 600, color: getProgressColor(hoursPct) }}>{formatHours(eq.operatingHours)}</Text>
                          </div>
                          <Progress percent={hoursPct} size="small" showInfo={false} strokeColor={getProgressColor(hoursPct)} style={{ margin: 0 }} />
                        </div>

                        {/* Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #f0f2f5' }}>
                          <Text type="secondary" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{eq.unitName}</Text>
                          <Dropdown
                            trigger={['click']}
                            placement="bottomRight"
                            menu={{
                              items: [
                                { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' },
                                ...(isVongDoi ? [{ key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' }] : []),
                              ],
                              onClick: ({ key }) => {
                                if (key === 'view') handleView(eq);
                                if (key === 'edit') handleEdit(eq);
                              },
                            }}
                          >
                            <Button
                              type="text"
                              icon={<MoreOutlined />}
                              size="small"
                              onClick={e => e.stopPropagation()}
                              style={{ flexShrink: 0 }}
                            />
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>

            {filtered.length > PAGE_SIZE && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  showTotal={total => `Tổng ${total} thiết bị`}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        );
      })()}

      {/* Add drawer */}
      <Drawer
        title={
          <Space>
            <PlusOutlined style={{ color: '#1B3A5C' }} />
            <span style={{ fontWeight: 700, color: '#1B3A5C' }}>Thêm trang thiết bị mới</span>
          </Space>
        }
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        width={640}
        footer={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSave}>
              Thêm thiết bị
            </Button>
            <Button onClick={() => setAddDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        {renderForm()}
      </Drawer>

      {/* Edit drawer */}
      <Drawer
        title={
          <Space>
            <EditOutlined style={{ color: '#1B3A5C' }} />
            <span style={{ fontWeight: 700, color: '#1B3A5C' }}>
              Chỉnh sửa: {selectedEquipment?.name}
            </span>
          </Space>
        }
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        width={640}
        footer={
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={handleSaveEdit}>
              Lưu thay đổi
            </Button>
            <Button onClick={() => setEditDrawerOpen(false)}>Hủy</Button>
          </Space>
        }
      >
        {renderForm()}
      </Drawer>
    </div>
  );
};

export default EquipmentRegistry;
