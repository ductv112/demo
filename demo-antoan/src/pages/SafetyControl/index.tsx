import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Row, Col, Typography, Input, Select,
  Space, Button, Dropdown, Progress,
} from 'antd';
import {
  CheckSquareOutlined, SearchOutlined, EyeOutlined,
  MoreOutlined, PlusOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined,
} from '@ant-design/icons';
import { useUser } from '../../contexts/UserContext';
import type { ColumnsType } from 'antd/es/table';
import { controlSheets } from '../../data/controlSheets';
import {
  controlSheetStatusConfig, shiftConfig, hazardCategoryConfig, formatDate,
} from '../../utils/format';
import type { SafetyControlSheet, ControlSheetStatus, ShiftType } from '../../types';

const { Title, Text } = Typography;

const statCards = [
  { key: 'total',       label: 'Tổng phiếu kiểm soát', gradient: 'linear-gradient(135deg, #1B3A5C, #2d5a8e)', icon: <CheckSquareOutlined /> },
  { key: 'passed',      label: 'Đạt yêu cầu',          gradient: 'linear-gradient(135deg, #059669, #10b981)', icon: <CheckCircleOutlined /> },
  { key: 'failed',      label: 'Không đạt',             gradient: 'linear-gradient(135deg, #cf1322, #ff4d4f)', icon: <CloseCircleOutlined /> },
  { key: 'in_progress', label: 'Đang thực hiện',        gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)', icon: <SyncOutlined /> },
];

const SafetyControlPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSafety } = useUser();

  const [searchText, setSearchText]     = useState('');
  const [statusFilter, setStatusFilter] = useState<ControlSheetStatus | undefined>();
  const [shiftFilter, setShiftFilter]   = useState<ShiftType | undefined>();
  const [workshopFilter, setWorkshopFilter] = useState<string | undefined>();

  const stats = useMemo(() => ({
    total:       controlSheets.length,
    passed:      controlSheets.filter(s => s.status === 'passed').length,
    failed:      controlSheets.filter(s => s.status === 'failed').length,
    in_progress: controlSheets.filter(s => s.status === 'in_progress').length,
  }), []);

  const passRate = Math.round((stats.passed / stats.total) * 100);

  const filteredData = useMemo(() => {
    let result = [...controlSheets].sort((a, b) => b.date.localeCompare(a.date));
    if (statusFilter)   result = result.filter(s => s.status === statusFilter);
    if (shiftFilter)    result = result.filter(s => s.shift === shiftFilter);
    if (workshopFilter) result = result.filter(s => s.workshopId === workshopFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(s =>
        s.code.toLowerCase().includes(q) ||
        s.workshopName.toLowerCase().includes(q) ||
        s.inspector.toLowerCase().includes(q),
      );
    }
    return result;
  }, [searchText, statusFilter, shiftFilter, workshopFilter]);

  const columns: ColumnsType<SafetyControlSheet> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'code',
      width: 100,
      fixed: 'left',
      render: (code: string) => <Text style={{ fontWeight: 600, color: '#1B3A5C', fontSize: 13 }}>{code}</Text>,
    },
    {
      title: 'Phân xưởng',
      dataIndex: 'workshopName',
      width: 180,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Ngày / Ca',
      width: 160,
      render: (_: unknown, record: SafetyControlSheet) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: 13, color: '#1B3A5C' }}>{formatDate(record.date)}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{shiftConfig[record.shift].label.split(' (')[0]}</div>
        </div>
      ),
    },
    {
      title: 'Người kiểm tra',
      dataIndex: 'inspector',
      width: 200,
      render: (name: string) => <Text style={{ fontSize: 13 }}>{name}</Text>,
    },
    {
      title: 'Kết quả',
      width: 180,
      render: (_: unknown, record: SafetyControlSheet) => {
        const total = record.checkItems.length;
        const pct   = total > 0 ? Math.round((record.passCount / (total - record.naCount)) * 100) : 0;
        return (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              {record.passCount > 0 && (
                <Tag color="success" style={{ fontSize: 11, margin: 0 }}>
                  <CheckCircleOutlined /> {record.passCount} đạt
                </Tag>
              )}
              {record.failCount > 0 && (
                <Tag color="error" style={{ fontSize: 11, margin: 0 }}>
                  <CloseCircleOutlined /> {record.failCount} không đạt
                </Tag>
              )}
            </div>
            {record.status !== 'pending' && record.status !== 'in_progress' && (
              <Progress
                percent={pct}
                size="small"
                strokeColor={pct >= 90 ? '#52c41a' : pct >= 70 ? '#faad14' : '#ff4d4f'}
                showInfo={false}
              />
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 140,
      render: (status: ControlSheetStatus) => {
        const cfg = controlSheetStatusConfig[status];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: SafetyControlSheet) => (
        <Dropdown
          menu={{
            items: [{ key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết' }],
            onClick: ({ key }) => { if (key === 'view') navigate(`/kiem-soat-van-hanh/${record.id}`); },
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  const workshopOptions = [
    { value: 'PX1', label: 'PX1 - Radar' },
    { value: 'PX2', label: 'PX2 - Tên lửa' },
    { value: 'PX3', label: 'PX3 - Cơ khí' },
    { value: 'PX4', label: 'PX4 - Điện tử' },
  ];

  return (
    <div>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space align="start" size={16}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckSquareOutlined style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: '#1B3A5C', fontWeight: 700 }}>
              Kiểm soát Điều kiện An toàn trong Vận hành
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Phiếu kiểm soát điều kiện an toàn đầu ca theo phân xưởng — Nhà máy Z119
            </Text>
          </div>
        </Space>
        {isSafety && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/kiem-soat-van-hanh/new')}
            style={{ background: '#1B3A5C', borderColor: '#1B3A5C', borderRadius: 8, height: 38, fontWeight: 500 }}
          >
            Tạo phiếu kiểm soát
          </Button>
        )}
      </div>

      {/* ─── Stat cards ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map(card => {
          const value = stats[card.key as keyof typeof stats];
          return (
            <Col xs={24} sm={12} md={6} key={card.key}>
              <div style={{
                background: card.gradient, borderRadius: 14, padding: '20px 24px',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(27,58,92,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 56, opacity: 0.1, color: '#fff' }}>{card.icon}</div>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', marginBottom: 12 }}>{card.icon}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                  {card.key === 'total' ? <>{value} <span style={{ fontSize: 13, opacity: 0.7, fontWeight: 400 }}>phiếu</span></> : value}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{card.label}</div>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* ─── Tỷ lệ đạt theo phân xưởng ─── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 16 } }}
          >
            <Text strong style={{ color: '#1B3A5C', display: 'block', marginBottom: 12 }}>Tỷ lệ đạt theo phân xưởng</Text>
            {workshopOptions.map(ws => {
              const wsSheets = controlSheets.filter(s => s.workshopId === ws.value && (s.status === 'passed' || s.status === 'failed'));
              const passed   = wsSheets.filter(s => s.status === 'passed').length;
              const pct      = wsSheets.length > 0 ? Math.round((passed / wsSheets.length) * 100) : 0;
              return (
                <div key={ws.value} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13 }}>{ws.label}</Text>
                    <Text strong style={{ fontSize: 13, color: pct >= 90 ? '#52c41a' : pct >= 70 ? '#faad14' : '#ff4d4f' }}>
                      {passed}/{wsSheets.length} ({pct}%)
                    </Text>
                  </div>
                  <Progress percent={pct} strokeColor={pct >= 90 ? '#52c41a' : pct >= 70 ? '#faad14' : '#ff4d4f'} trailColor="#f0f2f5" showInfo={false} size="small" />
                </div>
              );
            })}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
            styles={{ body: { padding: 16 } }}
          >
            <Text strong style={{ color: '#1B3A5C', display: 'block', marginBottom: 12 }}>Thống kê tổng hợp</Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Text style={{ fontSize: 13 }}>Tỷ lệ đạt yêu cầu tổng thể</Text>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>{passRate}%</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: '#fff7e6', border: '1px solid #ffd591' }}>
                <Text style={{ fontSize: 13 }}>Tổng điểm kiểm soát</Text>
                <Text strong style={{ fontSize: 18, color: '#d97706' }}>
                  {controlSheets.reduce((s, cs) => s + cs.checkItems.length, 0)}
                </Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: '#fff1f0', border: '1px solid #ffccc7' }}>
                <Text style={{ fontSize: 13 }}>Điểm không đạt phát hiện</Text>
                <Text strong style={{ fontSize: 18, color: '#ff4d4f' }}>
                  {controlSheets.reduce((s, cs) => s + cs.failCount, 0)}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ─── Filter + Table ─── */}
      <Card style={{ borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Input
            placeholder="Tìm theo mã, phân xưởng, người kiểm tra..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 280 }} allowClear
          />
          <Select placeholder="Trạng thái" value={statusFilter} onChange={v => setStatusFilter(v)} allowClear style={{ width: 160 }}
            options={Object.entries(controlSheetStatusConfig).map(([k, v]) => ({ value: k, label: v.label }))}
          />
          <Select placeholder="Ca làm việc" value={shiftFilter} onChange={v => setShiftFilter(v)} allowClear style={{ width: 160 }}
            options={Object.entries(shiftConfig).map(([k, v]) => ({ value: k, label: v.label.split(' (')[0] }))}
          />
          <Select placeholder="Phân xưởng" value={workshopFilter} onChange={v => setWorkshopFilter(v)} allowClear style={{ width: 160 }} options={workshopOptions} />
          <div style={{ marginLeft: 'auto', fontSize: 13, color: '#8c8c8c' }}>
            <Text strong>{filteredData.length}</Text>/{controlSheets.length} phiếu
          </div>
        </div>
        <Table<SafetyControlSheet>
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          rowClassName={(r) => r.status === 'failed' ? 'row-critical' : ''}
          pagination={{ pageSize: 10, showSizeChanger: false, showTotal: t => `Tổng ${t} phiếu` }}
          scroll={{ x: 1100 }}
          size="middle"
          style={{ margin: 0 }}
        />
      </Card>
    </div>
  );
};

export default SafetyControlPage;
