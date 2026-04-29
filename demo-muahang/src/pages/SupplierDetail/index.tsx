import React, { useMemo, useState } from 'react';
import {
  Card, Tag, Row, Col, Typography, Table, Space, Button, Empty, Tabs, Tooltip, Input, Select,
} from 'antd';
import {
  ArrowLeftOutlined, ShopOutlined,
  UserOutlined, PhoneOutlined, MailOutlined,
  EnvironmentOutlined, SafetyCertificateOutlined, FileTextOutlined,
  DollarOutlined, HistoryOutlined,
  RiseOutlined, FallOutlined, PaperClipOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { Line } from '@ant-design/charts';
import type { ColumnsType } from 'antd/es/table';

import { suppliers } from '../../data/suppliers';
import { supplierQuotations } from '../../data/quotations';
import { priceHistories } from '../../data/suppliers';
import { formatDate, supplierStatusConfig, supplierRatingConfig, materialCategoryConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { SupplierQuotationItem } from '../../types';

const { Title, Text } = Typography;

const supplierTypeLabels: Record<string, string> = { military: 'Đối tác chiến lược', domestic: 'Trong nước', foreign: 'Nước ngoài' };

// ─── History Tab Component ──────────────────────────────────
import type { PriceHistory } from '../../types';

const HistoryTab: React.FC<{ supplierId: string; histories: PriceHistory[] }> = ({ supplierId, histories }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<string | undefined>(undefined);

  // Build chart + table data
  const { chartData, tableData, materialOptions } = useMemo(() => {
    const chart: { year: string; value: number; material: string }[] = [];
    const table: { key: string; materialId: string; materialName: string; year: number; unitPrice: number; quantity: number; trend: number | null }[] = [];
    const matOpts: { value: string; label: string }[] = [];

    histories.forEach(h => {
      const records = h.records.filter(r => r.supplierId === supplierId).sort((a, b) => a.year - b.year);
      if (records.length === 0) return;

      matOpts.push({ value: h.materialId, label: h.materialName });

      records.forEach((rec, idx) => {
        chart.push({ year: String(rec.year), value: rec.unitPrice, material: h.materialName });
        const prev = idx > 0 ? records[idx - 1] : null;
        const trend = prev ? ((rec.unitPrice - prev.unitPrice) / prev.unitPrice * 100) : null;
        table.push({
          key: `${h.materialId}-${rec.year}`,
          materialId: h.materialId,
          materialName: h.materialName,
          year: rec.year,
          unitPrice: rec.unitPrice,
          quantity: rec.quantity,
          trend,
        });
      });
    });

    return { chartData: chart, tableData: table, materialOptions: matOpts };
  }, [histories, supplierId]);

  // Filtered chart data
  const filteredChartData = useMemo(() => {
    if (!selectedMaterial) return chartData;
    const mat = histories.find(h => h.materialId === selectedMaterial);
    if (!mat) return chartData;
    return chartData.filter(d => d.material === mat.materialName);
  }, [chartData, selectedMaterial, histories]);

  // Filtered table data
  const filteredTableData = useMemo(() => {
    let data = tableData;
    if (selectedMaterial) data = data.filter(d => d.materialId === selectedMaterial);
    if (searchText) {
      const q = searchText.toLowerCase();
      data = data.filter(d => d.materialName.toLowerCase().includes(q));
    }
    return data.sort((a, b) => a.materialName.localeCompare(b.materialName) || b.year - a.year);
  }, [tableData, selectedMaterial, searchText]);

  if (histories.length === 0) {
    return <Empty description="Chưa có lịch sử mua sắm với nhà cung cấp này" />;
  }

  const lineConfig: any = {
    data: filteredChartData,
    xField: 'year',
    yField: 'value',
    colorField: 'material',
    shapeField: 'smooth',
    height: 320,
    style: { lineWidth: 2.5 },
    point: { shapeField: 'circle', sizeField: 4 },
    scale: { color: { range: [colors.navy, colors.success, colors.warning, colors.info, '#7c3aed', '#d97706', colors.danger, '#0891b2'] } },
    axis: { y: { labelFormatter: (v: number) => `${v} tr` } },
    legend: { color: { position: 'top', layout: { justifyContent: 'flex-start' }, maxRows: 2, itemMarker: 'smooth' } },
    padding: [8, 16, 8, 16],
  };

  const tableColumns: ColumnsType<typeof tableData[0]> = [
    { title: 'Vật tư', dataIndex: 'materialName', key: 'name', width: 250, ellipsis: true,
      render: (name: string) => <Text strong style={{ fontSize: 13 }}>{name}</Text> },
    { title: 'Năm', dataIndex: 'year', key: 'year', width: 80, align: 'center',
      render: (y: number) => <Tag color={colors.navy}>{y}</Tag>,
      sorter: (a, b) => a.year - b.year },
    { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'price', width: 120, align: 'right',
      render: (v: number) => <Text strong style={{ fontSize: 14, color: colors.navy }}>{v}</Text>,
      sorter: (a, b) => a.unitPrice - b.unitPrice },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'qty', width: 90, align: 'right',
      render: (v: number) => <Text>{v}</Text> },
    { title: 'Biến động', dataIndex: 'trend', key: 'trend', width: 110, align: 'center',
      render: (v: number | null) => {
        if (v === null) return <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
        return (
          <Text style={{ fontSize: 13, fontWeight: 600, color: v > 0 ? colors.danger : v < 0 ? colors.success : colors.textSecondary }}>
            {v > 0 ? <RiseOutlined style={{ marginRight: 2 }} /> : v < 0 ? <FallOutlined style={{ marginRight: 2 }} /> : null}
            {v > 0 ? '+' : ''}{v.toFixed(1)}%
          </Text>
        );
      },
      sorter: (a, b) => (a.trend || 0) - (b.trend || 0) },
  ];

  return (
    <div>
      {/* Filter */}
      <Row gutter={12} style={{ marginBottom: 16 }} align="middle">
        <Col xs={24} sm={8} md={6}>
          <Input
            prefix={<SearchOutlined style={{ color: colors.navy }} />}
            placeholder="Tìm vật tư..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
            size="small"
          />
        </Col>
        <Col xs={24} sm={10} md={6}>
          <Select
            placeholder="Lọc theo vật tư"
            value={selectedMaterial}
            onChange={setSelectedMaterial}
            allowClear
            style={{ width: '100%' }}
            size="small"
            options={materialOptions}
          />
        </Col>
        <Col>
          <Text type="secondary" style={{ fontSize: 12 }}>{filteredTableData.length} bản ghi | {materialOptions.length} loại vật tư</Text>
        </Col>
      </Row>

      {/* Chart */}
      <Card style={{ borderRadius: 10, marginBottom: 16, border: `1px solid ${colors.border}` }} styles={{ body: { padding: 16 } }}>
        <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block', marginBottom: 12 }}>
          Biến động giá theo năm {selectedMaterial ? '' : `(${materialOptions.length} loại vật tư)`}
        </Text>
        <Line {...lineConfig} />
      </Card>

      {/* Table */}
      <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block', marginBottom: 12 }}>
        Chi tiết lịch sử giá ({filteredTableData.length} bản ghi)
      </Text>
      <Table
        columns={tableColumns}
        dataSource={filteredTableData}
        rowKey="key"
        size="small"
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} bản ghi` }}
      />
    </div>
  );
};

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const supplier = suppliers.find(s => s.id === id);

  if (!supplier) {
    return (
      <div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/suppliers')} style={{ padding: 0, marginBottom: 16 }}>Quay lại danh sách</Button>
        <Empty description="Không tìm thấy nhà cung cấp" />
      </div>
    );
  }

  const ratingCfg = supplierRatingConfig[supplier.rating];
  const statusCfg = supplierStatusConfig[supplier.status];
  const quotations = supplierQuotations.filter(q => q.supplierId === supplier.id);
  const histories = priceHistories.filter(p => p.records.some(r => r.supplierId === supplier.id));

  // All quotation items flattened for table
  const allQuotationItems = useMemo(() => {
    const items: (SupplierQuotationItem & { quotationCode: string; quotationDate: string; validUntil: string })[] = [];
    quotations.forEach(q => {
      q.items.forEach(item => {
        items.push({ ...item, quotationCode: q.quotationCode, quotationDate: q.quotationDate, validUntil: q.validUntil });
      });
    });
    return items;
  }, [quotations]);

  const quotationColumns: ColumnsType<typeof allQuotationItems[0]> = [
    { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 110, render: (code: string) => <Text strong style={{ color: colors.navy }}>{code}</Text> },
    { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name', ellipsis: true },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 70, align: 'center' },
    { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', key: 'price', width: 110, align: 'right',
      render: (v: number) => <Text strong style={{ color: colors.navy, fontSize: 14 }}>{v}</Text> },
    { title: 'SL tối thiểu', dataIndex: 'minOrderQty', key: 'moq', width: 100, align: 'center',
      render: (v: number | undefined) => v ? <Text>{v}</Text> : <Text type="secondary">--</Text> },
    { title: 'Thời gian giao', dataIndex: 'leadTimeDays', key: 'lead', width: 110, align: 'center',
      render: (v: number | undefined) => v ? <Tag color="processing">{v} ngày</Tag> : <Text type="secondary">--</Text> },
    { title: 'Mã báo giá', dataIndex: 'quotationCode', key: 'qcode', width: 160,
      render: (code: string) => <Text style={{ fontSize: 12, color: colors.textSecondary }}>{code}</Text> },
    { title: 'Ngày BG', dataIndex: 'quotationDate', key: 'qdate', width: 100,
      render: (d: string) => <Text style={{ fontSize: 12 }}>{formatDate(d)}</Text> },
    { title: 'Hiệu lực đến', dataIndex: 'validUntil', key: 'valid', width: 110,
      render: (d: string) => {
        const expired = new Date(d) < new Date();
        return <Text style={{ fontSize: 12, color: expired ? colors.danger : colors.textPrimary, fontWeight: expired ? 600 : 400 }}>{formatDate(d)}</Text>;
      } },
    { title: 'Ghi chú', dataIndex: 'note', key: 'note', width: 150, ellipsis: true,
      render: (note: string | undefined) => note || <Text type="secondary">--</Text> },
  ];

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/suppliers')} style={{ color: colors.navy, padding: 0, marginBottom: 16, fontSize: 14 }}>
        Quay lại danh sách
      </Button>

      {/* Hero Header */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{ background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShopOutlined style={{ fontSize: 26, color: colors.goldLight }} />
            </div>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 600 }}>{supplier.name}</Title>
              <Space size={8} wrap style={{ marginTop: 10 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>{supplier.code}</Tag>
                <Tag color={supplier.type === 'military' ? '#1B3A5C' : supplier.type === 'foreign' ? '#7c3aed' : '#0891b2'}>
                  {supplierTypeLabels[supplier.type]}
                </Tag>
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              </Space>
            </div>
            <div style={{ display: 'flex', gap: 20, textAlign: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: ratingCfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{supplier.rating}</span>
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{ratingCfg.label}</Text>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{supplier.totalContracts}</div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Hợp đồng</Text>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{supplier.onTimeRate}%</div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Đúng hạn</Text>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{supplier.qualityRate}%</div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Chất lượng</Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: '0 24px 24px' } }}>
        <Tabs items={[
          {
            key: 'info',
            label: <Space size={6}><UserOutlined /><span>Thông tin chung</span></Space>,
            children: (
              <Row gutter={24}>
                <Col xs={24} md={14}>
                  <Card title={<Space size={8}><FileTextOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy }}>Thông tin doanh nghiệp</Text></Space>}
                    style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '20px 24px' } }}>
                    <Row gutter={[0, 20]}>
                      <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}>Mã NCC:</Text><div style={{ fontSize: 15, fontWeight: 600, color: colors.navy, marginTop: 4 }}>{supplier.code}</div></Col>
                      <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}>Tên viết tắt:</Text><div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>{supplier.shortName}</div></Col>
                      <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}>Mã số thuế:</Text><div style={{ fontSize: 15, marginTop: 4 }}>{supplier.taxCode}</div></Col>
                      <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}>Ngày đăng ký:</Text><div style={{ fontSize: 15, marginTop: 4 }}>{formatDate(supplier.registeredDate)}</div></Col>
                      <Col span={24}><Text type="secondary" style={{ fontSize: 13 }}><EnvironmentOutlined style={{ marginRight: 4 }} />Địa chỉ:</Text><div style={{ fontSize: 15, marginTop: 4 }}>{supplier.address}</div></Col>
                    </Row>
                  </Card>
                  <Card title={<Space size={8}><PhoneOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy }}>Liên hệ</Text></Space>}
                    style={{ borderRadius: 12 }} styles={{ body: { padding: '20px 24px' } }}>
                    <Row gutter={[0, 20]}>
                      <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}><UserOutlined style={{ marginRight: 4 }} />Người liên hệ:</Text><div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>{supplier.contactPerson}</div></Col>
                      <Col span={12}><Text type="secondary" style={{ fontSize: 13 }}><PhoneOutlined style={{ marginRight: 4 }} />Số điện thoại:</Text><div style={{ fontSize: 15, marginTop: 4 }}>{supplier.phone}</div></Col>
                      {supplier.email && <Col span={24}><Text type="secondary" style={{ fontSize: 13 }}><MailOutlined style={{ marginRight: 4 }} />Email:</Text><div style={{ fontSize: 15, marginTop: 4 }}>{supplier.email}</div></Col>}
                    </Row>
                  </Card>
                </Col>
                <Col xs={24} md={10}>
                  <Card title={<Space size={8}><SafetyCertificateOutlined style={{ color: colors.navy }} /><Text strong style={{ color: colors.navy }}>Năng lực & Chứng nhận</Text></Space>}
                    style={{ borderRadius: 12, height: '100%' }} styles={{ body: { padding: '20px 24px' } }}>
                    <div style={{ marginBottom: 20 }}>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Danh mục cung cấp:</Text>
                      <Space size={6} wrap>
                        {supplier.categories.map(cat => {
                          const cfg = materialCategoryConfig[cat];
                          return <Tag key={cat} color={cfg.color} style={{ fontSize: 12 }}>{cfg.label}</Tag>;
                        })}
                      </Space>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Chứng nhận:</Text>
                      <Space size={6} wrap>
                        {supplier.certifications.map(cert => (
                          <Tag key={cert} icon={<SafetyCertificateOutlined />} style={{ fontSize: 12, background: '#f5f7fa', border: '1px solid #e8e8e8', color: colors.navy }}>{cert}</Tag>
                        ))}
                      </Space>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'quotations',
            label: <Space size={6}><DollarOutlined /><span>Báo giá</span><Tag color={colors.navy} style={{ fontSize: 11 }}>{allQuotationItems.length}</Tag></Space>,
            children: (
              <div>
                {/* Danh sách báo giá (file đính kèm) */}
                {quotations.length > 0 && (
                  <div style={{ marginBottom: 16, padding: '12px 16px', background: colors.bgLight, borderRadius: 8 }}>
                    <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 8 }}>File báo giá đã nhận:</Text>
                    <Space size={8} wrap>
                      {quotations.map(q => (
                        <Tooltip key={q.id} title={`${q.quotationCode} | Ngày: ${formatDate(q.quotationDate)} | Hiệu lực đến: ${formatDate(q.validUntil)}${q.note ? ` | ${q.note}` : ''}`}>
                          <Tag icon={<PaperClipOutlined />} style={{ cursor: 'pointer', fontSize: 12 }} color="processing">
                            {q.attachmentName || q.quotationCode}
                          </Tag>
                        </Tooltip>
                      ))}
                    </Space>
                  </div>
                )}

                {/* Bảng đơn giá chi tiết */}
                <Text strong style={{ fontSize: 14, color: colors.navy, display: 'block', marginBottom: 12 }}>
                  Bảng đơn giá vật tư ({allQuotationItems.length} loại)
                </Text>
                {allQuotationItems.length === 0 ? (
                  <Empty description="Chưa có báo giá nào từ nhà cung cấp này" />
                ) : (
                  <Table
                    columns={quotationColumns}
                    dataSource={allQuotationItems}
                    rowKey={(_, idx) => `qi-${idx}`}
                    size="small"
                    pagination={false}
                    scroll={{ x: 1200 }}
                  />
                )}
              </div>
            ),
          },
          {
            key: 'history',
            label: <Space size={6}><HistoryOutlined /><span>Lịch sử giá</span><Tag color="#d97706" style={{ fontSize: 11 }}>{histories.length}</Tag></Space>,
            children: <HistoryTab supplierId={supplier.id} histories={histories} />,
          },
        ]} />
      </Card>
    </div>
  );
};

export default SupplierDetail;
