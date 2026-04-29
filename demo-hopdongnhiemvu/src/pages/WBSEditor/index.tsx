import React, { useState, useMemo } from 'react';
import {
  Card, Row, Col, Tag, Typography, Space, Button, Descriptions,
  Table, message, Divider, Drawer,
} from 'antd';
import {
  ArrowLeftOutlined, FileTextOutlined, PlusCircleOutlined,
  SyncOutlined, CloudDownloadOutlined, AppstoreOutlined,
  RightOutlined, DownOutlined, ToolOutlined,
  BuildOutlined, BulbOutlined, SaveOutlined, CheckCircleOutlined,
  TeamOutlined, InboxOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { getContractById, getWorkItemsByContract } from '../../data/contracts';
import { getDepartmentName, getDepartmentShortName, getDepartmentById } from '../../data/departments';
import {
  formatCurrency, formatDate,
  workItemStatusConfig, workItemTypeConfig, contractStatusConfig,
  getProgressColor,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkItem } from '../../types';

const { Title, Text } = Typography;

// ═══════════════════════════════════════════════════════════════
// Mock work order status
// ═══════════════════════════════════════════════════════════════
type WOStatus = 'created' | 'synced' | 'not_created';
interface WorkOrder {
  id: string;
  code: string;
  name: string;
  workType: string;
  assignedUnit: string;
  status: WOStatus;
  synced: boolean;
}

const woStatusConfig: Record<WOStatus, { label: string; color: string }> = {
  created: { label: 'Đã tạo', color: 'blue' },
  synced: { label: 'Đã đồng bộ', color: 'green' },
  not_created: { label: 'Chưa tạo', color: 'default' },
};

// ═══════════════════════════════════════════════════════════════
// Subsystem mapping
// ═══════════════════════════════════════════════════════════════
const workTypeToSubsystem: Record<string, string> = {
  repair: 'QL Sửa chữa',
  overhaul: 'QL Đại tu',
  manufacturing: 'QL Sản xuất',
  testing: 'QL Thử nghiệm',
  assembly: 'QL Sản xuất',
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const WBSEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const contract = getContractById(id || '');
  const contractWorkItems = useMemo(() => {
    if (!contract) return [];
    return getWorkItemsByContract(contract.id);
  }, [contract]);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    repair: true,
    overhaul: true,
    testing: true,
    assembly: true,
    manufacturing: true,
  });

  const selectedItem = useMemo(
    () => contractWorkItems.find(w => w.id === selectedItemId) || null,
    [contractWorkItems, selectedItemId],
  );

  // Group items by workType for visual hierarchy
  const groupedItems = useMemo(() => {
    const groups: Record<string, WorkItem[]> = {};
    contractWorkItems.forEach(item => {
      if (!groups[item.workType]) groups[item.workType] = [];
      groups[item.workType].push(item);
    });
    return groups;
  }, [contractWorkItems]);

  // Mock work orders: one per leaf WBS item
  const workOrders: WorkOrder[] = useMemo(() => {
    return contractWorkItems.map(item => ({
      id: `WO-${item.id}`,
      code: `LCT-${item.code.replace('WBS-', '')}`,
      name: item.name,
      workType: item.workType,
      assignedUnit: item.assignedUnit,
      status: item.status === 'completed' ? 'synced' as WOStatus
        : item.status === 'in_progress' ? 'created' as WOStatus
        : 'not_created' as WOStatus,
      synced: item.status === 'completed',
    }));
  }, [contractWorkItems]);

  // ─── Not found ──────────────────────────────────────────────
  if (!contract) {
    return (
      <Card>
        <Title level={4}>Không tìm thấy hợp đồng</Title>
        <Button type="link" onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const statusConf = contractStatusConfig[contract.status];

  // Compute planned days from start/end
  const computePlannedDays = (item: WorkItem): number => {
    const start = new Date(item.plannedStart);
    const end = new Date(item.plannedEnd);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // ─── Toggle group expand ────────────────────────────────────
  const toggleGroup = (type: string) => {
    setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // ─── WBS Tree Row ───────────────────────────────────────────
  const openItemDrawer = (item: WorkItem) => {
    setSelectedItemId(item.id);
    setDrawerOpen(true);
  };

  const renderWBSRow = (item: WorkItem, indent: number) => {
    const isSelected = selectedItemId === item.id && drawerOpen;
    const typeConf = workItemTypeConfig[item.workType];
    const statusC = workItemStatusConfig[item.status];
    const days = computePlannedDays(item);

    return (
      <div
        key={item.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          paddingLeft: 14 + indent * 24,
          borderRadius: 8,
          marginBottom: 4,
          background: isSelected ? '#e8f0fe' : 'transparent',
          borderLeft: isSelected ? `3px solid ${colors.navy}` : '3px solid transparent',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = '#f5f7fa';
        }}
        onMouseLeave={e => {
          if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        }}
      >
        <Text strong style={{ color: colors.navy, fontSize: 12, minWidth: 110 }}>{item.code}</Text>
        <Text style={{ fontSize: 13, flex: 1 }}>{item.name}</Text>
        <Tag color={typeConf.color} style={{ fontSize: 11 }}>{typeConf.label}</Tag>
        <Tag style={{ fontSize: 11 }}>{getDepartmentShortName(item.assignedUnit)}</Tag>
        <Text style={{ fontSize: 12, color: colors.textSecondary, minWidth: 60, textAlign: 'right' }}>{days} ngày</Text>
        <Text style={{ fontSize: 12, color: colors.navy, fontWeight: 600, minWidth: 80, textAlign: 'right' }}>{formatCurrency(item.plannedCost)}</Text>
        <Tag color={statusC.color} style={{ fontSize: 11 }}>{statusC.label}</Tag>
        <Button
          size="small"
          icon={<EyeOutlined />}
          style={{ fontSize: 12, borderColor: colors.navy, color: colors.navy, flexShrink: 0 }}
          onClick={() => openItemDrawer(item)}
        >
          Xem
        </Button>
      </div>
    );
  };

  // ─── WBS Tree ───────────────────────────────────────────────
  const renderWBSTree = () => {
    const groupKeys = Object.keys(groupedItems);
    return (
      <div>
        {groupKeys.map(type => {
          const typeConf = workItemTypeConfig[type as WorkItem['workType']];
          const items = groupedItems[type];
          const isExpanded = expandedGroups[type] !== false;

          return (
            <div key={type} style={{ marginBottom: 8 }}>
              {/* Group header */}
              <div
                onClick={() => toggleGroup(type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  background: '#f5f7fa',
                  borderRadius: 8,
                  marginBottom: 4,
                }}
              >
                {isExpanded
                  ? <DownOutlined style={{ fontSize: 11, color: colors.navy }} />
                  : <RightOutlined style={{ fontSize: 11, color: colors.navy }} />
                }
                <Tag color={typeConf.color} style={{ fontSize: 11 }}>{typeConf.label}</Tag>
                <Text strong style={{ fontSize: 13, color: colors.navy }}>{items.length} hạng mục</Text>
              </div>
              {/* Items */}
              {isExpanded && items.map(item => renderWBSRow(item, 1))}
              {/* Add child button */}
              {isExpanded && (
                <div
                  style={{
                    padding: '6px 14px 6px 52px',
                    cursor: 'pointer',
                    marginBottom: 4,
                  }}
                >
                  <Button
                    type="dashed"
                    size="small"
                    icon={<PlusCircleOutlined />}
                    style={{ fontSize: 12, color: colors.navyLight, borderColor: colors.navyLight }}
                    onClick={(e) => {
                      e.stopPropagation();
                      message.info('Chức năng thêm hạng mục con đang phát triển');
                    }}
                  >
                    Thêm hạng mục
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Work Orders Table ──────────────────────────────────────
  const woColumns = [
    {
      title: 'Mã WO',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 12 }}>{code}</Text>,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'workType',
      key: 'workType',
      width: 100,
      render: (type: string) => {
        const conf = workItemTypeConfig[type as WorkItem['workType']];
        return conf ? <Tag color={conf.color} style={{ fontSize: 11 }}>{conf.label}</Tag> : type;
      },
    },
    {
      title: 'Đơn vị',
      dataIndex: 'assignedUnit',
      key: 'assignedUnit',
      width: 80,
      render: (unit: string) => <Text style={{ fontSize: 12 }}>{getDepartmentShortName(unit)}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: WOStatus) => {
        const conf = woStatusConfig[status];
        return <Tag color={conf.color} style={{ fontSize: 11 }}>{conf.label}</Tag>;
      },
    },
    {
      title: 'Đồng bộ',
      dataIndex: 'synced',
      key: 'synced',
      width: 80,
      render: (synced: boolean) => synced
        ? <CheckCircleOutlined style={{ color: colors.success, fontSize: 16 }} />
        : <SyncOutlined style={{ color: colors.textSecondary, fontSize: 14 }} />,
    },
  ];

  // ─── Right column: detail card ──────────────────────────────
  const renderDetailCard = () => {
    if (!selectedItem) {
      return (
        <Card style={{ borderRadius: 14, textAlign: 'center', padding: '40px 20px' }}>
          <AppstoreOutlined style={{ fontSize: 40, color: colors.border, marginBottom: 12 }} />
          <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
            Chọn một hạng mục WBS để xem chi tiết
          </Text>
        </Card>
      );
    }

    const typeConf = workItemTypeConfig[selectedItem.workType];
    const statusC = workItemStatusConfig[selectedItem.status];
    const dept = getDepartmentById(selectedItem.assignedUnit);
    const days = computePlannedDays(selectedItem);

    return (
      <>
        {/* Detail card */}
        <Card
          style={{ borderRadius: 14, marginBottom: 16 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 15,
              }}>
                <FileTextOutlined />
              </div>
              <Title level={5} style={{ margin: 0, color: colors.navy, fontSize: 15 }}>
                Chi tiết hạng mục
              </Title>
            </div>
          }
        >
          <Descriptions bordered size="small" column={1} labelStyle={{ fontSize: 13, width: 130 }} contentStyle={{ fontSize: 13 }}>
            <Descriptions.Item label="Mã">{selectedItem.code}</Descriptions.Item>
            <Descriptions.Item label="Tên">{selectedItem.name}</Descriptions.Item>
            {selectedItem.description && (
              <Descriptions.Item label="Mô tả">{selectedItem.description}</Descriptions.Item>
            )}
            <Descriptions.Item label="Loại công việc">
              <Tag color={typeConf.color}>{typeConf.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị thực hiện">
              <Tag>{getDepartmentShortName(selectedItem.assignedUnit)}</Tag>
              {' '}
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{getDepartmentName(selectedItem.assignedUnit)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian KH">
              {formatDate(selectedItem.plannedStart)} - {formatDate(selectedItem.plannedEnd)}
            </Descriptions.Item>
            <Descriptions.Item label="Số ngày KH">
              <Text strong>{days} ngày</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng KH">{selectedItem.plannedQuantity}</Descriptions.Item>
            <Descriptions.Item label="Chi phí KH">
              <Text strong style={{ color: colors.navy }}>{formatCurrency(selectedItem.plannedCost)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusC.color}>{statusC.label}</Tag>
            </Descriptions.Item>
            {selectedItem.technicalStandard && (
              <Descriptions.Item label="Tiêu chuẩn KT">{selectedItem.technicalStandard}</Descriptions.Item>
            )}
            {selectedItem.qualityRequirement && (
              <Descriptions.Item label="Yêu cầu CL">{selectedItem.qualityRequirement}</Descriptions.Item>
            )}
          </Descriptions>

          {/* Progress info if has actual data */}
          {(selectedItem.actualStart || selectedItem.actualCost > 0) && (
            <>
              <Divider style={{ margin: '14px 0' }} />
              <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>
                Tiến độ thực tế
              </Text>
              <Descriptions bordered size="small" column={1} labelStyle={{ fontSize: 13, width: 130 }} contentStyle={{ fontSize: 13 }}>
                {selectedItem.actualStart && (
                  <Descriptions.Item label="Bắt đầu TT">{formatDate(selectedItem.actualStart)}</Descriptions.Item>
                )}
                {selectedItem.actualEnd && (
                  <Descriptions.Item label="Kết thúc TT">{formatDate(selectedItem.actualEnd)}</Descriptions.Item>
                )}
                <Descriptions.Item label="Chi phí TT">
                  <Text strong style={{ color: selectedItem.actualCost > selectedItem.plannedCost ? colors.danger : colors.success }}>
                    {formatCurrency(selectedItem.actualCost)}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}> / {formatCurrency(selectedItem.plannedCost)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiến độ">
                  <Text strong style={{ color: getProgressColor(selectedItem.progress) }}>
                    {selectedItem.progress}%
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Card>

        {/* Assignment & materials */}
        <Card
          style={{ borderRadius: 14, marginBottom: 16 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.info}, #69c0ff)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 15,
              }}>
                <TeamOutlined />
              </div>
              <Title level={5} style={{ margin: 0, color: colors.navy, fontSize: 15 }}>
                Phân công & Vật tư
              </Title>
            </div>
          }
        >
          <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>
            Đơn vị thực hiện
          </Text>
          {dept && (
            <div style={{
              background: '#f5f7fa', borderRadius: 8, padding: '10px 14px', marginBottom: 14,
            }}>
              <Text strong style={{ fontSize: 13 }}>{dept.name}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, display: 'block' }}>
                Trưởng đơn vị: {dept.head}
              </Text>
            </div>
          )}

          <Divider style={{ margin: '10px 0' }} />

          <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>
            Nhu cầu vật tư
          </Text>
          <div style={{
            background: '#f5f7fa', borderRadius: 8, padding: '10px 14px', marginBottom: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <InboxOutlined style={{ color: colors.textSecondary }} />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>
              Xem chi tiết tại QL Kho
            </Text>
          </div>

          <Button
            icon={<CloudDownloadOutlined />}
            style={{ borderColor: colors.navy, color: colors.navy, fontSize: 13 }}
            onClick={() => message.success('Đã gửi yêu cầu kiểm tra tồn kho đến QL Kho')}
            block
          >
            Kiểm tra tồn kho
          </Button>
        </Card>

        {/* Actions card */}
        <Card
          style={{ borderRadius: 14 }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.navyDark, fontSize: 15,
              }}>
                <ToolOutlined />
              </div>
              <Title level={5} style={{ margin: 0, color: colors.navy, fontSize: 15 }}>
                Thao tác
              </Title>
            </div>
          }
        >
          {selectedItem.status === 'pending' && (
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              block
              style={{ marginBottom: 8 }}
              onClick={() => message.success(`Đã tạo lệnh công việc cho "${selectedItem.name}"`)}
            >
              Tạo lệnh công việc
            </Button>
          )}
          {selectedItem.status === 'pending' && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hạng mục này chưa có lệnh công việc. Bấm nút trên để tạo.
            </Text>
          )}
          {(selectedItem.status === 'in_progress' && selectedItem.actualCost > 0 && selectedItem.progress < 100) && (
            <Button
              type="primary"
              icon={<SyncOutlined />}
              block
              style={{ marginBottom: 8, background: colors.info }}
              onClick={() => {
                const subsystem = workTypeToSubsystem[selectedItem.workType] || 'Phân hệ thực thi';
                message.success(`Đã đồng bộ tiến độ sang ${subsystem}`);
              }}
            >
              Đồng bộ sang {workTypeToSubsystem[selectedItem.workType] || 'Phân hệ thực thi'}
            </Button>
          )}
          {(selectedItem.status === 'in_progress' || selectedItem.status === 'completed') && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {selectedItem.status === 'completed'
                ? 'Hạng mục đã hoàn thành. Không có thao tác nào khả dụng.'
                : 'Hạng mục đang được thực hiện.'
              }
            </Text>
          )}
        </Card>
      </>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div>
      {/* ─── Hero Banner ─── */}
      <Card
        style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Space align="center" size={16}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              style={{ color: '#fff' }}
              onClick={() => navigate(-1)}
            />
            <FileTextOutlined style={{ fontSize: 28, color: '#D4A843' }} />
            <div>
              <Title level={4} style={{ color: '#fff', margin: 0 }}>
                Phân rã công việc &mdash; {contract.code}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                {contract.name} | {contract.partnerUnit}
              </Text>
            </div>
          </Space>
          <Tag
            color={statusConf.color}
            style={{ fontSize: 14, padding: '4px 16px', borderRadius: 6 }}
          >
            {statusConf.label}
          </Tag>
        </div>
      </Card>

      {/* ─── Full-width layout ─── */}
      <Row gutter={16}>
        <Col span={24}>
          {/* Card 1: WBS Tree */}
          <Card
            style={{ borderRadius: 14, marginBottom: 16 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 15,
                  }}>
                    <AppstoreOutlined />
                  </div>
                  <Title level={5} style={{ margin: 0, color: colors.navy, fontSize: 15 }}>
                    Cấu trúc phân rã công việc
                  </Title>
                  <Tag color="blue" style={{ fontSize: 11 }}>{contractWorkItems.length} hạng mục</Tag>
                </div>
                <Space>
                  <Button
                    icon={<PlusCircleOutlined />}
                    style={{ borderColor: colors.navy, color: colors.navy, fontSize: 13 }}
                    onClick={() => message.info('Chức năng thêm hạng mục đang phát triển')}
                  >
                    Thêm hạng mục
                  </Button>
                  <Button
                    icon={<BulbOutlined />}
                    style={{ borderColor: colors.gold, color: colors.gold, fontSize: 13 }}
                    onClick={() => message.info('Đang lấy gợi ý từ Phương án KT...')}
                  >
                    Gợi ý từ PA KT
                  </Button>
                </Space>
              </div>
            }
          >
            {renderWBSTree()}
          </Card>

          {/* Card 2: Work Orders Summary */}
          <Card
            style={{ borderRadius: 14 }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #0891b2, #67e8f9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 15,
                  }}>
                    <BuildOutlined />
                  </div>
                  <Title level={5} style={{ margin: 0, color: colors.navy, fontSize: 15 }}>
                    Lệnh công việc
                  </Title>
                  <Tag color="cyan" style={{ fontSize: 11 }}>
                    {workOrders.filter(wo => wo.status !== 'not_created').length}/{workOrders.length} đã tạo
                  </Tag>
                </div>
                <Space>
                  <Button
                    icon={<PlusCircleOutlined />}
                    style={{ borderColor: colors.navy, color: colors.navy, fontSize: 13 }}
                    onClick={() => {
                      const pending = workOrders.filter(wo => wo.status === 'not_created').length;
                      if (pending === 0) {
                        message.info('Tất cả hạng mục đã có lệnh công việc');
                      } else {
                        message.success(`Đã tạo ${pending} lệnh công việc hàng loạt`);
                      }
                    }}
                  >
                    Tạo lệnh hàng loạt
                  </Button>
                  <Button
                    icon={<SyncOutlined />}
                    style={{ borderColor: colors.info, color: colors.info, fontSize: 13 }}
                    onClick={() => {
                      const unsynced = workOrders.filter(wo => wo.status === 'created').length;
                      if (unsynced === 0) {
                        message.info('Tất cả lệnh đã được đồng bộ');
                      } else {
                        message.success(`Đã đồng bộ ${unsynced} lệnh công việc sang phân hệ thực thi`);
                      }
                    }}
                  >
                    Đồng bộ hàng loạt
                  </Button>
                </Space>
              </div>
            }
          >
            <Table
              dataSource={workOrders}
              columns={woColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* ─── Detail Drawer ─── */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        title={
          selectedItem ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 15,
              }}>
                <FileTextOutlined />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: colors.navy }}>{selectedItem.code}</div>
                <div style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 400 }}>{selectedItem.name}</div>
              </div>
            </div>
          ) : 'Chi tiết hạng mục'
        }
        styles={{ body: { padding: '16px 20px' } }}
      >
        {renderDetailCard()}
      </Drawer>

      {/* ─── Sticky Footer ─── */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        background: '#fff',
        borderTop: `1px solid ${colors.border}`,
        padding: '12px 24px',
        marginTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '14px 14px 0 0',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.05)',
      }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          WBS &mdash; {contract.code}
        </Text>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/contracts/${contract.id}`)}
            style={{ fontSize: 13 }}
          >
            Quay lại HĐ
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => message.success('Đã lưu thay đổi WBS')}
            style={{ fontSize: 13 }}
          >
            Lưu thay đổi
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default WBSEditorPage;
