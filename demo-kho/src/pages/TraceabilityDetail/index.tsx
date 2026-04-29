import React from 'react';
import {
  Card, Button, Space, Tag, Typography, Row, Col,
  Descriptions, Timeline, Divider, Steps,
} from 'antd';
import {
  ArrowLeftOutlined, NodeIndexOutlined, InboxOutlined,
  ExportOutlined, SwapOutlined, CheckCircleOutlined,
  RollbackOutlined, DeleteOutlined, EnvironmentOutlined,
  ShopOutlined, TagOutlined, HistoryOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { TraceCurrentStatus, TraceEventType } from '../../types';
import { traceabilityRecords } from '../../data/traceability';

const { Title, Text } = Typography;

// ─── Configs ─────────────────────────────────────────────
const statusConfig: Record<TraceCurrentStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  in_stock:    { label: 'Trong kho',       color: '#52c41a', bg: 'rgba(82,196,26,0.12)',  icon: <InboxOutlined /> },
  dispatched:  { label: 'Đã cấp phát',     color: '#1677ff', bg: 'rgba(22,119,255,0.10)', icon: <ExportOutlined /> },
  in_use:      { label: 'Đang sử dụng',    color: '#1677ff', bg: 'rgba(22,119,255,0.10)', icon: <CheckCircleOutlined /> },
  returned:    { label: 'Đã trả về',       color: '#13c2c2', bg: 'rgba(19,194,194,0.10)', icon: <RollbackOutlined /> },
  transferred: { label: 'Đã điều chuyển', color: '#722ed1', bg: 'rgba(114,46,209,0.10)', icon: <SwapOutlined /> },
  scrapped:    { label: 'Đã thanh lý',     color: 'default', bg: 'rgba(0,0,0,0.06)',      icon: <DeleteOutlined /> },
};

const eventConfig: Record<TraceEventType, { label: string; color: string; icon: React.ReactNode }> = {
  inbound:     { label: 'Nhập kho',        color: '#1B3A5C', icon: <InboxOutlined /> },
  stored:      { label: 'Nhập vị trí lưu', color: '#2d5a8e', icon: <EnvironmentOutlined /> },
  transferred: { label: 'Điều chuyển kho', color: '#722ed1', icon: <SwapOutlined /> },
  dispatched:  { label: 'Cấp phát',        color: '#1677ff', icon: <ExportOutlined /> },
  returned:    { label: 'Trả về kho',      color: '#13c2c2', icon: <RollbackOutlined /> },
  checked:     { label: 'Kiểm tra',        color: '#52c41a', icon: <CheckCircleOutlined /> },
  adjusted:    { label: 'Điều chỉnh tồn',  color: '#faad14', icon: <TagOutlined /> },
  scrapped:    { label: 'Thanh lý',        color: 'default', icon: <DeleteOutlined /> },
};

// banner gradient by status
const bannerGradient: Record<TraceCurrentStatus, string> = {
  in_stock:    'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)',
  dispatched:  'linear-gradient(135deg, #003eb3 0%, #1677ff 100%)',
  in_use:      'linear-gradient(135deg, #003eb3 0%, #1677ff 100%)',
  returned:    'linear-gradient(135deg, #006d75 0%, #13c2c2 100%)',
  transferred: 'linear-gradient(135deg, #391085 0%, #722ed1 100%)',
  scrapped:    'linear-gradient(135deg, #434343 0%, #8c8c8c 100%)',
};

const TraceabilityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const record = traceabilityRecords.find(r => r.id === id);

  if (!record) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} type="secondary">Không tìm thấy bản ghi</Title>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/traceability')}>Quay lại</Button>
      </div>
    );
  }

  const sCfg = statusConfig[record.currentStatus];

  // Summarize journey for Steps component (unique locations)
  const journeySteps = (() => {
    const steps: { title: string; desc: string; status: 'finish' | 'process' | 'wait' }[] = [];
    steps.push({
      title: 'Nhà cung cấp',
      desc: record.supplier,
      status: 'finish',
    });
    const seenLocations = new Set<string>();
    record.events.forEach(ev => {
      if (ev.toLocation && !seenLocations.has(ev.toLocation)) {
        seenLocations.add(ev.toLocation);
        const isLast = ev === record.events[record.events.length - 1] ||
          (record.currentLocation && ev.toLocation === record.currentLocation);
        steps.push({
          title: ev.toLocation.length > 30 ? ev.toLocation.slice(0, 30) + '…' : ev.toLocation,
          desc: new Date(ev.date).toLocaleDateString('vi-VN'),
          status: isLast ? 'process' : 'finish',
        });
      }
    });
    return steps;
  })();

  return (
    <div style={{ padding: '0 4px' }}>
      {/* ── Banner ── */}
      <div style={{
        background: bannerGradient[record.currentStatus],
        borderRadius: 14, padding: '24px 28px', color: '#fff',
        marginBottom: 20, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 24, top: 16, fontSize: 120, opacity: 0.07 }}>
          <NodeIndexOutlined />
        </div>
        <Space style={{ marginBottom: 14 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/traceability')}
            style={{ color: 'rgba(255,255,255,0.8)', padding: '0 8px 0 0' }}
          >
            Truy xuất nguồn gốc
          </Button>
        </Space>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Space size={8} style={{ marginBottom: 8 }}>
              <Tag style={{ background: sCfg.bg, color: sCfg.color, border: `1px solid ${sCfg.color}44`, fontWeight: 600, fontSize: 12 }}>
                {sCfg.icon} {sCfg.label}
              </Tag>
              <Tag style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', fontSize: 11 }}>
                {record.trackingType === 'serial' ? 'Serial' : 'Lô hàng'}
              </Tag>
            </Space>
            <Title level={4} style={{ color: '#fff', margin: '0 0 4px', fontWeight: 700 }}>
              {record.productName}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              {record.productCode} &nbsp;·&nbsp;
              <span style={{ fontFamily: 'monospace' }}>{record.trackingCode}</span>
            </Text>
          </div>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Phiếu nhập', value: record.inboundOrderCode },
              { label: 'Ngày nhập', value: new Date(record.inboundDate).toLocaleDateString('vi-VN') },
              { label: 'Tồn hiện tại', value: `${record.currentQty.toLocaleString('vi-VN')} / ${record.totalQty.toLocaleString('vi-VN')} ${record.unit}` },
              { label: 'Số sự kiện', value: `${record.events.length} sự kiện` },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '10px 16px', minWidth: 120, textAlign: 'center' }}>
                <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Journey steps ── */}
      <Card
        style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: '#1B3A5C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
          Hành trình vật tư
        </div>
        <Steps
          size="small"
          current={journeySteps.length - 1}
          items={journeySteps.map(s => ({ title: s.title, description: s.desc, status: s.status }))}
          style={{ fontSize: 12 }}
        />
      </Card>

      <Row gutter={[16, 16]}>
        {/* ── Left: Timeline ── */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HistoryOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Lịch sử di chuyển đầy đủ</Text>
                <Tag style={{ marginLeft: 4 }}>{record.events.length} sự kiện</Tag>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '16px 24px 20px' } }}
          >
            <Timeline
              items={record.events.map((ev, idx) => {
                const eCfg = eventConfig[ev.type];
                const isFirst = idx === 0;
                const isLast = idx === record.events.length - 1;
                return {
                  color: eCfg.color,
                  dot: isLast ? (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: eCfg.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 12,
                    }}>
                      {eCfg.icon}
                    </div>
                  ) : undefined,
                  children: (
                    <div style={{
                      background: isLast ? '#f8faff' : isFirst ? '#f0f7f0' : '#fafafa',
                      borderRadius: 10, padding: '12px 16px', marginBottom: 4,
                      border: isLast ? '1px solid #d6e4ff' : isFirst ? '1px solid #d9f7be' : '1px solid #f0f0f0',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <Space size={6}>
                          <Tag color={eCfg.color} style={{ fontWeight: 600, fontSize: 11, margin: 0 }}>
                            {eCfg.label}
                          </Tag>
                          {isFirst && <Tag color="green" style={{ fontSize: 10, margin: 0 }}>Khởi đầu</Tag>}
                          {isLast && <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>Hiện tại</Tag>}
                        </Space>
                        <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                          {new Date(ev.date).toLocaleDateString('vi-VN')}
                        </Text>
                      </div>

                      {/* From → To */}
                      {(ev.fromLocation || ev.toLocation) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          {ev.fromLocation && (
                            <span style={{ fontSize: 11, color: '#595959', background: '#f0f0f0', padding: '2px 8px', borderRadius: 4 }}>
                              {ev.fromLocation}
                            </span>
                          )}
                          {ev.fromLocation && ev.toLocation && (
                            <span style={{ color: '#8c8c8c', fontSize: 12 }}>→</span>
                          )}
                          {ev.toLocation && (
                            <span style={{ fontSize: 11, color: '#1B3A5C', background: '#e6f4ff', padding: '2px 8px', borderRadius: 4, fontWeight: 500 }}>
                              {ev.toLocation}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Meta */}
                      <div style={{ display: 'flex', gap: 16, marginBottom: ev.note ? 6 : 0, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 12 }}>
                          <span style={{ color: '#8c8c8c' }}>Người TH: </span>{ev.actor}
                          <span style={{ color: '#bfbfbf', marginLeft: 4 }}>· {ev.department}</span>
                        </Text>
                        {ev.docRef && (
                          <Text style={{ fontSize: 12 }}>
                            <span style={{ color: '#8c8c8c' }}>Phiếu: </span>
                            <Text style={{ color: '#1B3A5C', fontFamily: 'monospace', fontSize: 11 }}>{ev.docRef}</Text>
                          </Text>
                        )}
                        {ev.quantity != null && (
                          <Text style={{ fontSize: 12 }}>
                            <span style={{ color: '#8c8c8c' }}>SL: </span>
                            <Text strong>{ev.quantity.toLocaleString('vi-VN')} {ev.unit ?? record.unit}</Text>
                          </Text>
                        )}
                      </div>

                      {ev.note && (
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          {ev.note}
                        </Text>
                      )}
                    </div>
                  ),
                };
              })}
            />
          </Card>
        </Col>

        {/* ── Right: Info panels ── */}
        <Col xs={24} lg={9}>
          {/* Origin */}
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShopOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Nguồn gốc</Text>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '12px 20px 16px' } }}
          >
            <Descriptions size="small" column={1} labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Nhà cung cấp">{record.supplier}</Descriptions.Item>
              {record.supplierCountry && (
                <Descriptions.Item label="Quốc gia">{record.supplierCountry}</Descriptions.Item>
              )}
              <Descriptions.Item label="Phiếu nhập kho">{record.inboundOrderCode}</Descriptions.Item>
              <Descriptions.Item label="Ngày nhập">
                {new Date(record.inboundDate).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              {record.contractRef && (
                <Descriptions.Item label="Hợp đồng">{record.contractRef}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Current location */}
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EnvironmentOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Vị trí hiện tại</Text>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}
            styles={{ body: { padding: '12px 20px 16px' } }}
          >
            <div style={{ background: sCfg.bg, borderRadius: 10, padding: '14px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24, color: sCfg.color }}>{sCfg.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: sCfg.color, fontSize: 13 }}>{sCfg.label}</div>
                <div style={{ fontSize: 12, color: '#595959', marginTop: 2 }}>{record.currentLocation ?? '—'}</div>
                {record.currentDept && (
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.currentDept}</div>
                )}
              </div>
            </div>
            <Divider style={{ margin: '0 0 12px' }} />
            <Descriptions size="small" column={1} labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Số lượng còn lại">
                <Text strong>{record.currentQty.toLocaleString('vi-VN')} {record.unit}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng nhập">
                {record.totalQty.toLocaleString('vi-VN')} {record.unit}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Product info */}
          <Card
            title={
              <Space>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TagOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong>Thông tin vật tư</Text>
              </Space>
            }
            style={{ borderRadius: 14, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: '12px 20px 16px' } }}
          >
            <Descriptions size="small" column={1} labelStyle={{ color: '#8c8c8c', fontSize: 12 }} contentStyle={{ fontSize: 13 }}>
              <Descriptions.Item label="Mã vật tư">{record.productCode}</Descriptions.Item>
              <Descriptions.Item label="Nhóm">{record.productCategory}</Descriptions.Item>
              <Descriptions.Item label="Loại theo dõi">
                <Tag color={record.trackingType === 'serial' ? '#1B3A5C' : '#2d5a8e'} style={{ fontSize: 11 }}>
                  {record.trackingType === 'serial' ? 'Serial' : 'Lô hàng'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mã lô / Serial">
                <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{record.trackingCode}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TraceabilityDetail;
