import { useState } from 'react';
import { Card, Table, Tag, Typography, Tooltip, Row, Col } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import { colors } from '../../theme/themeConfig';

const { Title, Text } = Typography;

type Role = 'leader' | 'chief' | 'deputy' | 'ktv' | 'admin';
type Module = 'dashboard' | 'yeucau' | 'chuando' | 'thietbi' | 'phonglab' | 'ketqua' | 'tieuchuan' | 'giamsat' | 'quantri';

const roleLabels: Record<Role, { label: string; color: string }> = {
  leader: { label: 'Lãnh đạo TCT',    color: 'purple' },
  chief:  { label: 'Trưởng Ban ĐL',   color: 'blue'   },
  deputy: { label: 'Phó Ban ĐL',      color: 'cyan'   },
  ktv:    { label: 'KTV',             color: 'green'  },
  admin:  { label: 'Admin HT',        color: 'red'    },
};

const moduleLabels: Record<Module, string> = {
  dashboard:  'Dashboard',
  yeucau:     'Yêu cầu',
  chuando:    'Chuẩn đo',
  thietbi:    'Thiết bị',
  phonglab:   'Phòng TN',
  ketqua:     'Kết quả',
  tieuchuan:  'Tiêu chuẩn',
  giamsat:    'Giám sát',
  quantri:    'Quản trị',
};

const moduleDescriptions: Record<Module, string> = {
  dashboard:  'Xem tổng quan, thống kê thiết bị và yêu cầu',
  yeucau:     'Tạo, tiếp nhận, xử lý yêu cầu đo lường',
  chuando:    'Quản lý chuẩn đo lường các cấp',
  thietbi:    'Quản lý thiết bị đo (TMDE) toàn Doanh nghiệp A',
  phonglab:   'Quản lý phòng thí nghiệm/hiệu chuẩn',
  ketqua:     'Ghi nhận và phê duyệt kết quả đo',
  tieuchuan:  'Tra cứu tiêu chuẩn, quy trình đo lường',
  giamsat:    'Theo dõi cảnh báo thiết bị và hệ thống',
  quantri:    'Quản lý người dùng, phân quyền, danh mục',
};

const modules: Module[] = ['dashboard', 'yeucau', 'chuando', 'thietbi', 'phonglab', 'ketqua', 'tieuchuan', 'giamsat', 'quantri'];

const initMatrix: Record<Role, Record<Module, boolean>> = {
  leader: { dashboard: true,  yeucau: false, chuando: false, thietbi: false, phonglab: false, ketqua: false, tieuchuan: true,  giamsat: true,  quantri: false },
  chief:  { dashboard: true,  yeucau: true,  chuando: true,  thietbi: true,  phonglab: true,  ketqua: true,  tieuchuan: true,  giamsat: true,  quantri: false },
  deputy: { dashboard: true,  yeucau: true,  chuando: true,  thietbi: true,  phonglab: true,  ketqua: true,  tieuchuan: true,  giamsat: true,  quantri: false },
  ktv:    { dashboard: true,  yeucau: true,  chuando: false, thietbi: true,  phonglab: true,  ketqua: true,  tieuchuan: true,  giamsat: false, quantri: false },
  admin:  { dashboard: true,  yeucau: true,  chuando: true,  thietbi: true,  phonglab: true,  ketqua: true,  tieuchuan: true,  giamsat: true,  quantri: true  },
};

const roles: Role[] = ['leader', 'chief', 'deputy', 'ktv', 'admin'];

export default function PhanQuyen() {
  const [matrix, setMatrix] = useState(initMatrix);

  const togglePerm = (role: Role, mod: Module) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: { ...prev[role], [mod]: !prev[role][mod] },
    }));
  };

  const columns = [
    {
      title: 'Vai trò',
      key: 'role',
      width: 200,
      fixed: 'left' as const,
      render: (_: unknown, rec: { role: Role }) => {
        const cfg = roleLabels[rec.role];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag color={cfg.color} style={{ fontSize: 12, margin: 0 }}>{cfg.label}</Tag>
          </div>
        );
      },
    },
    ...modules.map((mod) => ({
      title: (
        <div style={{ textAlign: 'center' as const, fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>
          {moduleLabels[mod]}
        </div>
      ),
      key: mod,
      width: 100,
      align: 'center' as const,
      render: (_: unknown, rec: { role: Role }) => {
        const allowed = matrix[rec.role][mod];
        return (
          <Tooltip title={allowed ? 'Có quyền -- nhấn để tắt' : 'Không có quyền -- nhấn để bật'}>
            <div
              style={{ cursor: 'pointer', display: 'inline-block', padding: 4, borderRadius: 6, transition: 'background 0.15s' }}
              onClick={() => togglePerm(rec.role, mod)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f0f0f0'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {allowed
                ? <CheckCircleFilled style={{ fontSize: 20, color: colors.success }} />
                : <CloseCircleOutlined style={{ fontSize: 20, color: '#d9d9d9' }} />
              }
            </div>
          </Tooltip>
        );
      },
    })),
  ];

  const tableData = roles.map((role) => ({ key: role, role }));

  const grantedCount = roles.reduce((total, role) =>
    total + modules.filter((mod) => matrix[role][mod]).length, 0
  );

  return (
    <div style={{ padding: 24 }}>
      {/* ── Gradient header ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 55%, #818cf8 100%)',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 20,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -20, top: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <SafetyOutlined style={{ fontSize: 20 }} />
              <Title level={4} style={{ margin: 0, color: '#fff' }}>Phân quyền hệ thống</Title>
            </div>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
              Ma trận phân quyền theo vai trò (RBAC) – {roles.length} vai trò x {modules.length} module
            </Text>
          </div>
        </div>

        <Row gutter={[12, 8]} style={{ marginTop: 16, position: 'relative' }}>
          {[
            { label: 'Tổng vai trò', value: roles.length },
            { label: 'Tổng module', value: modules.length },
            { label: 'Ô có quyền', value: grantedCount },
            { label: 'Tổng ô phân quyền', value: roles.length * modules.length },
          ].map((s, i) => (
            <Col key={i} xs={12} sm={6}>
              <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{s.value}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Note */}
      <div style={{ background: '#f0f5ff', border: '1px solid #adc6ff', borderRadius: 8, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <CheckCircleFilled style={{ color: '#597ef7', fontSize: 15 }} />
        <Text style={{ fontSize: 13, color: '#2f54eb' }}>
          Nhấn vào biểu tượng trong bảng để bật/tắt quyền truy cập module cho từng vai trò.
        </Text>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircleFilled style={{ fontSize: 18, color: colors.success }} />
          <Text style={{ fontSize: 13 }}>Có quyền truy cập</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloseCircleOutlined style={{ fontSize: 18, color: '#d9d9d9' }} />
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Không có quyền</Text>
        </div>
      </div>

      {/* Permission matrix */}
      <Card style={{ borderRadius: 10, border: '1px solid #e8e8e8' }} styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={tableData}
          columns={columns}
          rowKey="role"
          size="middle"
          pagination={false}
          scroll={{ x: 1100 }}
          rowClassName={() => 'perm-row'}
        />
        <style>{`
          .perm-row:hover td { background: #f8f9ff !important; }
        `}</style>
      </Card>

      {/* Module descriptions */}
      <Card
        title={<Text style={{ fontSize: 13, color: colors.navy, fontWeight: 600 }}>Mô tả các module</Text>}
        style={{ borderRadius: 10, border: '1px solid #e8e8e8', marginTop: 16 }}
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[16, 10]}>
          {modules.map((mod) => (
            <Col key={mod} xs={24} sm={12} lg={8} xl={6}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.navy, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <Text style={{ fontSize: 13, fontWeight: 600, display: 'block' }}>{moduleLabels[mod]}</Text>
                  <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                    {moduleDescriptions[mod]}
                  </Text>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
}
