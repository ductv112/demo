import { useMemo, useState } from 'react';
import {
  Card, Typography, Tag, Button, Space, Row, Col,
  Table, InputNumber, Input, App, Descriptions, Timeline,
  Modal, Form, Steps,
} from 'antd';
import type { TableProps } from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, PlayCircleOutlined,
  AuditOutlined, EnvironmentOutlined, CalendarOutlined,
  UserOutlined, WarningOutlined, RiseOutlined, FallOutlined,
  MinusCircleOutlined, HistoryOutlined, SyncOutlined,
  DatabaseOutlined, AccountBookOutlined, BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { getStockCountById } from '../../data/stockCounts';
import { updateScheduleAfterCount, getScheduleByWarehouseId, frequencyConfig } from '../../data/schedules';
import type { StockCount, StockCountLine, ScrapCategory } from '../../types';
import { colors } from '../../theme/themeConfig';
import { formatNumber } from '../../utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

const scrapCategoryConfig: Record<ScrapCategory, { label: string; color: string }> = {
  damage:    { label: 'Hỏng hóc',             color: 'red' },
  expired:   { label: 'Hết hạn sử dụng',      color: 'orange' },
  defective: { label: 'Không đạt tiêu chuẩn', color: 'volcano' },
  other:     { label: 'Lý do khác',            color: 'default' },
};

const typeConfig: Record<string, { label: string; color: string }> = {
  count:      { label: 'Kiểm kê định kỳ',   color: 'blue' },
  correction: { label: 'Điều chỉnh tồn kho', color: 'orange' },
  scrap:      { label: 'Loại bỏ vật tư',     color: 'red' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  planned:     { label: 'Kế hoạch',    color: 'default' },
  in_progress: { label: 'Đang thực hiện', color: 'blue' },
  done:        { label: 'Hoàn thành',  color: 'success' },
  cancelled:   { label: 'Đã hủy',      color: 'error' },
};

const StockCountDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modal, message } = App.useApp();

  const initial = getStockCountById(id ?? '');
  const [record, setRecord] = useState<StockCount | null>(initial ?? null);
  const [lines, setLines] = useState<StockCountLine[]>(initial?.lines ?? []);
  const [confirmForm] = Form.useForm();

  // Bước 6 & 7: Đồng bộ dữ liệu + Lập lịch tiếp theo
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [nextCountDate, setNextCountDate] = useState<string>('');

  // ─── Computed stats ────────────────────────────────────────
  const stats = useMemo(() => {
    const surplus  = lines.filter(l => l.difference > 0).length;
    const shortage = lines.filter(l => l.difference < 0).length;
    const match    = lines.filter(l => l.difference === 0).length;
    const totalDiff = lines.reduce((s, l) => s + l.difference, 0);
    return { surplus, shortage, match, totalDiff };
  }, [lines]);

  if (!record) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Title level={4} style={{ color: colors.textSecondary }}>Không tìm thấy phiếu kiểm kê</Title>
        <Button type="primary" onClick={() => navigate('/stock-count')}>Quay lại</Button>
      </div>
    );
  }

  const typeCfg   = typeConfig[record.type]   ?? typeConfig.count;
  const statusCfg = statusConfig[record.status] ?? statusConfig.planned;
  const isEditable = record.status === 'in_progress';
  const isScrap    = record.type === 'scrap';

  const totalLossValue = lines.reduce((s, l) => s + (l.totalLoss ?? l.systemQty * (l.unitValue ?? 0)), 0);

  // ─── Update counted qty ────────────────────────────────────
  const updateCountedQty = (lineId: string, val: number | null) => {
    const qty = val ?? 0;
    setLines(prev => prev.map(l =>
      l.id === lineId ? { ...l, countedQty: qty, difference: qty - l.systemQty } : l,
    ));
  };

  const updateReason = (lineId: string, reason: string) => {
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, reason } : l));
  };

  // ─── Bắt đầu kiểm kê ──────────────────────────────────────
  const handleStart = () => {
    setRecord(prev => prev ? { ...prev, status: 'in_progress' } : prev);
    message.success('Đã bắt đầu phiên kiểm kê');
  };

  // ─── Xác nhận điều chỉnh ──────────────────────────────────
  const handleConfirm = () => {
    const hasDiscrepancy = lines.some(l => l.difference !== 0);
    const needsReason = lines.some(l => l.difference !== 0 && !l.reason?.trim());
    if (needsReason) {
      message.warning('Vui lòng nhập nguyên nhân cho các dòng có chênh lệch');
      return;
    }

    Modal.confirm({
      title: 'Xác nhận điều chỉnh tồn kho',
      centered: true,
      width: 480,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: (
        <div style={{ marginTop: 12 }}>
          <Text>Kết quả kiểm kê <Text strong>{record.code}</Text>:</Text>
          <Row gutter={12} style={{ marginTop: 12 }}>
            {[
              { label: 'Khớp', value: stats.match, color: '#52c41a' },
              { label: 'Thừa', value: stats.surplus, color: '#1890ff' },
              { label: 'Thiếu', value: stats.shortage, color: '#ff4d4f' },
            ].map(s => (
              <Col span={8} key={s.label}>
                <div style={{ textAlign: 'center', padding: '10px 0', background: '#fafafa', borderRadius: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{s.label}</div>
                </div>
              </Col>
            ))}
          </Row>
          {hasDiscrepancy && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#fff7e6', borderRadius: 8, border: '1px solid #ffe58f' }}>
              <Text style={{ fontSize: 13 }}>
                Tổng chênh lệch: <Text strong style={{ color: stats.totalDiff > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {stats.totalDiff > 0 ? `+${stats.totalDiff}` : stats.totalDiff} đơn vị
                </Text>
              </Text>
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <Form form={confirmForm} layout="vertical">
              <Form.Item label={<Text strong>Người phê duyệt</Text>} name="approvedBy" style={{ marginBottom: 8 }}>
                <Input placeholder="VD: Phạm Quốc Hưng" prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} />
              </Form.Item>
            </Form>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Sau khi xác nhận, tồn kho sẽ được cập nhật theo số liệu thực tế.
          </Text>
        </div>
      ),
      okText: 'Xác nhận điều chỉnh',
      cancelText: 'Kiểm tra lại',
      okButtonProps: { style: { background: '#1B3A5C', borderColor: '#1B3A5C' } },
      onOk: async () => {
        const vals = await confirmForm.validateFields().catch(() => ({}));
        const approvedBy = (vals as Record<string,string>).approvedBy || 'Phạm Quốc Hưng';
        const completedDate = dayjs().format('YYYY-MM-DD');

        setRecord(prev => prev ? {
          ...prev,
          status:          'done',
          completedDate,
          approvedBy,
          lines,
          totalItems:      lines.length,
          totalDifference: stats.totalDiff,
        } : prev);
        confirmForm.resetFields();

        // Bước 6 & 7: Đồng bộ + Lập lịch tiếp theo
        if (record) {
          updateScheduleAfterCount(record.warehouseId, completedDate);
          const sch = getScheduleByWarehouseId(record.warehouseId);
          if (sch) {
            const next = dayjs(completedDate).add(sch.frequencyDays, 'day').format('DD/MM/YYYY');
            setNextCountDate(next);
          } else {
            setNextCountDate(dayjs(completedDate).add(30, 'day').format('DD/MM/YYYY'));
          }
          setSyncModalOpen(true);
        }
      },
    });
  };

  // ─── Table columns ─────────────────────────────────────────
  const columns: TableProps<StockCountLine>['columns'] = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_: unknown, __: StockCountLine, idx: number) => (
        <Text type="secondary" style={{ fontSize: 12 }}>{idx + 1}</Text>
      ),
    },
    {
      title: 'Mã VT',
      dataIndex: 'productCode',
      width: 130,
      render: (v: string) => <Text strong style={{ color: colors.navy, fontFamily: 'monospace', fontSize: 12 }}>{v}</Text>,
    },
    {
      title: 'Tên vật tư',
      dataIndex: 'productName',
      ellipsis: true,
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Vị trí',
      dataIndex: 'locationCode',
      width: 120,
      render: (v: string) => v
        ? <Tag style={{ fontFamily: 'monospace', fontSize: 11 }}><EnvironmentOutlined style={{ marginRight: 3 }} />{v}</Tag>
        : '--',
    },
    {
      title: 'Lô/Serial',
      dataIndex: 'lotNumber',
      width: 140,
      render: (v: string) => v
        ? <Text style={{ fontSize: 11, color: colors.textSecondary, fontFamily: 'monospace' }}>{v}</Text>
        : '--',
    },
    {
      title: 'SL hệ thống',
      dataIndex: 'systemQty',
      width: 110,
      align: 'right',
      render: (v: number, r: StockCountLine) => (
        <Text strong style={{ fontSize: 13 }}>{formatNumber(v)} <Text type="secondary" style={{ fontSize: 11 }}>{r.unit}</Text></Text>
      ),
    },
    {
      title: 'SL thực tế',
      dataIndex: 'countedQty',
      width: 130,
      align: 'right',
      render: (v: number, r: StockCountLine) => isEditable
        ? (
          <InputNumber
            min={0}
            value={v}
            onChange={val => updateCountedQty(r.id, val)}
            size="small"
            style={{ width: 80 }}
            addonAfter={<Text style={{ fontSize: 11, color: '#8c8c8c' }}>{r.unit}</Text>}
          />
        ) : (
          <Text strong style={{ fontSize: 13 }}>{formatNumber(v)} <Text type="secondary" style={{ fontSize: 11 }}>{r.unit}</Text></Text>
        ),
    },
    ...(isScrap ? [
      {
        title: 'Loại lý do',
        dataIndex: 'scrapCategory',
        width: 160,
        render: (v: ScrapCategory) => {
          if (!v) return '--';
          const cfg = scrapCategoryConfig[v];
          return <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>;
        },
      },
      {
        title: 'Đơn giá (tr)',
        dataIndex: 'unitValue',
        width: 110,
        align: 'right' as const,
        render: (v: number) => v != null ? <Text style={{ fontSize: 13 }}>{v.toFixed(1)}</Text> : '--',
      },
      {
        title: 'Tổn thất (tr)',
        dataIndex: 'totalLoss',
        width: 120,
        align: 'right' as const,
        render: (v: number, r: StockCountLine) => {
          const loss = v ?? r.systemQty * (r.unitValue ?? 0);
          return <Text strong style={{ color: '#ff4d4f', fontSize: 13 }}>{loss.toFixed(1)}</Text>;
        },
      },
    ] : [
      {
        title: 'Chênh lệch',
        dataIndex: 'difference',
        width: 110,
        align: 'right' as const,
        render: (v: number) => {
          if (v === 0) return <Text style={{ color: '#52c41a', fontWeight: 600 }}>Khớp</Text>;
          const color = v > 0 ? '#1890ff' : '#ff4d4f';
          const icon  = v > 0 ? <RiseOutlined /> : <FallOutlined />;
          return (
            <Text style={{ color, fontWeight: 700, fontSize: 13 }}>
              {icon} {v > 0 ? `+${v}` : v}
            </Text>
          );
        },
      },
    ]),
    {
      title: isScrap ? 'Lý do loại bỏ' : 'Nguyên nhân',
      dataIndex: 'reason',
      render: (v: string, r: StockCountLine) => {
        const needsReason = r.difference !== 0;
        if (isEditable) {
          return (
            <Input
              value={v}
              placeholder={needsReason ? 'Bắt buộc nhập...' : 'Không cần'}
              status={needsReason && !v?.trim() ? 'warning' : undefined}
              onChange={e => updateReason(r.id, e.target.value)}
              size="small"
              style={{ fontSize: 12 }}
            />
          );
        }
        return v ? <Text style={{ fontSize: 12 }}>{v}</Text> : <Text type="secondary" style={{ fontSize: 12 }}>--</Text>;
      },
    },
  ];

  // ─── Mock history ───────────────────────────────────────────
  const history = [
    ...(record.completedDate ? [{
      color: 'green',
      dot: <CheckCircleOutlined style={{ fontSize: 14 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Điều chỉnh được phê duyệt</Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(record.completedDate).format('DD/MM/YYYY')} — {record.approvedBy ?? 'Ban Giám đốc'}
          </div>
        </div>
      ),
    }] : []),
    {
      color: record.status === 'in_progress' ? 'blue' : 'gray',
      dot: <AuditOutlined style={{ fontSize: 13 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Bắt đầu kiểm kê thực tế</Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(record.scheduledDate).format('DD/MM/YYYY')} — {record.countedBy ?? 'Nhân viên kho'}
          </div>
        </div>
      ),
    },
    {
      color: 'gray',
      dot: <CalendarOutlined style={{ fontSize: 13 }} />,
      children: (
        <div>
          <Text strong style={{ fontSize: 13 }}>Phiếu kiểm kê được tạo</Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ─── Back ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/stock-count')}
          style={{ color: colors.navy, fontWeight: 500 }}>
          Quay lại danh sách
        </Button>
      </div>

      {/* ─── Header card ───────────────────────────────────── */}
      <Card
        style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 20, border: '1px solid #e8e8e8', overflow: 'hidden' }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ height: 4, background: `linear-gradient(90deg, ${colors.navy}, ${colors.navyLight}, ${colors.gold})` }} />
        <div style={{ padding: 24 }}>
          <Row align="middle" gutter={24}>
            <Col flex="auto">
              <Space size={14} align="start">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AuditOutlined style={{ color: '#fff', fontSize: 22 }} />
                </div>
                <div>
                  <Space size={8} align="center" wrap>
                    <Title level={4} style={{ margin: 0, color: colors.navy, letterSpacing: -0.3 }}>{record.code}</Title>
                    <Tag color={typeCfg.color} style={{ fontWeight: 600 }}>{typeCfg.label}</Tag>
                    <Tag color={statusCfg.color} style={{ fontWeight: 600 }}>{statusCfg.label}</Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 13 }}>{record.warehouseName}</Text>
                </div>
              </Space>

              <Descriptions size="small" column={3} style={{ marginTop: 16 }}
                labelStyle={{ fontWeight: 600, color: colors.navy, fontSize: 13 }}
                contentStyle={{ fontSize: 13 }}>
                <Descriptions.Item label="Ngày kiểm kê">
                  {dayjs(record.scheduledDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                {record.completedDate && (
                  <Descriptions.Item label="Ngày hoàn thành">
                    {dayjs(record.completedDate).format('DD/MM/YYYY')}
                  </Descriptions.Item>
                )}
                {record.countedBy && (
                  <Descriptions.Item label="Người kiểm kê">{record.countedBy}</Descriptions.Item>
                )}
                {record.approvedBy && (
                  <Descriptions.Item label="Người phê duyệt">{record.approvedBy}</Descriptions.Item>
                )}
                <Descriptions.Item label="Tổng vật tư">{record.totalItems} mặt hàng</Descriptions.Item>
              </Descriptions>

              {record.note && (
                <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 13, lineHeight: 1.5 }}>
                  {record.note}
                </Text>
              )}
            </Col>

            {/* Action buttons */}
            <Col flex="none">
              {record.status === 'planned' && (
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStart}
                  style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}>
                  Bắt đầu kiểm kê
                </Button>
              )}
              {record.status === 'in_progress' && (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleConfirm}
                  style={{ background: '#237804', borderColor: '#237804' }}>
                  Xác nhận điều chỉnh
                </Button>
              )}
            </Col>
          </Row>
        </div>
      </Card>

      {/* ─── Main content ──────────────────────────────────── */}
      <Row gutter={[20, 20]}>
        {/* Lines table */}
        <Col xs={24} xl={17}>
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e8e8e8' }}
            styles={{ body: { padding: 0 } }}
          >
            {/* Card header */}
            <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space size={10}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AuditOutlined style={{ color: '#fff', fontSize: 13 }} />
                </div>
                <Text strong style={{ fontSize: 14, color: colors.navy }}>Danh sách vật tư kiểm kê</Text>
              </Space>
              {isEditable && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <WarningOutlined style={{ color: colors.warning, marginRight: 4 }} />
                  Nhập số lượng thực tế, chênh lệch sẽ tự tính
                </Text>
              )}
            </div>
            <div style={{ padding: '0 4px 4px' }}>
              <Table
                dataSource={lines}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="middle"
                scroll={{ x: 1000 }}
                rowClassName={(r) => r.difference !== 0 ? 'row-has-diff' : ''}
              />
            </div>
          </Card>
        </Col>

        {/* Right sidebar */}
        <Col xs={24} xl={7}>
          {/* Stats card */}
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e8e8e8', marginBottom: 16 }}
            styles={{ body: { padding: 20 } }}
          >
            <Space size={10} style={{ marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #237804, #52c41a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MinusCircleOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ fontSize: 14, color: colors.navy }}>Kết quả kiểm kê</Text>
            </Space>

            {[
              { label: 'Tổng mặt hàng', value: lines.length, color: colors.navy, suffix: 'dòng' },
              { label: 'Khớp số liệu', value: stats.match, color: '#52c41a', suffix: 'mặt hàng' },
              { label: 'Thừa', value: stats.surplus, color: '#1890ff', suffix: 'mặt hàng' },
              { label: 'Thiếu', value: stats.shortage, color: '#ff4d4f', suffix: 'mặt hàng' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Text style={{ fontSize: 13, color: '#595959' }}>{s.label}</Text>
                <Space size={4}>
                  <Text strong style={{ fontSize: 15, color: s.color }}>{s.value}</Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>{s.suffix}</Text>
                </Space>
              </div>
            ))}

            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: stats.totalDiff === 0 ? '#f6ffed' : stats.totalDiff > 0 ? '#e6f4ff' : '#fff1f0', border: `1px solid ${stats.totalDiff === 0 ? '#b7eb8f' : stats.totalDiff > 0 ? '#91caff' : '#ffa39e'}` }}>
              <Text style={{ fontSize: 12, color: '#595959' }}>Tổng chênh lệch</Text>
              <div style={{ fontSize: 22, fontWeight: 700, color: stats.totalDiff === 0 ? '#52c41a' : stats.totalDiff > 0 ? '#1890ff' : '#ff4d4f', lineHeight: 1.3 }}>
                {stats.totalDiff === 0 ? '±0' : stats.totalDiff > 0 ? `+${stats.totalDiff}` : stats.totalDiff}
                <Text style={{ fontSize: 12, fontWeight: 400, color: '#8c8c8c', marginLeft: 4 }}>đơn vị</Text>
              </div>
            </div>
          </Card>

          {/* History card */}
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e8e8e8' }}
            styles={{ body: { padding: 20 } }}
          >
            <Space size={10} style={{ marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${colors.gold}, #c4983a)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HistoryOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <Text strong style={{ fontSize: 14, color: colors.navy }}>Lịch sử</Text>
            </Space>
            <Timeline items={history} />
          </Card>
        </Col>
      </Row>

      {/* ═══ Bước 6 & 7: Modal đồng bộ dữ liệu ════════════ */}
      <Modal
        open={syncModalOpen}
        title={
          <Space size={10}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #237804, #52c41a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SyncOutlined style={{ color: '#fff', fontSize: 13 }} />
            </div>
            <Text strong style={{ fontSize: 14, color: '#1B3A5C' }}>Đồng bộ dữ liệu thành công</Text>
          </Space>
        }
        footer={
          <Button
            type="primary"
            onClick={() => { setSyncModalOpen(false); navigate('/stock-count'); }}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C' }}
          >
            Hoàn tất
          </Button>
        }
        onCancel={() => setSyncModalOpen(false)}
        centered
        width={480}
      >
        <div style={{ padding: '8px 0' }}>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
            Phiếu kiểm kê <Text strong>{record?.code}</Text> đã được xác nhận.
            Hệ thống đã thực hiện các bước đồng bộ sau:
          </Text>

          <Steps
            direction="vertical"
            size="small"
            current={4}
            items={[
              {
                title: <Text strong style={{ fontSize: 13 }}>Cập nhật tồn kho hệ thống</Text>,
                description: (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Số liệu tồn kho {record?.warehouseName} đã được điều chỉnh theo kết quả kiểm kê thực tế.
                  </Text>
                ),
                icon: <DatabaseOutlined style={{ color: '#52c41a' }} />,
                status: 'finish',
              },
              {
                title: <Text strong style={{ fontSize: 13 }}>Ghi nhận chênh lệch kho</Text>,
                description: (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {stats.totalDiff !== 0
                      ? `Chênh lệch ${Math.abs(stats.totalDiff)} đơn vị đã được ghi nhận vào sổ theo dõi.`
                      : 'Không có chênh lệch — tồn kho khớp hoàn toàn.'}
                  </Text>
                ),
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                status: 'finish',
              },
              {
                title: <Text strong style={{ fontSize: 13 }}>Gửi dữ liệu sang phân hệ Kế toán</Text>,
                description: (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Dữ liệu chênh lệch đã được gửi sang phân hệ Tài chính - Kế toán để hạch toán điều chỉnh.
                  </Text>
                ),
                icon: <AccountBookOutlined style={{ color: '#52c41a' }} />,
                status: 'finish',
              },
              {
                title: <Text strong style={{ fontSize: 13 }}>Cập nhật báo cáo BI/Tổng hợp</Text>,
                description: (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Dữ liệu kiểm kê đã được đồng bộ vào hệ thống báo cáo và dashboard tồn kho.
                  </Text>
                ),
                icon: <BarChartOutlined style={{ color: '#52c41a' }} />,
                status: 'finish',
              },
              {
                title: <Text strong style={{ fontSize: 13 }}>Lập lịch kiểm kê tiếp theo</Text>,
                description: (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Lịch kiểm kê định kỳ đã được cập nhật tự động.
                    </Text>
                    {nextCountDate && (
                      <div style={{ marginTop: 6, padding: '6px 12px', background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f', display: 'inline-block' }}>
                        <Space size={6}>
                          <CalendarOutlined style={{ color: '#52c41a' }} />
                          <Text strong style={{ color: '#237804', fontSize: 12 }}>
                            Kiểm kê tiếp theo: {nextCountDate}
                          </Text>
                          {(() => {
                            const sch = record ? getScheduleByWarehouseId(record.warehouseId) : null;
                            return sch ? (
                              <Tag color={frequencyConfig[sch.frequency].color} style={{ fontSize: 11 }}>
                                {frequencyConfig[sch.frequency].label}
                              </Tag>
                            ) : null;
                          })()}
                        </Space>
                      </div>
                    )}
                  </div>
                ),
                icon: <CalendarOutlined style={{ color: '#52c41a' }} />,
                status: 'finish',
              },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StockCountDetail;
