import React, { useState } from 'react';
import {
  Card, Tag, Typography, Table, Space, Button, Empty, Tabs, Descriptions,
  Drawer, Form, Input, InputNumber, Alert, Divider, Row, Col,
} from 'antd';
import {
  ArrowLeftOutlined, AuditOutlined, CalendarOutlined,
  UserOutlined, CheckCircleOutlined, DollarOutlined,
  FileTextOutlined, TeamOutlined, ClockCircleOutlined,
  TrophyOutlined, StarFilled, SafetyCertificateOutlined,
  DownloadOutlined, LinkOutlined, PaperClipOutlined, GlobalOutlined,
  SendOutlined, EnvironmentOutlined, BankOutlined,
  SolutionOutlined, FolderOpenOutlined,
} from '@ant-design/icons';
import { message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';

import { biddingPackages } from '../../data/bidding';
import { supplyPlans } from '../../data/supplyPlans';
import { formatCurrency, formatDate, biddingStatusConfig, biddingTypeConfig, biddingMethodConfig, contractTypeConfig, biddingScopeConfig } from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { BiddingItem, BidSubmission, QualifiedSupplier } from '../../types';

const { Title, Text } = Typography;

const sectionHeaderStyle: React.CSSProperties = {
  background: colors.navy,
  color: '#fff',
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  borderRadius: '6px 6px 0 0',
  marginTop: 20,
};

const sectionHeaderLightStyle: React.CSSProperties = {
  background: colors.bgLight,
  color: colors.navy,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  borderRadius: '6px 6px 0 0',
  marginTop: 20,
  borderBottom: `1px solid ${colors.border}`,
};

const descLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: colors.navy,
  fontWeight: 500,
  width: 200,
  background: colors.bgLight,
};

const descContentStyle: React.CSSProperties = {
  fontSize: 14,
};

const formatDateTime = (date: string): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const BiddingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const pkg = biddingPackages.find(p => p.id === id);
  const [nccModalVisible, setNccModalVisible] = useState(false);
  const [hsdtModalVisible, setHsdtModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [nccForm] = Form.useForm();
  const [hsdtForm] = Form.useForm();
  const [resultForm] = Form.useForm();

  if (!pkg) {
    return (
      <div>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/bidding')} style={{ padding: 0, marginBottom: 16 }}>
          Quay lại danh sách
        </Button>
        <Empty description="Không tìm thấy gói thầu" />
      </div>
    );
  }

  const statusCfg = biddingStatusConfig[pkg.status];
  const typeCfg = biddingTypeConfig[pkg.type];
  const supplyPlan = supplyPlans.find(p => p.id === pkg.supplyPlanId);
  const isDirectBidding = pkg.type === 'direct';

  const biddingModeLabel = pkg.biddingMode === 'online'
    ? 'Qua mạng'
    : pkg.biddingMode === 'offline'
      ? 'Trực tiếp (Ngoài tuyến)'
      : 'Kết hợp';

  // Item columns
  const itemColumns: ColumnsType<BiddingItem> = [
    { title: 'STT', key: 'stt', width: 50, align: 'center',
      render: (_: unknown, __: BiddingItem, idx: number) => <Text strong style={{ color: colors.navy }}>{idx + 1}</Text> },
    { title: 'Mã VT', dataIndex: 'materialCode', key: 'code', width: 110,
      render: (code: string) => <Text strong style={{ color: colors.navy, fontSize: 14 }}>{code}</Text> },
    { title: 'Tên vật tư', dataIndex: 'materialName', key: 'name',
      render: (name: string) => <Text style={{ fontSize: 14 }}>{name}</Text> },
    { title: 'ĐVT', dataIndex: 'unit', key: 'unit', width: 70, align: 'center' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'qty', width: 90, align: 'right',
      render: (v: number) => <Text strong style={{ fontSize: 14 }}>{v}</Text> },
    { title: 'Đơn giá (tr)', dataIndex: 'estimatedPrice', key: 'price', width: 110, align: 'right',
      render: (v: number) => <Text>{v}</Text> },
    { title: 'Thành tiền (tr)', dataIndex: 'totalValue', key: 'total', width: 120, align: 'right',
      render: (v: number) => <Text strong style={{ color: colors.navy }}>{v}</Text> },
    { title: 'Yêu cầu kỹ thuật', dataIndex: 'technicalRequirement', key: 'tech', width: 250, ellipsis: true,
      render: (v: string | undefined) => v || <Text type="secondary">--</Text> },
    { title: 'Hạn giao', dataIndex: 'deadline', key: 'deadline', width: 110,
      render: (d: string) => formatDate(d) },
  ];

  // Submission columns
  const submissionColumns: ColumnsType<BidSubmission> = [
    { title: 'STT', key: 'stt', width: 50, align: 'center',
      render: (_: unknown, __: BidSubmission, idx: number) => <Text strong>{idx + 1}</Text> },
    { title: 'Nhà cung cấp', dataIndex: 'supplierName', key: 'name', width: 220,
      render: (name: string, record: BidSubmission) => (
        <Space size={6}>
          <Text strong style={{ fontSize: 14 }}>{name}</Text>
          {record.isSelected && <StarFilled style={{ color: colors.gold, fontSize: 14 }} />}
        </Space>
      ) },
    { title: 'Giá chào (tr)', dataIndex: 'totalPrice', key: 'price', width: 120, align: 'right',
      render: (v: number) => <Text strong style={{ color: colors.navy, fontSize: 14 }}>{formatCurrency(v)}</Text>,
      sorter: (a, b) => a.totalPrice - b.totalPrice },
    { title: 'Thời gian giao', dataIndex: 'deliveryDays', key: 'delivery', width: 110, align: 'center',
      render: (v: number) => <Tag color="processing">{v} ngày</Tag> },
    { title: 'Điểm kỹ thuật', dataIndex: 'technicalScore', key: 'tech', width: 110, align: 'center',
      render: (v: number) => <Text strong style={{ color: v >= 90 ? colors.success : v >= 80 ? colors.warning : colors.danger }}>{v}</Text>,
      sorter: (a, b) => a.technicalScore - b.technicalScore },
    { title: 'Điểm giá', dataIndex: 'priceScore', key: 'priceScore', width: 90, align: 'center',
      render: (v: number) => <Text strong style={{ color: v >= 90 ? colors.success : v >= 80 ? colors.warning : colors.danger }}>{v}</Text> },
    { title: 'Tổng điểm', dataIndex: 'totalScore', key: 'total', width: 100, align: 'center',
      render: (v: number, record: BidSubmission) => (
        <Text strong style={{ fontSize: 15, color: record.isSelected ? colors.success : colors.navy }}>{v}</Text>
      ),
      sorter: (a, b) => a.totalScore - b.totalScore,
      defaultSortOrder: 'descend' },
    { title: 'Ngày nộp', dataIndex: 'submittedDate', key: 'date', width: 110,
      render: (d: string) => formatDate(d) },
    { title: 'Kết quả', key: 'result', width: 110, align: 'center',
      render: (_: unknown, record: BidSubmission) => {
        if (record.isSelected) return <Tag color="success" icon={<TrophyOutlined />}>Trúng thầu</Tag>;
        return <Text type="secondary" style={{ fontSize: 12 }}>Không trúng</Text>;
      } },
  ];

  // ───── Tab 1: Thông tin gói thầu ─────
  const renderTabInvitation = () => (
    <div>
      {/* Thông tin cơ bản — chỉ hiển thị cho hình thức không phải chỉ định thầu */}
      {!isDirectBidding && (
        <>
          <div style={sectionHeaderStyle}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            Thông tin thông báo mời thầu
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small"
              labelStyle={descLabelStyle} contentStyle={descContentStyle}>
              <Descriptions.Item label="Mã TBMT">
                <Text strong style={{ color: colors.navy }}>{pkg.muasamcongCode || pkg.code}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đăng tải">
                {pkg.publishDate ? formatDate(pkg.publishDate) : <Text type="secondary">Chưa đăng tải</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Thông tin chung KHLCNT */}
          {(pkg.khlcntCode || pkg.khlcntCategory || pkg.procurementName) && (
            <>
              <div style={sectionHeaderLightStyle}>
                <FolderOpenOutlined style={{ marginRight: 8 }} />
                Thông tin chung KHLCNT
              </div>
              <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small"
                  labelStyle={descLabelStyle} contentStyle={descContentStyle}>
                  {pkg.khlcntCode && (
                    <Descriptions.Item label="Mã KHLCNT">
                      <Text strong>{pkg.khlcntCode}</Text>
                    </Descriptions.Item>
                  )}
                  {pkg.khlcntCategory && (
                    <Descriptions.Item label="Phân loại">
                      <Tag color="processing">{pkg.khlcntCategory}</Tag>
                    </Descriptions.Item>
                  )}
                  {pkg.procurementName && (
                    <Descriptions.Item label="Tên dự toán mua sắm" span={2}>
                      {pkg.procurementName}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            </>
          )}
        </>
      )}

      {/* Thông tin gói thầu */}
      <div style={sectionHeaderStyle}>
        <AuditOutlined style={{ marginRight: 8 }} />
        Thông tin gói thầu
      </div>
      <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small"
          labelStyle={descLabelStyle} contentStyle={descContentStyle}>
          <Descriptions.Item label="Quy trình áp dụng">
            <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tên gói thầu">
            <Text strong>{pkg.title}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Chủ đầu tư">
            <Space size={6}>
              <BankOutlined style={{ color: colors.navy }} />
              <Text>{pkg.investor}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Nguồn vốn">
            {pkg.fundingSource}
          </Descriptions.Item>
          <Descriptions.Item label="Lĩnh vực">
            <Tag>{pkg.sector}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Hình thức LCNT">
            <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Loại hợp đồng">
            {contractTypeConfig[pkg.contractType].label}
          </Descriptions.Item>
          <Descriptions.Item label="Trong nước / Quốc tế">
            {biddingScopeConfig[pkg.scope].label}
          </Descriptions.Item>
          <Descriptions.Item label="Phương thức LCNT">
            {biddingMethodConfig[pkg.method].label}
          </Descriptions.Item>
          <Descriptions.Item label="Giá gói thầu">
            <Text strong style={{ color: colors.navy, fontSize: 15 }}>{formatCurrency(pkg.estimatedValue)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian thực hiện HĐ">
            <Text strong>{pkg.executionDays} ngày</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Nhiều phần / lô">
            {pkg.hasMultipleLots ? <Tag color="processing">Có</Tag> : <Tag>Không</Tag>}
          </Descriptions.Item>
          {supplyPlan && (
            <Descriptions.Item label="KH bảo đảm VT" span={2}>
              {supplyPlan.code} &mdash; {supplyPlan.title}
            </Descriptions.Item>
          )}
        </Descriptions>
      </div>

      {/* Cách thức dự thầu — chỉ hiển thị cho hình thức đấu thầu/chào giá */}
      {!isDirectBidding && (
        <>
          <div style={sectionHeaderLightStyle}>
            <SolutionOutlined style={{ marginRight: 8 }} />
            Cách thức dự thầu
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small"
              labelStyle={descLabelStyle} contentStyle={descContentStyle}>
              <Descriptions.Item label="Hình thức dự thầu">
                {biddingModeLabel}
              </Descriptions.Item>
              <Descriptions.Item label="Địa điểm thực hiện">
                <Space size={6}>
                  <EnvironmentOutlined style={{ color: colors.navy }} />
                  <Text>{pkg.executionLocation}</Text>
                </Space>
              </Descriptions.Item>
              {pkg.eHsmtUrl && (
                <Descriptions.Item label="Địa điểm phát hành e-HSMT" span={2}>
                  <a href={pkg.eHsmtUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.navy }}>
                    <LinkOutlined style={{ marginRight: 4 }} />{pkg.eHsmtUrl}
                  </a>
                </Descriptions.Item>
              )}
              {pkg.eHsdtFee !== undefined && (
                <Descriptions.Item label="Chi phí nộp e-HSDT">
                  {pkg.eHsdtFee > 0 ? `${pkg.eHsdtFee.toLocaleString('vi-VN')} VND` : 'Miễn phí'}
                </Descriptions.Item>
              )}
              {pkg.eHsdtUrl && (
                <Descriptions.Item label="Địa điểm nhận e-HSDT">
                  <a href={pkg.eHsdtUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.navy }}>
                    <LinkOutlined style={{ marginRight: 4 }} />{pkg.eHsdtUrl}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          {/* Thông tin dự thầu */}
          <div style={sectionHeaderStyle}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Thông tin dự thầu
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small"
              labelStyle={descLabelStyle} contentStyle={descContentStyle}>
              <Descriptions.Item label="Thời điểm đóng thầu">
                {pkg.closingDateTime ? (
                  <Text strong style={{ color: colors.warning }}>{formatDateTime(pkg.closingDateTime)}</Text>
                ) : <Text type="secondary">Chưa xác định</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Thời điểm mở thầu">
                {pkg.openingDateTime ? (
                  <Text strong style={{ color: colors.navy }}>{formatDateTime(pkg.openingDateTime)}</Text>
                ) : <Text type="secondary">Chưa xác định</Text>}
              </Descriptions.Item>
              {pkg.openingLocation && (
                <Descriptions.Item label="Địa điểm mở thầu" span={2}>
                  <Space size={6}>
                    <EnvironmentOutlined style={{ color: colors.navy }} />
                    <Text>{pkg.openingLocation}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Hiệu lực HSDT">
                {pkg.hsdtValidityDays ? <Text strong>{pkg.hsdtValidityDays} ngày</Text> : <Text type="secondary">--</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="Bảo đảm dự thầu">
                {pkg.depositAmount ? (
                  <Space direction="vertical" size={2}>
                    <Text strong style={{ color: colors.navy }}>{formatCurrency(pkg.depositAmount)}</Text>
                    {pkg.depositForm && <Text type="secondary" style={{ fontSize: 12 }}>Hình thức: {pkg.depositForm}</Text>}
                  </Space>
                ) : <Text type="secondary">Không yêu cầu</Text>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </>
      )}

      {/* Thông tin quyết định phê duyệt */}
      {pkg.approvalDecisionNo && (
        <>
          <div style={sectionHeaderLightStyle}>
            <CheckCircleOutlined style={{ marginRight: 8 }} />
            Thông tin quyết định phê duyệt
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px' }}>
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small"
              labelStyle={descLabelStyle} contentStyle={descContentStyle}>
              <Descriptions.Item label="Số quyết định">
                <Text strong style={{ color: colors.navy }}>{pkg.approvalDecisionNo}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày phê duyệt">
                {pkg.approvalDate ? formatDate(pkg.approvalDate) : '--'}
              </Descriptions.Item>
              {pkg.approvalAuthority && (
                <Descriptions.Item label="Cơ quan phê duyệt" span={2}>
                  {pkg.approvalAuthority}
                </Descriptions.Item>
              )}
              {pkg.approvalAttachment && (
                <Descriptions.Item label="File đính kèm" span={2}>
                  <Button size="small" icon={<DownloadOutlined />}
                    onClick={() => message.info(`Đang tải: ${pkg.approvalAttachment}`)}>
                    {pkg.approvalAttachment}
                  </Button>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </>
      )}

      {/* Người lập */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: colors.bgLight, borderRadius: 6, border: `1px solid ${colors.border}` }}>
        <Space size={16}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            Người lập: <Text strong>{pkg.createdBy}</Text>
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            Ngày tạo: {formatDate(pkg.createdDate)}
          </Text>
        </Space>
      </div>
    </div>
  );

  // ───── Tab 2: Hồ sơ mời thầu ─────
  const renderTabHSMT = () => (
    <div>
      {/* Tài liệu đính kèm */}
      <div style={sectionHeaderStyle}>
        <PaperClipOutlined style={{ marginRight: 8 }} />
        Tài liệu đính kèm
      </div>
      <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px', padding: 16 }}>
        {pkg.attachments && pkg.attachments.length > 0 ? (
          <Space size={8} wrap>
            {pkg.attachments.map((file, idx) => (
              <Button key={idx} icon={<DownloadOutlined />}
                onClick={() => message.info(`Đang tải: ${file}`)}
                style={{ fontSize: 13 }}>
                {file}
              </Button>
            ))}
          </Space>
        ) : (
          <Empty description="Chưa có tài liệu đính kèm" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      {/* Yêu cầu kỹ thuật chung */}
      <div style={sectionHeaderLightStyle}>
        <SafetyCertificateOutlined style={{ marginRight: 8 }} />
        Yêu cầu kỹ thuật chung
      </div>
      <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px', padding: 16 }}>
        <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
          {pkg.technicalRequirements || 'Chưa có yêu cầu kỹ thuật chung'}
        </Text>
      </div>

      {/* Điều kiện thanh toán */}
      <div style={sectionHeaderLightStyle}>
        <DollarOutlined style={{ marginRight: 8 }} />
        Điều kiện thanh toán
      </div>
      <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px', padding: 16 }}>
        <Text style={{ fontSize: 14, lineHeight: 1.6 }}>{pkg.paymentTerms}</Text>
      </div>

      {/* Liên kết muasamcong — chỉ hiển thị cho đấu thầu/chào giá */}
      {!isDirectBidding && pkg.muasamcongUrl && (
        <>
          <div style={sectionHeaderLightStyle}>
            <GlobalOutlined style={{ marginRight: 8 }} />
            Liên kết muasamcong
          </div>
          <div style={{ border: `1px solid ${colors.border}`, borderTop: 'none', borderRadius: '0 0 6px 6px', padding: 16 }}>
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12, fontSize: 12 }}
              message="Dữ liệu không đồng bộ tự động từ muasamcong.gov.vn. Thông tin nhà thầu tham gia, kết quả đấu thầu cần được cập nhật thủ công."
            />
            <Space direction="vertical" size={8}>
              {pkg.muasamcongCode && (
                <Text style={{ fontSize: 13 }}>Mã TBMT: <Text strong>{pkg.muasamcongCode}</Text></Text>
              )}
              <a href={pkg.muasamcongUrl} target="_blank" rel="noopener noreferrer" style={{ color: colors.navy, fontSize: 14 }}>
                <LinkOutlined style={{ marginRight: 4 }} />{pkg.muasamcongUrl}
              </a>
            </Space>
          </div>
        </>
      )}
    </div>
  );

  // ───── Tab 3: Danh mục vật tư ─────
  const renderTabItems = () => (
    <div>
      <Table
        columns={itemColumns}
        dataSource={pkg.items}
        rowKey="materialId"
        pagination={false}
        size="middle"
        scroll={{ x: 1100 }}
        summary={() => (
          <Table.Summary.Row style={{ backgroundColor: colors.bgLight }}>
            <Table.Summary.Cell index={0} colSpan={6}>
              <Text strong>Tổng giá trị dự toán</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right">
              <Text strong style={{ fontSize: 15, color: colors.navy }}>{formatCurrency(pkg.estimatedValue)}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} colSpan={2} />
          </Table.Summary.Row>
        )}
      />
    </div>
  );

  // ───── Tab 4: Hồ sơ dự thầu / Báo giá NCC ─────
  const renderTabSubmissions = () => (
    <div>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {!isDirectBidding ? (
          <Alert
            type="warning"
            showIcon
            style={{ flex: 1, fontSize: 12, marginBottom: 0 }}
            message={
              <span>
                Dữ liệu nhà thầu tham gia <strong>không đồng bộ tự động</strong> từ muasamcong.gov.vn.
                Sau khi có kết quả trên hệ thống mua sắm công, nhấn nút <strong>"Cập nhật HSDT"</strong> để nhập thủ công.
              </span>
            }
          />
        ) : <div style={{ flex: 1 }} />}
        <Button type="primary" icon={<TeamOutlined />} onClick={() => setHsdtModalVisible(true)} style={{ flexShrink: 0 }}>
          {isDirectBidding ? 'Cập nhật báo giá' : 'Cập nhật HSDT'}
        </Button>
      </div>
      {pkg.submissions.length === 0 ? (
        <Empty description={isDirectBidding ? 'Chưa có thông tin báo giá NCC' : 'Chưa có hồ sơ dự thầu. Nhấn "Cập nhật HSDT" sau khi có kết quả từ muasamcong.'} />
      ) : (
        <Table
          columns={submissionColumns}
          dataSource={pkg.submissions}
          rowKey="supplierId"
          pagination={false}
          size="middle"
          scroll={{ x: 1100 }}
          rowClassName={(record) => record.isSelected ? 'row-executing' : ''}
        />
      )}
    </div>
  );

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/bidding')}
        style={{ color: colors.navy, padding: 0, marginBottom: 16, fontSize: 14 }}>
        Quay lại danh sách
      </Button>

      {/* Hero Header */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)`,
          padding: '28px 32px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <AuditOutlined style={{ fontSize: 24, color: colors.goldLight }} />
            </div>
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ color: '#fff', margin: 0, fontSize: 20, fontWeight: 600 }}>{pkg.title}</Title>
              <Space size={8} wrap style={{ marginTop: 10 }}>
                <Tag style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }}>{pkg.code}</Tag>
                <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
                <Tag color={statusCfg.color}>{statusCfg.label}</Tag>
                {pkg.selectedSupplierName && <Tag color="success" icon={<TrophyOutlined />}>{pkg.selectedSupplierName}</Tag>}
              </Space>
            </div>
            <div style={{ display: 'flex', gap: 20, textAlign: 'center', flexShrink: 0 }}>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Giá trị dự toán</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{formatCurrency(pkg.estimatedValue)}</div>
              </div>
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Hồ sơ dự thầu</Text>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>{pkg.submissions.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info bar — chỉ link/tải tài liệu, không có nút hành động */}
        {(pkg.description || (!isDirectBidding && (pkg.attachments?.length || pkg.muasamcongUrl))) && (
          <div style={{
            padding: '10px 32px', background: colors.bgLight,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 14, flex: 1, color: '#555' }}>{pkg.description || ''}</Text>
            <Space size={8} style={{ flexShrink: 0, marginLeft: 16 }}>
              {!isDirectBidding && pkg.attachments && pkg.attachments.length > 0 && (
                <Button icon={<DownloadOutlined />} size="small" onClick={() => message.info('Đang tải hồ sơ mời thầu...')}>
                  Tải HSMT
                </Button>
              )}
              {!isDirectBidding && pkg.muasamcongUrl && (
                <Button icon={<GlobalOutlined />} size="small" onClick={() => window.open(pkg.muasamcongUrl, '_blank')}>
                  Xem trên muasamcong
                </Button>
              )}
            </Space>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        styles={{ body: { padding: '0 24px 24px' } }}>
        <Tabs items={[
          {
            key: 'invitation',
            label: <Space size={6}><FileTextOutlined /><span>{isDirectBidding ? 'Thông tin gói thầu' : 'Thông báo mời thầu'}</span></Space>,
            children: renderTabInvitation(),
          },
          {
            key: 'hsmt',
            label: <Space size={6}><PaperClipOutlined /><span>{isDirectBidding ? 'Hồ sơ & Yêu cầu' : 'Hồ sơ mời thầu'}</span></Space>,
            children: renderTabHSMT(),
          },
          {
            key: 'items',
            label: (
              <Space size={6}>
                <DollarOutlined />
                <span>Danh mục vật tư</span>
                <Tag color={colors.navy} style={{ fontSize: 11 }}>{pkg.items.length}</Tag>
              </Space>
            ),
            children: renderTabItems(),
          },
          // NCC đủ điều kiện - chỉ hiển thị với đấu thầu/chào giá
          ...(!isDirectBidding ? [{
            key: 'qualified',
            label: (
              <Space size={6}>
                <SafetyCertificateOutlined />
                <span>NCC đủ điều kiện</span>
                {(pkg.qualifiedSuppliers?.length || 0) > 0 && (
                  <Tag color={colors.success} style={{ fontSize: 11 }}>{pkg.qualifiedSuppliers?.filter((s: { qualificationStatus: string }) => s.qualificationStatus === 'qualified').length}</Tag>
                )}
              </Space>
            ),
            children: (
              <div>
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, padding: '10px 14px', background: '#f0f7ff', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SafetyCertificateOutlined style={{ color: colors.navy }} />
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Danh sách NCC đã được <Text strong style={{ fontSize: 12 }}>Phòng QA & Đảm bảo CL (pkkq-chatluong)</Text> kiểm tra năng lực và xác nhận đủ điều kiện tham gia đấu thầu.
                    </Text>
                  </div>
                  <Button type="primary" icon={<UserOutlined />} onClick={() => setNccModalVisible(true)}>
                    Cập nhật NCC
                  </Button>
                </div>
                {!pkg.qualifiedSuppliers || pkg.qualifiedSuppliers.length === 0 ? (
                  <Empty description="Chưa có danh sách NCC đủ điều kiện. Cần kiểm tra năng lực NCC sau khi đăng tải gói thầu." />
                ) : (
                  <Table
                    columns={[
                      { title: 'STT', key: 'stt', width: 50, align: 'center' as const,
                        render: (_: unknown, __: QualifiedSupplier, idx: number) => <Text strong>{idx + 1}</Text> },
                      { title: 'Nhà cung cấp', dataIndex: 'supplierName', key: 'name', width: 250,
                        render: (name: string) => <Text strong style={{ fontSize: 14 }}>{name}</Text> },
                      { title: 'Chứng nhận', dataIndex: 'certifications', key: 'certs', width: 250,
                        render: (certs: string[]) => (
                          <Space size={4} wrap>
                            {certs.map(c => <Tag key={c} icon={<SafetyCertificateOutlined />} style={{ fontSize: 11, margin: 0 }}>{c}</Tag>)}
                          </Space>
                        ) },
                      { title: 'Người kiểm tra', dataIndex: 'checkedBy', key: 'checker', width: 180 },
                      { title: 'Ngày kiểm tra', dataIndex: 'checkedDate', key: 'date', width: 110,
                        render: (d: string) => formatDate(d) },
                      { title: 'QC xác nhận', dataIndex: 'qcConfirmed', key: 'qc', width: 100, align: 'center' as const,
                        render: (v: boolean) => v
                          ? <Tag color="success" icon={<CheckCircleOutlined />}>Đã xác nhận</Tag>
                          : <Tag color="warning">Chờ xác nhận</Tag> },
                      { title: 'Kết quả', dataIndex: 'qualificationStatus', key: 'status', width: 120, align: 'center' as const,
                        render: (v: string) => {
                          if (v === 'qualified') return <Tag color="success">Đủ điều kiện</Tag>;
                          if (v === 'disqualified') return <Tag color="error">Không đủ ĐK</Tag>;
                          return <Tag color="warning">Đang xem xét</Tag>;
                        } },
                      { title: 'Ghi chú', dataIndex: 'capacityNote', key: 'note', width: 200, ellipsis: true,
                        render: (v: string | undefined) => v || <Text type="secondary">--</Text> },
                    ] as ColumnsType<QualifiedSupplier>}
                    dataSource={pkg.qualifiedSuppliers}
                    rowKey="supplierId"
                    size="middle"
                    pagination={false}
                    scroll={{ x: 1200 }}
                    rowClassName={(record: QualifiedSupplier) => record.qualificationStatus === 'disqualified' ? 'row-highlight' : ''}
                  />
                )}
              </div>
            ),
          }] : []),
          {
            key: 'submissions',
            label: (
              <Space size={6}>
                <TeamOutlined />
                <span>{isDirectBidding ? 'Báo giá NCC' : 'Hồ sơ dự thầu'}</span>
                <Tag color={pkg.submissions.length > 0 ? colors.navy : 'default'} style={{ fontSize: 11 }}>{pkg.submissions.length}</Tag>
              </Space>
            ),
            children: renderTabSubmissions(),
          },
          {
            key: 'result',
            label: (
              <Space size={6}>
                <TrophyOutlined />
                <span>{isDirectBidding ? 'Kết quả chỉ định' : 'Công bố kết quả'}</span>
                {pkg.result && <Tag color={colors.success} style={{ fontSize: 11 }}>{isDirectBidding ? 'Đã chỉ định' : 'Đã công bố'}</Tag>}
              </Space>
            ),
            children: (
              <div>
                {!pkg.result ? (
                  <div>
                    <Empty description={
                      pkg.status === 'approved'
                        ? (isDirectBidding
                          ? 'Gói thầu đã được phê duyệt. Vui lòng cập nhật thông tin nhà cung cấp được chỉ định.'
                          : 'Gói thầu đã được phê duyệt. Nhấn "Cập nhật thông tin thầu" để nhập kết quả từ muasamcong.')
                        : 'Chưa có kết quả. Gói thầu cần được phê duyệt trước khi công bố kết quả.'
                    } />
                    {pkg.status === 'approved' && (
                      <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Button type="primary" icon={<TrophyOutlined />}
                          onClick={() => setResultModalVisible(true)}>
                          Cập nhật kết quả thầu
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Thông tin NCC trúng thầu */}
                    {pkg.selectedSupplierName && (
                      <Card style={{ borderRadius: 10, marginBottom: 20, border: `2px solid ${colors.success}` }} styles={{ body: { padding: '20px 24px' } }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ width: 52, height: 52, borderRadius: 12, background: colors.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrophyOutlined style={{ fontSize: 24, color: '#fff' }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Nhà cung cấp trúng thầu</Text>
                            <div style={{ fontSize: 18, fontWeight: 600, color: colors.navy }}>{pkg.selectedSupplierName}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Giá trúng thầu</Text>
                            <div style={{ fontSize: 18, fontWeight: 600, color: colors.navy }}>
                              {formatCurrency(pkg.submissions.find(s => s.isSelected)?.totalPrice || 0)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Nút cập nhật kết quả */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                      <Button type="primary" icon={<TrophyOutlined />} onClick={() => setResultModalVisible(true)}>
                        Cập nhật kết quả
                      </Button>
                    </div>

                    {/* Thông tin công bố */}
                    <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
                      <Descriptions.Item label={isDirectBidding ? 'Số quyết định chỉ định thầu' : 'Mã thông báo KQLCNT'}>
                        <Text strong style={{ color: colors.navy }}>{pkg.result.announcementCode || '--'}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label={isDirectBidding ? 'Ngày quyết định' : 'Ngày công bố'}>
                        {pkg.result.announcementDate ? formatDate(pkg.result.announcementDate) : '--'}
                      </Descriptions.Item>
                      {!isDirectBidding && pkg.result.muasamcongResultUrl && (
                        <Descriptions.Item label="Kết quả trên muasamcong" span={2}>
                          <Button type="link" icon={<GlobalOutlined />} style={{ padding: 0 }}
                            onClick={() => message.info(`Mở: ${pkg.result!.muasamcongResultUrl}`)}>
                            {pkg.result.muasamcongResultUrl}
                          </Button>
                        </Descriptions.Item>
                      )}
                      {pkg.result.resultAttachment && (
                        <Descriptions.Item label="File kết quả" span={2}>
                          <Button icon={<DownloadOutlined />} size="small"
                            onClick={() => message.info(`Đang tải: ${pkg.result!.resultAttachment}`)}>
                            {pkg.result.resultAttachment}
                          </Button>
                        </Descriptions.Item>
                      )}
                    </Descriptions>

                    {/* Thông tin phê duyệt */}
                    {pkg.approvalDecisionNo && (
                      <Descriptions bordered size="small" column={2} title={<Text strong style={{ fontSize: 14, color: colors.navy }}>Quyết định phê duyệt</Text>}>
                        <Descriptions.Item label="Số quyết định">
                          <Text strong>{pkg.approvalDecisionNo}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày phê duyệt">
                          {pkg.approvalDate ? formatDate(pkg.approvalDate) : '--'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Cơ quan ban hành">
                          {pkg.approvalAuthority || '--'}
                        </Descriptions.Item>
                        {pkg.approvalAttachment && (
                          <Descriptions.Item label="File quyết định">
                            <Button icon={<DownloadOutlined />} size="small"
                              onClick={() => message.info(`Đang tải: ${pkg.approvalAttachment}`)}>
                              {pkg.approvalAttachment}
                            </Button>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]} />
      </Card>

      {/* ── Sticky footer — nút hành động theo trạng thái ── */}
      {pkg.status !== 'completed' && pkg.status !== 'cancelled' && (
        <div style={{
          position: 'sticky', bottom: 0, zIndex: 100,
          background: '#fff',
          borderTop: `1px solid ${colors.border}`,
          padding: '12px 32px',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          gap: 8,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
          borderRadius: '0 0 0 0',
          marginTop: 8,
        }}>
          <Button danger onClick={() => message.warning(`Đã hủy gói thầu ${pkg.code}`)}>
            Hủy gói thầu
          </Button>
          {!isDirectBidding && pkg.status === 'draft' && (
            <Button type="primary" icon={<SendOutlined />}
              onClick={() => message.success(`Đã đăng tải gói thầu ${pkg.code} lên muasamcong.gov.vn`)}>
              Đăng tải lên muasamcong
            </Button>
          )}
          {pkg.status === 'receiving' && (
            <Button type="primary" icon={<ClockCircleOutlined />}
              onClick={() => message.success(`Đã đóng thầu ${pkg.code}, chuyển sang đánh giá`)}>
              Đóng thầu
            </Button>
          )}
          {pkg.status === 'evaluating' && (
            <Button type="primary" icon={<CheckCircleOutlined />}
              onClick={() => message.success(`Đã trình phê duyệt kết quả ${pkg.code}`)}>
              Trình phê duyệt
            </Button>
          )}
          {pkg.status === 'approved' && pkg.result && (
            <Button type="primary" icon={<CheckCircleOutlined />}
              onClick={() => message.success(`Đã hoàn thành gói thầu ${pkg.code}`)}>
              Hoàn thành
            </Button>
          )}
        </div>
      )}

      {/* ── Drawer 1: Cập nhật NCC đủ điều kiện ── */}
      <Drawer
        open={nccModalVisible}
        onClose={() => { setNccModalVisible(false); nccForm.resetFields(); }}
        width={520}
        destroyOnClose
        closable={false}
        styles={{
          header: { padding: 0, border: 'none', background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)` },
          body: { padding: 0 },
        }}
        title={
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SafetyCertificateOutlined style={{ fontSize: 18, color: colors.goldLight }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>Cập nhật NCC đủ điều kiện</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>Thêm nhà cung cấp đã kiểm tra năng lực</div>
            </div>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '4px 0' }}>
            <Button onClick={() => { setNccModalVisible(false); nccForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" icon={<CheckCircleOutlined />}
              onClick={() => nccForm.validateFields().then(() => { message.success('Đã cập nhật danh sách NCC đủ điều kiện'); setNccModalVisible(false); nccForm.resetFields(); })}>
              Lưu
            </Button>
          </div>
        }
      >
        <Form form={nccForm} layout="vertical" style={{ padding: '20px 24px' }}>
          <Text strong style={{ fontSize: 14, color: colors.navy }}>Thông tin nhà cung cấp</Text>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="supplierName" label="Tên nhà cung cấp" rules={[{ required: true, message: 'Vui lòng nhập tên NCC' }]}>
            <Input placeholder="Tên công ty / đơn vị cung cấp" />
          </Form.Item>
          <Form.Item name="certifications" label="Chứng nhận (cách nhau bằng dấu phẩy)">
            <Input placeholder="ISO 9001, ISO 14001, IATF 16949..." />
          </Form.Item>

          <Text strong style={{ fontSize: 14, color: colors.navy }}>Kết quả kiểm tra năng lực</Text>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="checkedBy" label="Người kiểm tra">
                <Input placeholder="Họ tên, cấp bậc" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="checkedDate" label="Ngày kiểm tra">
                <Input placeholder="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="qualificationStatus" label="Kết quả" rules={[{ required: true, message: 'Chọn kết quả' }]}>
            <Input placeholder="Đủ điều kiện / Không đủ ĐK / Đang xem xét" />
          </Form.Item>
          <Form.Item name="capacityNote" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú về năng lực NCC" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ── Drawer 2: Cập nhật HSDT / Báo giá NCC ── */}
      <Drawer
        open={hsdtModalVisible}
        onClose={() => { setHsdtModalVisible(false); hsdtForm.resetFields(); }}
        width={520}
        destroyOnClose
        closable={false}
        styles={{
          header: { padding: 0, border: 'none', background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)` },
          body: { padding: 0 },
        }}
        title={
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TeamOutlined style={{ fontSize: 18, color: colors.goldLight }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>{isDirectBidding ? 'Cập nhật báo giá NCC' : 'Cập nhật hồ sơ dự thầu'}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
                {isDirectBidding ? 'Thông tin báo giá từ nhà cung cấp' : 'Nhập thủ công từ muasamcong.gov.vn'}
              </div>
            </div>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '4px 0' }}>
            <Button onClick={() => { setHsdtModalVisible(false); hsdtForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" icon={<CheckCircleOutlined />}
              onClick={() => hsdtForm.validateFields().then(() => { message.success('Đã cập nhật thông tin nhà thầu'); setHsdtModalVisible(false); hsdtForm.resetFields(); })}>
              Lưu
            </Button>
          </div>
        }
      >
        <Form form={hsdtForm} layout="vertical" style={{ padding: '20px 24px' }}>
          {!isDirectBidding && (
            <Alert type="info" showIcon style={{ marginBottom: 16, fontSize: 12 }}
              message="Dữ liệu từ muasamcong không đồng bộ tự động. Vui lòng nhập thủ công sau khi có kết quả." />
          )}
          <Text strong style={{ fontSize: 14, color: colors.navy }}>Thông tin nhà thầu</Text>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="supplierName" label="Tên nhà thầu / NCC" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Tên công ty" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="totalPrice" label="Giá chào (triệu VND)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập giá trị" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="deliveryDays" label="Giao hàng (ngày)">
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Số ngày" />
              </Form.Item>
            </Col>
          </Row>

          {!isDirectBidding && (
            <>
              <Text strong style={{ fontSize: 14, color: colors.navy }}>Đánh giá hồ sơ</Text>
              <Divider style={{ margin: '8px 0 16px' }} />
              <Form.Item name="submittedDate" label="Ngày nộp HSDT">
                <Input placeholder="DD/MM/YYYY" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="technicalScore" label="Điểm KT">
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0–100" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="priceScore" label="Điểm giá">
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0–100" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="totalScore" label="Tổng điểm">
                    <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0–100" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="isSelected" label="Kết quả">
                <Input placeholder="Trúng thầu / Không trúng" />
              </Form.Item>
            </>
          )}

          <Text strong style={{ fontSize: 14, color: colors.navy }}>Ghi chú</Text>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm" />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ── Drawer 3: Cập nhật kết quả thầu ── */}
      <Drawer
        open={resultModalVisible}
        onClose={() => { setResultModalVisible(false); resultForm.resetFields(); }}
        width={520}
        destroyOnClose
        closable={false}
        styles={{
          header: { padding: 0, border: 'none', background: `linear-gradient(135deg, ${colors.navyDark} 0%, ${colors.navy} 60%, ${colors.navyLight} 100%)` },
          body: { padding: 0 },
        }}
        title={
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrophyOutlined style={{ fontSize: 18, color: colors.goldLight }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>{isDirectBidding ? 'Kết quả chỉ định thầu' : 'Công bố kết quả đấu thầu'}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>
                {isDirectBidding ? 'Thông tin nhà cung cấp được chỉ định' : 'Nhập thủ công từ muasamcong.gov.vn'}
              </div>
            </div>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '4px 0' }}>
            <Button onClick={() => { setResultModalVisible(false); resultForm.resetFields(); }}>Hủy</Button>
            <Button type="primary" icon={<CheckCircleOutlined />}
              onClick={() => resultForm.validateFields().then(() => { message.success('Đã cập nhật kết quả thầu'); setResultModalVisible(false); resultForm.resetFields(); })}>
              Lưu
            </Button>
          </div>
        }
      >
        <Form form={resultForm} layout="vertical" style={{ padding: '20px 24px' }}>
          {!isDirectBidding && (
            <Alert type="info" showIcon style={{ marginBottom: 16, fontSize: 12 }}
              message="Dữ liệu từ muasamcong không đồng bộ tự động. Vui lòng nhập thủ công sau khi có kết quả." />
          )}
          <Text strong style={{ fontSize: 14, color: colors.navy }}>Nhà thầu trúng thầu</Text>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="selectedSupplier" label={isDirectBidding ? 'Nhà cung cấp được chỉ định' : 'Nhà thầu trúng thầu'} rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
            <Input placeholder="Tên công ty" defaultValue={pkg?.selectedSupplierName} />
          </Form.Item>
          <Form.Item name="winningPrice" label="Giá trúng thầu (triệu VND)" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Nhập giá trị" />
          </Form.Item>

          <Text strong style={{ fontSize: 14, color: colors.navy }}>{isDirectBidding ? 'Quyết định chỉ định' : 'Thông tin công bố'}</Text>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Row gutter={16}>
            <Col span={14}>
              <Form.Item name="announcementCode" label={isDirectBidding ? 'Số quyết định' : 'Mã thông báo KQLCNT'}>
                <Input placeholder={isDirectBidding ? 'Số quyết định phê duyệt' : 'Mã KQLCNT'} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item name="announcementDate" label={isDirectBidding ? 'Ngày ký' : 'Ngày công bố'}>
                <Input placeholder="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          {!isDirectBidding && (
            <Form.Item name="muasamcongResultUrl" label="Liên kết kết quả trên muasamcong">
              <Input placeholder="https://muasamcong.mpi.gov.vn/..." />
            </Form.Item>
          )}

          <Text strong style={{ fontSize: 14, color: colors.navy }}>Ghi chú</Text>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item name="notes">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm (nếu có)" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default BiddingDetail;
