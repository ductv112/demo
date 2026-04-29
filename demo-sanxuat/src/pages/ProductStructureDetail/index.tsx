import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Space, Typography, Row, Col, Empty, Tree,
  Drawer, Form, Input, InputNumber, Select, Modal, message, Dropdown,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, PartitionOutlined,
  CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, StopOutlined,
  PlusOutlined, DeleteOutlined, MoreOutlined, ExclamationCircleOutlined,
  SendOutlined, CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

import { productStructures, bomItems as initialBomItems } from '../../data/productStructures';
import { productionOrders } from '../../data/productionOrders';
import type { ProductStructure, BOMItem } from '../../types';
import { bomStatusConfig, formatDate } from '../../utils/format';

const { Title, Text } = Typography;

const typeLabels: Record<ProductStructure['type'], { label: string; color: string }> = {
  finished:      { label: 'Thành phẩm',     color: '#1B3A5C' },
  module:        { label: 'Mô-đun',          color: '#0891b2' },
  semi_finished: { label: 'Bán thành phẩm',  color: '#7c3aed' },
  part:          { label: 'Chi tiết',         color: '#d97706' },
};

const scopeLabels: Record<ProductStructure['scope'], string> = {
  new_production: 'Sản xuất mới',
  repair:         'Sửa chữa',
  overhaul:       'Đại tu',
};

const bomItemTypeMap: Record<string, { label: string; color: string }> = {
  main:        { label: 'Chính',    color: '#1B3A5C' },
  auxiliary:   { label: 'Phụ',      color: '#0891b2' },
  consumable:  { label: 'Tiêu hao', color: '#d97706' },
  replacement: { label: 'Thay thế', color: '#7c3aed' },
};

const statusIconMap: Record<string, React.ReactNode> = {
  active:           <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  pending_approval: <ClockCircleOutlined style={{ color: '#faad14' }} />,
  draft:            <FileTextOutlined style={{ color: '#8c8c8c' }} />,
  deprecated:       <StopOutlined style={{ color: '#ff4d4f' }} />,
};

const ProductStructureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = productStructures.find((p) => p.id === id);
  const [items, setItems] = useState<BOMItem[]>(initialBomItems.filter((item) => item.bomId === id));

  // Drawer state for add/edit BOM item
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BOMItem | null>(null);
  const [form] = Form.useForm();

  // Editable check
  const isEditable = record?.status === 'draft' || record?.status === 'pending_approval';

  // Related production orders
  const relatedOrders = useMemo(() => {
    if (!record) return [];
    return productionOrders.filter(
      (o) => o.productId === record.id || o.bomVersion === record.version
    );
  }, [record]);

  if (!record) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="Không tìm thấy cấu trúc sản phẩm" />
        <Button type="primary" onClick={() => navigate('/product-structures')} style={{ marginTop: 16, background: '#1B3A5C' }}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusCfg = bomStatusConfig[record.status];
  const typeCfg = typeLabels[record.type];

  // --- CRUD handlers ---
  const handleAddItem = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ type: 'main', quantity: 1 });
    setDrawerOpen(true);
  };

  const handleEditItem = (item: BOMItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setDrawerOpen(true);
  };

  const handleDeleteItem = (item: BOMItem) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Xóa vật tư "${item.materialName}" (${item.materialCode}) khỏi định mức?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setItems(items.filter((i) => i.id !== item.id));
        message.success('Đã xóa vật tư khỏi định mức');
      },
    });
  };

  const handleSaveItem = () => {
    form.validateFields().then((values) => {
      if (editingItem) {
        setItems(items.map((i) => i.id === editingItem.id ? { ...i, ...values } : i));
        message.success('Cập nhật vật tư thành công');
      } else {
        const newItem: BOMItem = {
          id: `BI-${Date.now()}`,
          bomId: record.id,
          ...values,
        };
        setItems([...items, newItem]);
        message.success('Thêm vật tư thành công');
      }
      setDrawerOpen(false);
      form.resetFields();
    });
  };

  const handleMenuClick = (key: string, item: BOMItem) => {
    if (key === 'edit') handleEditItem(item);
    if (key === 'delete') handleDeleteItem(item);
  };

  // --- Stats ---
  const totalItems = items.length;
  const mainItems = items.filter((i) => i.type === 'main').length;
  const consumableItems = items.filter((i) => i.type === 'consumable').length;
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  // --- Columns ---
  const bomColumns: ColumnsType<BOMItem> = [
    {
      title: 'STT', key: 'stt', width: 50, align: 'center',
      render: (_: unknown, __: BOMItem, index: number) => (
        <Text strong style={{ color: '#1B3A5C' }}>{index + 1}</Text>
      ),
    },
    {
      title: 'Mã vật tư', dataIndex: 'materialCode', key: 'materialCode', width: 120,
      render: (v: string) => <Text strong style={{ fontSize: 13, color: '#1B3A5C', fontFamily: 'monospace' }}>{v}</Text>,
    },
    { title: 'Tên vật tư', dataIndex: 'materialName', key: 'materialName', width: 200 },
    {
      title: 'Quy cách', dataIndex: 'specification', key: 'specification', width: 180,
      render: (v: string) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text>,
    },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 60, align: 'center' },
    {
      title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 70, align: 'right',
      render: (v: number) => <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{v}</Text>,
    },
    {
      title: 'Phân loại', dataIndex: 'type', key: 'type', width: 100, align: 'center',
      render: (t: string) => {
        const cfg = bomItemTypeMap[t] || { label: t, color: 'default' };
        return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Vị trí', dataIndex: 'position', key: 'position', width: 100,
      render: (v?: string) => v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary">--</Text>,
    },
    {
      title: 'Mã thay thế', dataIndex: 'substituteCode', key: 'substituteCode', width: 110,
      render: (v?: string) => v
        ? <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#7c3aed' }}>{v}</Text>
        : <Text type="secondary">--</Text>,
    },
    ...(isEditable ? [{
      title: 'Thao tác', key: 'actions', width: 60, align: 'center' as const,
      render: (_: unknown, item: BOMItem) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <EditOutlined />, label: 'Sửa' },
              { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
            ],
            onClick: ({ key }) => handleMenuClick(key, item),
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 16 }} />} />
        </Dropdown>
      ),
    }] : []),
  ];

  return (
    <div>
      {/* ─── Header ─── */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '20px 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -20,
            width: 180, height: 180, borderRadius: '50%',
            background: 'rgba(212,168,67,0.06)',
          }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/product-structures')}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                />
                <Space size={8} align="center">
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <PartitionOutlined style={{ color: '#fff', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, lineHeight: '22px' }}>
                      {record.name}
                    </div>
                    <Space size={8} style={{ marginTop: 2 }}>
                      <Tag style={{ fontFamily: 'monospace', fontWeight: 600, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>
                        {record.code}
                      </Tag>
                      <Tag style={{ fontFamily: 'monospace', background: 'rgba(212,168,67,0.25)', border: 'none', color: '#f0d890' }}>
                        {record.version}
                      </Tag>
                    </Space>
                  </div>
                </Space>
              </Space>
            </Col>
            <Col>
              <Space>
                <Tag
                  icon={statusIconMap[record.status]}
                  style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}
                >
                  {' '}{statusCfg.label}
                </Tag>
                {/* Workflow buttons theo trạng thái */}
                {record.status === 'draft' && (
                  <>
                    <Button icon={<EditOutlined />}
                      onClick={() => navigate(`/product-structures/${record.id}/edit`)}
                      style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 500 }}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button icon={<SendOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Gửi phê duyệt',
                          icon: <SendOutlined style={{ color: '#1B3A5C' }} />,
                          content: `Gửi cấu trúc "${record.name}" (${record.version}) để phê duyệt?`,
                          okText: 'Gửi duyệt',
                          cancelText: 'Hủy',
                          onOk: () => message.success('Đã gửi phê duyệt thành công'),
                        });
                      }}
                      style={{ background: 'rgba(212,168,67,0.3)', border: 'none', color: '#f0d890', fontWeight: 600 }}
                    >
                      Gửi duyệt
                    </Button>
                  </>
                )}
                {record.status === 'pending_approval' && (
                  <>
                    <Button icon={<CheckCircleOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Phê duyệt cấu trúc',
                          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                          content: `Phê duyệt và đưa vào sử dụng: "${record.name}" (${record.version})?`,
                          okText: 'Phê duyệt',
                          cancelText: 'Hủy',
                          onOk: () => message.success('Đã phê duyệt thành công'),
                        });
                      }}
                      style={{ background: 'rgba(82,196,26,0.3)', border: 'none', color: '#b7eb8f', fontWeight: 600 }}
                    >
                      Phê duyệt
                    </Button>
                    <Button icon={<CloseCircleOutlined />}
                      onClick={() => {
                        Modal.confirm({
                          title: 'Từ chối phê duyệt',
                          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
                          content: `Từ chối cấu trúc "${record.name}" (${record.version})? Cấu trúc sẽ chuyển về trạng thái Nháp.`,
                          okText: 'Từ chối',
                          okType: 'danger',
                          cancelText: 'Hủy',
                          onOk: () => message.success('Đã từ chối, chuyển về trạng thái Nháp'),
                        });
                      }}
                      style={{ background: 'rgba(255,77,79,0.3)', border: 'none', color: '#ffa39e', fontWeight: 600 }}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                {record.status === 'active' && (
                  <Button icon={<StopOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: 'Ngừng sử dụng',
                        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
                        content: `Ngừng sử dụng cấu trúc "${record.name}" (${record.version})? Các lệnh SX mới sẽ không thể sử dụng phiên bản này.`,
                        okText: 'Ngừng sử dụng',
                        okType: 'danger',
                        cancelText: 'Hủy',
                        onOk: () => message.success('Đã ngừng sử dụng'),
                      });
                    }}
                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontWeight: 500 }}
                  >
                    Ngừng sử dụng
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        {/* Info grid */}
        <div style={{ padding: '16px 24px', background: '#fff' }}>
          <Row gutter={[32, 12]}>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Loại</Text>
              <div><Tag color={typeCfg.color} style={{ marginTop: 4 }}>{typeCfg.label}</Tag></div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Model thiết bị</Text>
              <div style={{ fontWeight: 600, color: '#1B3A5C', marginTop: 4 }}>{record.equipmentModel}</div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Phạm vi</Text>
              <div style={{ fontWeight: 500, marginTop: 4 }}>{scopeLabels[record.scope]}</div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Hiệu lực từ</Text>
              <div style={{ fontWeight: 500, marginTop: 4 }}>{record.effectiveFrom ? formatDate(record.effectiveFrom) : '--'}</div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Kế thừa từ</Text>
              <div style={{ fontWeight: 500, marginTop: 4 }}>
                {record.previousVersion
                  ? <Tag style={{ fontFamily: 'monospace', color: '#7c3aed', borderColor: '#7c3aed' }}>{record.previousVersion}</Tag>
                  : '--'}
              </div>
            </Col>
            <Col span={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Lệnh SX liên quan</Text>
              <div style={{ fontWeight: 600, color: relatedOrders.length > 0 ? '#1B3A5C' : '#8c8c8c', marginTop: 4 }}>
                {relatedOrders.length > 0 ? `${relatedOrders.length} lệnh` : 'Chưa có'}
              </div>
            </Col>
          </Row>
          {record.description && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid #D4A843' }}>
              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 2 }}>Mô tả phạm vi áp dụng</Text>
              <Text style={{ fontSize: 13 }}>{record.description}</Text>
            </div>
          )}
        </div>
      </Card>

      {/* ─── Stats ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: 'Tổng vật tư', value: totalItems, suffix: 'loại', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)' },
          { label: 'Vật tư chính', value: mainItems, suffix: 'loại', gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)' },
          { label: 'Tiêu hao', value: consumableItems, suffix: 'loại', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
          { label: 'Tổng số lượng', value: totalQty, suffix: 'đơn vị', gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
        ].map((stat, idx) => (
          <Col xs={12} sm={6} key={idx}>
            <Card className="db-stat-card" style={{ background: stat.gradient, border: 'none', borderRadius: 14 }}
              styles={{ body: { padding: '16px 18px' } }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                {stat.value}
                <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{stat.suffix}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{stat.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ─── Cây cấu trúc phân rã sản phẩm ─── */}
      {(() => {
        const allBomItems = initialBomItems;

        type TreeNode = { title: React.ReactNode; key: string; children?: TreeNode[]; isLeaf?: boolean; icon?: React.ReactNode };

        // BOM items → chỉ hiện tên vật tư (chi tiết xem ở bảng bên dưới)
        const getBomLeaves = (bomId: string): TreeNode[] => {
          return allBomItems.filter((bi) => bi.bomId === bomId).map((bi) => ({
            key: `bom-${bi.id}`,
            isLeaf: true,
            icon: <span style={{ color: '#bbb', fontSize: 8 }}>&#9679;</span>,
            title: (
              <Text style={{ fontSize: 12, color: '#666' }}>{bi.materialName}</Text>
            ),
          }));
        };

        // Cấu trúc con → hiện tên + loại + số thành phần con
        const buildTreeNode = (node: ProductStructure): TreeNode => {
          const tCfg = typeLabels[node.type];
          const isCurrent = node.id === record.id;

          const subStructures = productStructures
            .filter((c) => c.parentId === node.id)
            .map((c) => buildTreeNode(c));
          const bomLeaves = getBomLeaves(node.id);

          // Nhóm vật tư trực tiếp vào 1 node nếu có cả cụm con lẫn vật tư
          const bomGroup: TreeNode[] = (bomLeaves.length > 0 && subStructures.length > 0)
            ? [{
                key: `direct-${node.id}`,
                icon: <span style={{ color: '#D4A843', fontSize: 10 }}>&#9670;</span>,
                title: (
                  <Text style={{ fontSize: 12, color: '#8c8c8c', fontStyle: 'italic' }}>
                    Vật tư lắp trực tiếp ({bomLeaves.length})
                  </Text>
                ),
                children: bomLeaves,
              }]
            : bomLeaves;

          const allChildren = [...subStructures, ...bomGroup];

          return {
            key: node.id,
            icon: (
              <span style={{
                display: 'inline-block', width: 20, height: 20, borderRadius: 5,
                background: isCurrent ? '#1B3A5C' : tCfg.color,
                color: '#fff', fontSize: 9, fontWeight: 700,
                lineHeight: '20px', textAlign: 'center',
              }}>
                {node.type === 'finished' ? 'TP' : node.type === 'module' ? 'MĐ' : node.type === 'semi_finished' ? 'BTP' : 'CT'}
              </span>
            ),
            title: (
              <Space size={6} style={{
                padding: '2px 0',
                cursor: node.id !== record.id ? 'pointer' : 'default',
              }}
                onClick={() => { if (node.id !== record.id) navigate(`/product-structures/${node.id}`); }}
              >
                <Text strong style={{
                  fontSize: 13,
                  color: isCurrent ? '#1B3A5C' : '#333',
                  borderBottom: isCurrent ? '2px solid #D4A843' : 'none',
                  paddingBottom: isCurrent ? 1 : 0,
                }}>
                  {node.name}
                </Text>
                {isCurrent && <Tag color="#D4A843" style={{ fontSize: 10, fontWeight: 600, lineHeight: '16px' }}>Đang xem</Tag>}
                {subStructures.length > 0 && (
                  <Text type="secondary" style={{ fontSize: 11 }}>{subStructures.length} cụm con</Text>
                )}
              </Space>
            ),
            children: allChildren.length > 0 ? allChildren : undefined,
          };
        };

        // Build from root (parent if exists, otherwise current)
        const parent = record.parentId ? productStructures.find((p) => p.id === record.parentId) : null;
        const rootNode = parent || record;
        const treeData = [buildTreeNode(rootNode)];

        return (
          <Card className="db-chart-card" style={{ borderRadius: 14, marginBottom: 16 }} styles={{ body: { padding: 0 } }}>
            <div style={{ padding: '16px 20px 8px' }}>
              <Space align="center" size={8}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PartitionOutlined style={{ color: '#fff', fontSize: 15 }} />
                </div>
                <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>Cây phân rã cấu trúc sản phẩm</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>Từ cấp cao nhất đến chi tiết đơn lẻ</Text>
              </Space>
            </div>
            <div style={{ padding: '8px 20px 16px' }}>
              <Tree
                treeData={treeData}
                defaultExpandAll
                showLine={{ showLeafIcon: false }}
                selectable={false}
                style={{ background: 'transparent' }}
              />
            </div>
          </Card>
        );
      })()}

      {/* ─── BOM Items Table ─── */}
      <Card className="db-chart-card" style={{ borderRadius: 14 }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space align="center" size={8}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PartitionOutlined style={{ color: '#fff', fontSize: 15 }} />
            </div>
            <Title level={5} style={{ margin: 0, color: '#1B3A5C' }}>Định mức vật tư (BOM Items)</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>{totalItems} vật tư</Text>
          </Space>
          {isEditable && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, fontWeight: 500 }}
            >
              Thêm vật tư
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <Empty description="Chưa có định mức vật tư cho cấu trúc này" />
            {isEditable && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}
                style={{ marginTop: 16, background: '#1B3A5C', borderColor: '#1B3A5C' }}
              >
                Thêm vật tư đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <Table<BOMItem>
            columns={bomColumns}
            dataSource={items}
            rowKey="id"
            size="middle"
            pagination={false}
            scroll={{ x: 1100 }}
            style={{ marginTop: 4 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    <Text strong style={{ color: '#1B3A5C' }}>Tổng cộng</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>{totalQty}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} colSpan={isEditable ? 4 : 3} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        )}
      </Card>

      {/* ─── Drawer Thêm / Sửa vật tư ─── */}
      <Drawer
        title={
          <Space align="center" size={12}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {editingItem
                ? <EditOutlined style={{ color: '#fff', fontSize: 18 }} />
                : <PlusOutlined style={{ color: '#fff', fontSize: 18 }} />}
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: '20px' }}>
                {editingItem ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 400 }}>
                {editingItem ? `Đang sửa: ${editingItem.materialCode}` : `Thêm vào: ${record.code} - ${record.version}`}
              </div>
            </div>
          </Space>
        }
        closeIcon={<span style={{ color: '#fff', fontSize: 16 }}>&#x2715;</span>}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); form.resetFields(); }}
        width={560}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Button onClick={() => { setDrawerOpen(false); form.resetFields(); }}
              style={{ borderRadius: 8, height: 40, padding: '0 24px' }}
            >
              Hủy
            </Button>
            <Button type="primary" onClick={handleSaveItem}
              icon={editingItem ? <EditOutlined /> : <PlusOutlined />}
              style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 40, padding: '0 28px', fontWeight: 600 }}
            >
              {editingItem ? 'Cập nhật' : 'Thêm vật tư'}
            </Button>
          </div>
        }
        styles={{
          header: {
            background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
            borderBottom: 'none', padding: '20px 24px',
          },
          body: { padding: '24px', background: '#fafbfc' },
          footer: { borderTop: '1px solid #f0f0f0', padding: '16px 24px', background: '#fff' },
        }}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          {/* Thông tin vật tư */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Thông tin vật tư</Text>
          </div>
          <Card size="small" style={{ borderRadius: 10, marginBottom: 20, border: '1px solid #e8e8e8', background: '#fff' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="materialCode" label="Mã vật tư" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
                  <Input placeholder="VD: MG-001" disabled={!!editingItem} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true, message: 'Vui lòng nhập ĐVT' }]}>
                  <Input placeholder="VD: Cái, Bộ, Sợi, Kg" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="materialName" label="Tên vật tư" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
              <Input placeholder="VD: Module phát tín hiệu chính" />
            </Form.Item>
            <Form.Item name="specification" label="Quy cách kỹ thuật" rules={[{ required: true, message: 'Vui lòng nhập quy cách' }]}
              style={{ marginBottom: 0 }}
            >
              <Input placeholder="VD: 9.3 GHz, 250kW" />
            </Form.Item>
          </Card>

          {/* Định mức & phân loại */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Định mức & Phân loại</Text>
          </div>
          <Card size="small" style={{ borderRadius: 10, marginBottom: 20, border: '1px solid #e8e8e8', background: '#fff' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Nhập SL' }]}>
                  <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="type" label="Phân loại" rules={[{ required: true }]}>
                  <Select options={[
                    { value: 'main', label: 'Chính' },
                    { value: 'auxiliary', label: 'Phụ' },
                    { value: 'consumable', label: 'Tiêu hao' },
                    { value: 'replacement', label: 'Thay thế' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="position" label="Vị trí sử dụng" style={{ marginBottom: 0 }}>
                  <Input placeholder="VD: Khối thu phát" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Thay thế tương đương */}
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 13, color: '#1B3A5C' }}>Thay thế tương đương</Text>
          </div>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e8e8e8', background: '#fff' }}>
            <Form.Item name="substituteCode" label="Mã vật tư thay thế" style={{ marginBottom: 0 }}
              extra="Mã vật tư tương đương có thể sử dụng khi vật tư gốc không còn"
            >
              <Input placeholder="VD: MG-002 (để trống nếu không có)" />
            </Form.Item>
          </Card>
        </Form>
      </Drawer>
    </div>
  );
};

export default ProductStructureDetailPage;
