import React, { useState, useMemo, useCallback } from 'react';
import {
  Card, Button, Row, Col, Typography, Space, Steps, Form, Input, Select,
  InputNumber, Table, Tag, Descriptions, Result, message, Upload, Tooltip,
  Progress, Badge, Divider,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, SolutionOutlined, FileTextOutlined,
  SaveOutlined, SendOutlined, SafetyCertificateOutlined, TagsOutlined,
  DollarOutlined, DeleteOutlined, PlusCircleOutlined, SyncOutlined,
  CheckCircleOutlined, CloudDownloadOutlined, TeamOutlined,
  UploadOutlined, InboxOutlined, ToolOutlined, EditOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { missions, proposals } from '../../data/missions';
import { departments } from '../../data/departments';
import {
  formatCurrency, formatNumber, formatDate,
  missionTypeConfig, missionPriorityConfig, missionComplexityConfig,
} from '../../utils/format';
import { colors } from '../../theme/themeConfig';
import type { WorkVolume, CostItem } from '../../types';

const { Text, Title } = Typography;

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface MaterialItem {
  id: string; name: string; unit: string; needed: number; inStock: number; toBuy: number; unitPrice: number;
}
interface LaborItem {
  id: string; role: string; quantity: number; days: number; dailyRate: number; skills?: string;
}
interface ProcessStep {
  id: string; order: number; name: string; description: string; type: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS: Initialize from proposal data
// ═══════════════════════════════════════════════════════════════
const initMaterials = (costItems: CostItem[]): MaterialItem[] =>
  costItems
    .filter(ci => ci.category === 'material')
    .map(ci => ({
      id: ci.id,
      name: ci.name,
      unit: ci.unit,
      needed: ci.quantity,
      inStock: 0,
      toBuy: ci.quantity,
      unitPrice: ci.unitPrice,
    }));

const initLaborItems = (costItems: CostItem[]): LaborItem[] =>
  costItems
    .filter(ci => ci.category === 'labor')
    .map(ci => ({
      id: ci.id,
      role: ci.name,
      quantity: ci.quantity,
      days: 1,
      dailyRate: ci.unitPrice,
      skills: ci.note || '',
    }));

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const ProposalEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const proposal = useMemo(() => proposals.find(p => p.id === id), [id]);
  const selectedMissionId = proposal?.missionId || '';
  const mission = useMemo(
    () => missions.find(m => m.id === selectedMissionId),
    [selectedMissionId],
  );

  // ─── Blocked: approved ─────────────────────────────────────
  if (!proposal) {
    return (
      <Card style={{ borderRadius: 14 }}>
        <Result
          status="error"
          title="Không tìm thấy đề xuất"
          subTitle="Đề xuất không tồn tại hoặc đã bị xóa."
          extra={<Button type="primary" onClick={() => navigate('/proposals')}>Quay lại danh sách</Button>}
        />
      </Card>
    );
  }

  if (!['draft', 'revision', 'cost_rejected'].includes(proposal.status)) {
    return (
      <Card style={{ borderRadius: 14 }}>
        <Result
          status="warning"
          title="Không thể chỉnh sửa"
          subTitle={`Đề xuất ${proposal.code} đã được phê duyệt, không thể chỉnh sửa.`}
          extra={<Button type="primary" onClick={() => navigate(`/proposals/${id}`)}>Xem chi tiết</Button>}
        />
      </Card>
    );
  }

  // ─── Wizard State ──────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);

  // ─── Step 2: Phương án KT ──────────────────────────────────
  const [isConfigFetched, setIsConfigFetched] = useState(!!proposal.configReference);
  const [configData, setConfigData] = useState<{
    code: string; version: string; status: string; components: string[];
    specs: { label: string; value: string }[];
    maintenance: { lastRepair: string; lastOverhaul: string; condition: string };
    consumables: { name: string; lifespan: string; status: string }[];
  } | null>(proposal.configReference ? {
    code: proposal.configReference.split(' ')[0] || 'CFG-LOADED',
    version: 'V3.0',
    status: 'Đang sử dụng',
    components: ['Khối thu thập dữ liệu', 'Hệ thống cảnh báo', 'Khối xử lý tín hiệu', 'Bộ nguồn cung cấp điện', 'Hệ thống điều khiển', 'Khối hiển thị'],
    specs: [
      { label: 'Tần số hoạt động', value: '150-170 MHz (VHF)' },
      { label: 'Công suất xử lý', value: '160 kW' },
      { label: 'Phạm vi giám sát', value: '250 km' },
      { label: 'Phạm vi quan sát', value: '10.000 m' },
      { label: 'Tốc độ thu thập', value: '6 vòng/phút' },
      { label: 'Nguồn cung cấp', value: '380V / 50Hz, 3 pha' },
    ],
    maintenance: {
      lastRepair: '03/2024',
      lastOverhaul: '2020',
      condition: 'Hư hỏng cục bộ, cần sửa chữa',
    },
    consumables: [
      { name: 'Bộ phát tín hiệu', lifespan: '3.000 giờ', status: 'Hết hạn' },
      { name: 'Bộ lọc tín hiệu', lifespan: '5 năm', status: 'Còn 6 tháng' },
      { name: 'Pin dự phòng', lifespan: '3 năm', status: 'Hết hạn' },
    ],
  } : null);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);

  // ─── Step 3: Khối lượng (pre-filled) ──────────────────────
  const [workVolumes, setWorkVolumes] = useState<WorkVolume[]>([...proposal.workVolumes]);

  // ─── Step 4: Vật tư (from costItems material) ─────────────
  const [materials, setMaterials] = useState<MaterialItem[]>(initMaterials(proposal.costItems));
  const [inventoryChecked, setInventoryChecked] = useState(false);

  // ─── Step 5: Nhân lực (from costItems labor) ──────────────
  const [laborItems, setLaborItems] = useState<LaborItem[]>(initLaborItems(proposal.costItems));
  const [laborSuggested, setLaborSuggested] = useState(laborItems.length > 0);

  // ─── Derived Data ──────────────────────────────────────────
  const technicalDepts = departments.filter(d => d.type === 'technical');
  const availableMissions = useMemo(() => {
    const proposalMissionIds = proposals.map(p => p.missionId);
    return missions.filter(m => m.status === 'approved' && !proposalMissionIds.includes(m.id));
  }, []);

  // ─── Cost Summary (realtime) ───────────────────────────────
  const costSummary = useMemo(() => {
    const materialCost = materials.reduce((s, m) => s + m.needed * m.unitPrice, 0);
    const laborCost = laborItems.reduce((s, l) => s + l.quantity * l.days * l.dailyRate, 0);
    const equipmentCost = materials.filter(m => m.unit === 'Ca' || m.unit === 'Giờ').reduce((s, m) => s + m.needed * m.unitPrice, 0);
    const overhead = Math.round((materialCost + laborCost) * 0.08);
    const total = materialCost + laborCost + overhead;
    return { materialCost, laborCost, equipmentCost, overhead, total };
  }, [materials, laborItems]);

  const [proposedPrice, setProposedPrice] = useState(proposal.proposedPrice);
  const profitMargin = costSummary.total > 0 ? (((proposedPrice - costSummary.total) / costSummary.total) * 100).toFixed(1) : '0';

  // Loading states
  const [configLoading, setConfigLoading] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [laborLoading, setLaborLoading] = useState(false);

  // ─── Validation ────────────────────────────────────────────
  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    try {
      if (step === 0) {
        if (!selectedMissionId) { message.warning('Nhiệm vụ không hợp lệ'); return false; }
        await form.validateFields(['proposalName', 'description']);
        return true;
      }
      if (step === 1) {
        if (!isConfigFetched) { message.warning('Vui lòng lấy cấu hình kỹ thuật trước'); return false; }
        await form.validateFields(['technicalAnalysis', 'technicalPlan']);
        return true;
      }
      if (step === 2) {
        if (workVolumes.length === 0) { message.warning('Vui lòng thêm ít nhất 1 hạng mục'); return false; }
        return true;
      }
      if (step === 3) {
        if (materials.length === 0) { message.warning('Vui lòng thêm ít nhất 1 vật tư'); return false; }
        return true;
      }
      if (step === 4) {
        if (laborItems.length === 0) { message.warning('Vui lòng thêm ít nhất 1 nhân lực'); return false; }
        return true;
      }
      return true;
    } catch { return false; }
  }, [selectedMissionId, isConfigFetched, workVolumes, materials, laborItems, form]);

  const handleNext = async () => {
    if (await validateStep(currentStep)) setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = () => {
    message.success(`Đã lưu và trình duyệt đề xuất ${proposal.code} — chờ lãnh đạo phê duyệt`);
    navigate(`/proposals/${id}`);
  };

  // ═══════════════════════════════════════════════════════════
  // STEP 1: THÔNG TIN CHUNG (mission locked, fields pre-filled)
  // ═══════════════════════════════════════════════════════════
  const renderStep1 = () => {
    const typeCfg = mission ? missionTypeConfig[mission.missionType] : null;
    return (
      <div>
        <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
          <Form.Item label="Nhiệm vụ liên kết">
            <Select showSearch style={{ width: '100%' }} placeholder="Nhiệm vụ đã liên kết"
              value={selectedMissionId} disabled
              optionFilterProp="label" size="large"
              options={missions.map(m => ({ value: m.id, label: `${m.code} — ${m.name} (${m.equipmentType})` }))} />
          </Form.Item>
          {mission && (
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '14px 16px', marginBottom: 16, borderLeft: `3px solid ${colors.navy}` }}>
              <Row gutter={[16, 8]}>
                <Col span={8}><Text type="secondary" style={{ fontSize: 13 }}>Đơn vị giao</Text><div><Text strong style={{ fontSize: 12 }}>{mission.requestingUnit}</Text></div></Col>
                <Col span={8}><Text type="secondary" style={{ fontSize: 13 }}>Sản phẩm/Hệ thống</Text><div><Text strong style={{ fontSize: 12 }}>{mission.equipmentType} x{mission.equipmentQuantity}</Text></div></Col>
                <Col span={8}><Text type="secondary" style={{ fontSize: 13 }}>Loại</Text><div>{typeCfg && <Tag color={typeCfg.color}>{typeCfg.label}</Tag>}</div></Col>
              </Row>
            </div>
          )}
          <Form.Item label="Tên đề xuất" name="proposalName" rules={[{ required: true, message: 'Nhập tên đề xuất' }]}>
            <Input placeholder="VD: Đề xuất nâng cấp hệ thống monitoring P-18 server-1245" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Nhập mô tả' }]}>
            <Input.TextArea rows={3} placeholder="Mô tả tóm tắt nội dung đề xuất & dự toán" />
          </Form.Item>
        </Card>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // STEP 2: PHƯƠNG ÁN KỸ THUẬT
  // ═══════════════════════════════════════════════════════════
  const handleFetchConfig = () => {
    setConfigLoading(true);
    setTimeout(() => {
      const equip = mission?.equipmentType || '';
      const code = `CFG-${equip.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}-V3.0`;
      const isRadar = equip.toLowerCase().includes('radar') || equip.includes('P-18') || equip.includes('36D6') || equip.includes('ST-68');
      const isMissile = equip.toLowerCase().includes('module') || equip.includes('S-125') || equip.includes('S-75') || equip.includes('SA-3');

      const components = mission?.missionType === 'manufacturing'
        ? ['Module chuyển đổi A/D', 'Board xử lý tín hiệu', 'Giao diện kết nối', 'Vỏ hộp bảo vệ']
        : isRadar
        ? ['Khối thu thập dữ liệu', 'Hệ thống cảnh báo', 'Khối xử lý tín hiệu', 'Bộ nguồn cung cấp điện', 'Hệ thống điều khiển', 'Khối hiển thị']
        : isMissile
        ? ['Module triển khai', 'Bộ điều khiển trung tâm', 'Hệ thống định tuyến', 'Khối nguồn', 'Hệ thống truyền dẫn']
        : ['Module chính', 'Khối xử lý', 'Hệ thống truyền dẫn', 'Bộ nguồn', 'Giao diện vận hành'];

      const specs = isRadar ? [
        { label: 'Tần số hoạt động', value: '150-170 MHz (VHF)' },
        { label: 'Công suất xử lý', value: '160 kW' },
        { label: 'Phạm vi giám sát', value: '250 km' },
        { label: 'Phạm vi quan sát', value: '10.000 m' },
        { label: 'Tốc độ thu thập', value: '6 vòng/phút' },
        { label: 'Nguồn cung cấp', value: '380V / 50Hz, 3 pha' },
      ] : isMissile ? [
        { label: 'Phạm vi triển khai', value: '25 km' },
        { label: 'Phạm vi xử lý', value: '18.000 m' },
        { label: 'Tốc độ phản hồi', value: 'Mach 3.5' },
        { label: 'Kênh xử lý', value: '1 luồng / 2 module' },
        { label: 'Góc xử lý', value: '7° - 80°' },
        { label: 'Thời gian triển khai', value: '30 phút' },
      ] : [
        { label: 'Dải tần', value: 'VHF/UHF' },
        { label: 'Công suất', value: '50W' },
        { label: 'Tầm liên lạc', value: '150 km' },
        { label: 'Mã hóa', value: 'AES-256' },
      ];

      setConfigData({
        code,
        version: 'V3.0',
        status: 'Đang sử dụng',
        components,
        specs,
        maintenance: {
          lastRepair: '03/2024',
          lastOverhaul: isRadar ? '2020' : '2019',
          condition: mission?.missionType === 'overhaul' ? 'Cần đại tu toàn diện' : 'Hư hỏng cục bộ, cần sửa chữa',
        },
        consumables: isRadar ? [
          { name: 'Bộ phát tín hiệu', lifespan: '3.000 giờ', status: 'Hết hạn' },
          { name: 'Bộ lọc tín hiệu', lifespan: '5 năm', status: 'Còn 6 tháng' },
          { name: 'Pin dự phòng', lifespan: '3 năm', status: 'Hết hạn' },
        ] : isMissile ? [
          { name: 'Phốt làm kín', lifespan: '5 năm', status: 'Hết hạn' },
          { name: 'Dầu công nghiệp tiêu chuẩn', lifespan: '2 năm', status: 'Cần thay' },
        ] : [
          { name: 'Module mã hóa', lifespan: '5 năm', status: 'Còn 1 năm' },
        ],
      });
      setIsConfigFetched(true);
      setConfigLoading(false);
      form.setFieldsValue({ configReference: `${code} (Phân hệ Vòng đời & Cấu hình)` });
      message.success(`Đã nhận cấu hình: ${code}`);
    }, 800);
  };

  const renderStep2 = () => (
    <div>
      {/* Cấu hình */}
      <Card className="db-chart-card" style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text strong style={{ fontSize: 15, color: colors.navy }}></Text>
          <Button icon={<CloudDownloadOutlined />} onClick={handleFetchConfig} disabled={isConfigFetched} loading={configLoading}
            style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
            {isConfigFetched ? 'Đã lấy cấu hình' : 'Lấy từ hệ thống'}
          </Button>
        </div>
        {isConfigFetched && configData ? (
          <div style={{ background: '#f6ffed', borderRadius: 10, padding: '16px', borderLeft: '4px solid #52c41a' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Space>
                <Tag color="purple">{configData.code}</Tag>
                <Tag color="blue">{configData.version}</Tag>
                <Tag color="green">{configData.status}</Tag>
              </Space>
              <Text style={{ fontSize: 13, color: '#999' }}>Nguồn: QL Vòng đời & Cấu hình</Text>
            </div>

            <Row gutter={[12, 12]}>
              {/* Cấu trúc cụm */}
              <Col xs={24} md={12}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #d9f7be', height: '100%' }}>
                  <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 6 }}>Cấu trúc cụm chính</Text>
                  {configData.components.map((c, i) => <Tag key={i} color="blue" style={{ fontSize: 12, marginBottom: 4 }}>{c}</Tag>)}
                </div>
              </Col>

              {/* Thông số KT */}
              <Col xs={24} md={12}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #d9f7be', height: '100%' }}>
                  <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 6 }}>Thông số kỹ thuật chính</Text>
                  {configData.specs.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: i < configData.specs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <Text style={{ fontSize: 12, color: '#666' }}>{s.label}</Text>
                      <Text strong style={{ fontSize: 12 }}>{s.value}</Text>
                    </div>
                  ))}
                </div>
              </Col>

              {/* Lịch sử bảo trì */}
              <Col xs={24} md={12}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #d9f7be' }}>
                  <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 6 }}>Lịch sử bảo trì</Text>
                  <Row gutter={[8, 4]}>
                    <Col span={12}><Text style={{ fontSize: 12, color: '#666' }}>SC gần nhất:</Text><div><Text strong style={{ fontSize: 13 }}>{configData.maintenance.lastRepair}</Text></div></Col>
                    <Col span={12}><Text style={{ fontSize: 12, color: '#666' }}>ĐT gần nhất:</Text><div><Text strong style={{ fontSize: 13 }}>{configData.maintenance.lastOverhaul}</Text></div></Col>
                    <Col span={24}><Text style={{ fontSize: 12, color: '#666' }}>Tình trạng:</Text><div><Tag color="orange" style={{ fontSize: 12 }}>{configData.maintenance.condition}</Tag></div></Col>
                  </Row>
                </div>
              </Col>

              {/* Linh kiện tiêu hao */}
              <Col xs={24} md={12}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #d9f7be' }}>
                  <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block', marginBottom: 6 }}>Linh kiện tiêu hao cần thay</Text>
                  {configData.consumables.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: i < configData.consumables.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      <Text style={{ fontSize: 12 }}>{c.name} <Text type="secondary" style={{ fontSize: 12 }}>({c.lifespan})</Text></Text>
                      <Tag color={c.status === 'Hết hạn' ? 'red' : 'orange'} style={{ fontSize: 12 }}>{c.status}</Tag>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <div style={{ background: '#fafafa', borderRadius: 8, padding: 24, textAlign: 'center', border: '1px dashed #d9d9d9' }}>
            <CloudDownloadOutlined style={{ fontSize: 24, color: '#d9d9d9', display: 'block', marginBottom: 8 }} />
            <Text type="secondary">Bấm "Lấy từ hệ thống" để nhận cấu hình kỹ thuật đầy đủ của sản phẩm/hệ thống</Text>
          </div>
        )}
      </Card>

      {/* Phương án kỹ thuật */}
      <Card className="db-chart-card" style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <Text strong style={{ fontSize: 15, color: colors.navy, display: "block", marginBottom: 12 }}></Text>
        <Form.Item label="Phân tích yêu cầu kỹ thuật" name="technicalAnalysis" rules={[{ required: true, message: 'Nhập phân tích' }]}>
          <Input.TextArea rows={3} placeholder="Phân tích hiện trạng, yêu cầu cần đạt, mục tiêu kỹ thuật..." />
        </Form.Item>
        <Form.Item label="Phương án thực hiện" name="technicalPlan" rules={[{ required: true, message: 'Nhập phương án' }]}>
          <Input.TextArea rows={3} placeholder="Mô tả phương pháp, cách tiếp cận, giải pháp kỹ thuật..." />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tham chiếu cấu hình" name="configReference">
              <Input disabled placeholder="Tự động điền" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Thời gian dự kiến (ngày)" name="estimatedDuration" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} placeholder="120" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Quy trình thực hiện - TABLE */}
      <Card className="db-chart-card" style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Space>
            <Text strong style={{ fontSize: 15, color: colors.navy }}></Text>
            <Tag color="blue">{processSteps.length} công đoạn</Tag>
          </Space>
          <Space>
            <Button icon={<CloudDownloadOutlined />} size="small" disabled={processSteps.length > 0}
              onClick={() => {
                const mType = mission?.missionType || 'repair';
                const templates: Record<string, { name: string; description: string; type: string }[]> = {
                  repair: [
                    { name: 'Tiếp nhận', description: 'Tiếp nhận sản phẩm/hệ thống, kiểm tra sơ bộ, lập biên bản hiện trạng', type: 'test' },
                    { name: 'Tháo rời', description: 'Tháo rời các cụm, module theo quy trình kỹ thuật', type: 'repair' },
                    { name: 'Kiểm tra chẩn đoán', description: 'Kiểm tra từng cụm, xác định hư hỏng, phân loại sửa chữa/thay thế', type: 'test' },
                    { name: 'Sửa chữa / Thay thế', description: 'Sửa chữa các cụm hỏng, thay thế linh kiện không phục hồi được', type: 'repair' },
                    { name: 'Lắp ráp', description: 'Lắp ráp lại toàn bộ theo đúng cấu hình kỹ thuật', type: 'assembly' },
                    { name: 'Hiệu chỉnh', description: 'Hiệu chỉnh các thông số kỹ thuật theo hồ sơ thiết kế', type: 'calibration' },
                    { name: 'Thử nghiệm', description: 'Thử nghiệm toàn bộ tính năng kỹ thuật, chiến thuật', type: 'test' },
                    { name: 'Nghiệm thu', description: 'Nghiệm thu sản phẩm, lập biên bản, bàn giao', type: 'acceptance' },
                  ],
                  overhaul: [
                    { name: 'Tiếp nhận', description: 'Tiếp nhận, lập biên bản hiện trạng toàn bộ tổ hợp', type: 'test' },
                    { name: 'Tháo rời toàn bộ', description: 'Tháo rời tất cả cụm, chi tiết theo quy trình đại tu', type: 'repair' },
                    { name: 'Làm sạch / Xử lý bề mặt', description: 'Làm sạch, xử lý chống ăn mòn, sơn phủ bảo vệ', type: 'repair' },
                    { name: 'Kiểm tra / Phân loại', description: 'Kiểm tra từng chi tiết, phân loại: còn dùng / thay thế / phục hồi', type: 'test' },
                    { name: 'Sửa chữa / Thay thế', description: 'Phục hồi chi tiết hỏng, thay mới chi tiết hết hạn sử dụng', type: 'repair' },
                    { name: 'Lắp ráp / Cân chỉnh', description: 'Lắp ráp toàn bộ, cân chỉnh theo dung sai thiết kế', type: 'assembly' },
                    { name: 'Sơn phủ hoàn thiện', description: 'Sơn phủ bảo vệ bên ngoài theo tiêu chuẩn công nghiệp', type: 'repair' },
                    { name: 'Thử nghiệm', description: 'Thử nghiệm toàn diện trên bệ thử và thực địa', type: 'test' },
                    { name: 'Nghiệm thu / Bàn giao', description: 'Nghiệm thu đại tu, lập hồ sơ, bàn giao đơn vị', type: 'acceptance' },
                  ],
                  manufacturing: [
                    { name: 'Thiết kế sơ bộ', description: 'Thiết kế tổng thể, xác định yêu cầu kỹ thuật đầu ra', type: 'repair' },
                    { name: 'Thiết kế chi tiết', description: 'Thiết kế chi tiết từng module, lập bản vẽ gia công', type: 'repair' },
                    { name: 'Chế tạo mẫu', description: 'Chế tạo mẫu thử nghiệm, kiểm tra chức năng', type: 'assembly' },
                    { name: 'Thử nghiệm mẫu', description: 'Thử nghiệm tính năng mẫu, hiệu chỉnh thiết kế', type: 'test' },
                    { name: 'Sản xuất loạt', description: 'Sản xuất theo số lượng yêu cầu, kiểm soát chất lượng', type: 'assembly' },
                    { name: 'Kiểm định', description: 'Kiểm định từng sản phẩm theo tiêu chuẩn công nghiệp', type: 'test' },
                    { name: 'Bàn giao', description: 'Đóng gói, lập hồ sơ, bàn giao cho đơn vị', type: 'acceptance' },
                  ],
                  research: [
                    { name: 'Khảo sát hiện trạng', description: 'Khảo sát, thu thập dữ liệu hệ thống hiện tại', type: 'test' },
                    { name: 'Phân tích kiến trúc', description: 'Phân tích kiến trúc hệ thống, đánh giá khả năng nâng cấp', type: 'test' },
                    { name: 'Thiết kế phương án', description: 'Xây dựng phương án nâng cấp, tính toán kỹ thuật', type: 'repair' },
                    { name: 'Mô phỏng', description: 'Mô phỏng, đánh giá tính khả thi của phương án', type: 'test' },
                    { name: 'Lập báo cáo', description: 'Tổng hợp kết quả, lập báo cáo nghiên cứu khả thi', type: 'acceptance' },
                  ],
                };
                const steps = (templates[mType] || templates.repair).map((s, i) => ({
                  id: `ps-${Date.now() + i}`, order: i + 1, ...s,
                }));
                setProcessSteps(steps);
                message.success(`Đã gợi ý ${steps.length} công đoạn quy trình chuẩn`);
              }}
              style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>Gợi ý quy trình chuẩn</Button>
            <Button icon={<PlusCircleOutlined />} size="small"
              onClick={() => setProcessSteps(prev => [...prev, { id: `ps-${Date.now()}`, order: prev.length + 1, name: '', description: '', type: 'repair' }])}
              style={{ borderColor: colors.navy, color: colors.navy }}>Thêm công đoạn</Button>
          </Space>
        </div>
        <Table dataSource={processSteps} rowKey="id" pagination={false} size="small"
          locale={{ emptyText: 'Bấm "Gợi ý quy trình chuẩn" hoặc "Thêm công đoạn" để xây dựng quy trình' }}
          columns={[
            { title: 'Bước', dataIndex: 'order', width: 55, align: 'center' as const, render: (_: unknown, __: unknown, i: number) => <Tag color="blue">{i + 1}</Tag> },
            { title: 'Tên công đoạn', dataIndex: 'name', render: (v: string, r: ProcessStep) => <Input size="small" value={v} placeholder="VD: Tháo rời kiểm tra" onChange={e => setProcessSteps(p => p.map(s => s.id === r.id ? { ...s, name: e.target.value } : s))} /> },
            { title: 'Mô tả', dataIndex: 'description', render: (v: string, r: ProcessStep) => <Input size="small" value={v} placeholder="Chi tiết công việc" onChange={e => setProcessSteps(p => p.map(s => s.id === r.id ? { ...s, description: e.target.value } : s))} /> },
            { title: 'Loại', dataIndex: 'type', width: 120, render: (v: string, r: ProcessStep) => (
              <Select size="small" value={v} style={{ width: '100%' }} onChange={n => setProcessSteps(p => p.map(s => s.id === r.id ? { ...s, type: n } : s))}>
                <Select.Option value="repair">Sửa chữa</Select.Option>
                <Select.Option value="test">Kiểm tra</Select.Option>
                <Select.Option value="assembly">Lắp ráp</Select.Option>
                <Select.Option value="calibration">Hiệu chỉnh</Select.Option>
                <Select.Option value="acceptance">Nghiệm thu</Select.Option>
              </Select>
            )},
            { title: '', width: 35, render: (_: unknown, r: ProcessStep) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => setProcessSteps(p => p.filter(s => s.id !== r.id))} /> },
          ]}
        />
      </Card>

      {/* Tài liệu */}
      <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
        <Text strong style={{ fontSize: 15, color: colors.navy, display: "block", marginBottom: 12 }}></Text>
        <Upload.Dragger beforeUpload={() => false} multiple accept=".pdf,.doc,.docx,.dwg,.xlsx">
          <p className="ant-upload-drag-icon"><InboxOutlined style={{ color: colors.navyLight }} /></p>
          <p className="ant-upload-text" style={{ fontSize: 13 }}>Kéo thả hoặc nhấn để tải lên</p>
          <p className="ant-upload-hint" style={{ fontSize: 13, color: '#999' }}>Bản vẽ kỹ thuật, hồ sơ thiết kế, tài liệu tham khảo</p>
        </Upload.Dragger>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 3: KHỐI LƯỢNG CÔNG VIỆC (pre-filled from proposal)
  // ═══════════════════════════════════════════════════════════
  const handleFetchWorkVolumes = () => {
    if (workVolumes.length > 0) return;
    const mType = mission?.missionType || 'repair';
    const dept = mission?.assignedDepartment || 'PX1';
    const templates: Record<string, WorkVolume[]> = {
      repair: [
        { id: `wv-${Date.now()}`, name: 'Tháo rời và kiểm tra', unit: 'Cụm', quantity: 1, estimatedDays: 20, assignedUnit: dept },
        { id: `wv-${Date.now()+1}`, name: 'Sửa chữa và thay thế', unit: 'Bộ', quantity: 1, estimatedDays: 40, assignedUnit: dept },
        { id: `wv-${Date.now()+2}`, name: 'Lắp ráp và hiệu chỉnh', unit: 'Đài', quantity: 1, estimatedDays: 20, assignedUnit: dept },
        { id: `wv-${Date.now()+3}`, name: 'Thử nghiệm và nghiệm thu', unit: 'Đài', quantity: 1, estimatedDays: 15, assignedUnit: 'PKCDB' },
      ],
      overhaul: [
        { id: `wv-${Date.now()}`, name: 'Tháo rời toàn bộ', unit: 'Tổ hợp', quantity: 1, estimatedDays: 40, assignedUnit: dept },
        { id: `wv-${Date.now()+1}`, name: 'Kiểm tra phân loại', unit: 'Cụm', quantity: 8, estimatedDays: 30, assignedUnit: dept },
        { id: `wv-${Date.now()+2}`, name: 'Sửa chữa/thay thế', unit: 'Cụm', quantity: 8, estimatedDays: 60, assignedUnit: dept },
        { id: `wv-${Date.now()+3}`, name: 'Lắp ráp cân chỉnh', unit: 'Tổ hợp', quantity: 1, estimatedDays: 40, assignedUnit: dept },
        { id: `wv-${Date.now()+4}`, name: 'Thử nghiệm', unit: 'Lần', quantity: 1, estimatedDays: 20, assignedUnit: 'PKCDB' },
      ],
      manufacturing: [
        { id: `wv-${Date.now()}`, name: 'Thiết kế', unit: 'Bộ', quantity: 1, estimatedDays: 60, assignedUnit: 'PKT' },
        { id: `wv-${Date.now()+1}`, name: 'Chế tạo mẫu', unit: 'Bộ', quantity: 2, estimatedDays: 45, assignedUnit: dept },
        { id: `wv-${Date.now()+2}`, name: 'Sản xuất loạt', unit: 'Bộ', quantity: mission?.equipmentQuantity || 1, estimatedDays: 90, assignedUnit: dept },
        { id: `wv-${Date.now()+3}`, name: 'Kiểm định bàn giao', unit: 'Bộ', quantity: mission?.equipmentQuantity || 1, estimatedDays: 30, assignedUnit: 'PKCDB' },
      ],
      research: [
        { id: `wv-${Date.now()}`, name: 'Khảo sát hiện trạng', unit: 'Báo cáo', quantity: 1, estimatedDays: 30, assignedUnit: 'PKT' },
        { id: `wv-${Date.now()+1}`, name: 'Phân tích thiết kế', unit: 'Bộ', quantity: 1, estimatedDays: 60, assignedUnit: 'PKT' },
        { id: `wv-${Date.now()+2}`, name: 'Mô phỏng đánh giá', unit: 'Lần', quantity: 3, estimatedDays: 30, assignedUnit: dept },
      ],
    };
    setWorkVolumes(templates[mType] || templates.repair);
    message.success('Đã gợi ý khối lượng từ cấu hình');
  };

  const renderStep3 = () => (
    <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Text strong style={{ fontSize: 15, color: colors.navy }}></Text>
          <Tag color="blue">{workVolumes.length} hạng mục</Tag>
        </Space>
        <Space>
          <Button icon={<CloudDownloadOutlined />} onClick={handleFetchWorkVolumes} size="small"
            style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>Gợi ý từ cấu hình</Button>
          <Button icon={<PlusCircleOutlined />} size="small"
            onClick={() => setWorkVolumes(prev => [...prev, { id: `wv-${Date.now()}`, name: '', unit: '', quantity: 1, estimatedDays: 1, assignedUnit: '' }])}
            style={{ borderColor: colors.navy, color: colors.navy }}>Thêm</Button>
        </Space>
      </div>
      <Table dataSource={workVolumes} rowKey="id" pagination={false} size="small"
        columns={[
          { title: '#', width: 40, render: (_: unknown, __: unknown, i: number) => i + 1 },
          { title: 'Hạng mục', dataIndex: 'name', render: (v: string, r: WorkVolume) => <Input size="small" value={v} onChange={e => setWorkVolumes(p => p.map(w => w.id === r.id ? { ...w, name: e.target.value } : w))} placeholder="Tên công việc" /> },
          { title: 'ĐVT', dataIndex: 'unit', width: 80, render: (v: string, r: WorkVolume) => <Input size="small" value={v} onChange={e => setWorkVolumes(p => p.map(w => w.id === r.id ? { ...w, unit: e.target.value } : w))} /> },
          { title: 'SL', dataIndex: 'quantity', width: 60, render: (v: number, r: WorkVolume) => <InputNumber size="small" min={1} value={v} style={{ width: '100%' }} onChange={n => setWorkVolumes(p => p.map(w => w.id === r.id ? { ...w, quantity: n || 1 } : w))} /> },
          { title: 'Ngày', dataIndex: 'estimatedDays', width: 60, render: (v: number, r: WorkVolume) => <InputNumber size="small" min={1} value={v} style={{ width: '100%' }} onChange={n => setWorkVolumes(p => p.map(w => w.id === r.id ? { ...w, estimatedDays: n || 1 } : w))} /> },
          { title: 'Đơn vị TH', dataIndex: 'assignedUnit', width: 120, render: (v: string, r: WorkVolume) => <Select size="small" value={v || undefined} style={{ width: '100%' }} placeholder="Chọn" onChange={n => setWorkVolumes(p => p.map(w => w.id === r.id ? { ...w, assignedUnit: n } : w))} options={technicalDepts.map(d => ({ value: d.id, label: d.shortName }))} /> },
          { title: '', width: 35, render: (_: unknown, r: WorkVolume) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => setWorkVolumes(p => p.filter(w => w.id !== r.id))} /> },
        ]}
        summary={() => workVolumes.length ? (
          <Table.Summary.Row style={{ background: '#f5f7fa' }}>
            <Table.Summary.Cell index={0} colSpan={4}><Text strong>Tổng</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={1}><Text strong style={{ color: colors.navy }}>{workVolumes.reduce((s, w) => s + w.estimatedDays, 0)} ngày</Text></Table.Summary.Cell>
            <Table.Summary.Cell index={2} colSpan={2} />
          </Table.Summary.Row>
        ) : null}
      />
    </Card>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 4: VẬT TƯ - THIẾT BỊ (pre-filled from costItems material)
  // ═══════════════════════════════════════════════════════════
  const handleCheckInventory = () => {
    setInventoryLoading(true);
    setTimeout(() => {
      const standardPrices: Record<string, number> = {
        'Bộ': 45, 'Chiếc': 120, 'Mét': 0.5, 'Ca': 5, 'Gói': 100, 'Lít': 0.6, 'Kg': 2,
      };
      setMaterials(prev => prev.map(m => {
        const stock = Math.floor(Math.random() * 15) + 1;
        const price = m.unitPrice > 0 ? m.unitPrice : (standardPrices[m.unit] || 10);
        return {
          ...m,
          inStock: stock,
          toBuy: Math.max(0, m.needed - stock),
          unitPrice: price,
        };
      }));
      setInventoryChecked(true);
      setInventoryLoading(false);
      message.success('Đã cập nhật tồn kho & đơn giá chuẩn từ QL Kho + QL TC-KT');
    }, 800);
  };

  const renderStep4 = () => (
    <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Text strong style={{ fontSize: 15, color: colors.navy }}></Text>
          <Tag color="blue">{materials.length} mục</Tag>
        </Space>
        <Space>
          <Button icon={<SyncOutlined />} onClick={handleCheckInventory} size="small" loading={inventoryLoading}
            style={{ borderColor: '#1890ff', color: '#1890ff' }}>{inventoryChecked ? 'Cập nhật lại' : 'Kiểm tra tồn kho & đơn giá'}</Button>
          <Button icon={<PlusCircleOutlined />} size="small"
            onClick={() => setMaterials(prev => [...prev, { id: `m-${Date.now()}`, name: '', unit: 'Bộ', needed: 1, inStock: 0, toBuy: 1, unitPrice: 0 }])}
            style={{ borderColor: colors.navy, color: colors.navy }}>Thêm</Button>
        </Space>
      </div>
      <Table dataSource={materials} rowKey="id" pagination={false} size="small"
        columns={[
          { title: '#', width: 35, render: (_: unknown, __: unknown, i: number) => i + 1 },
          { title: 'Tên vật tư / thiết bị', dataIndex: 'name', render: (v: string, r: MaterialItem) => <Input size="small" value={v} onChange={e => setMaterials(p => p.map(m => m.id === r.id ? { ...m, name: e.target.value } : m))} placeholder="Tên" /> },
          { title: 'ĐVT', dataIndex: 'unit', width: 70, render: (v: string, r: MaterialItem) => <Input size="small" value={v} onChange={e => setMaterials(p => p.map(m => m.id === r.id ? { ...m, unit: e.target.value } : m))} /> },
          { title: 'Cần', dataIndex: 'needed', width: 60, render: (v: number, r: MaterialItem) => <InputNumber size="small" min={1} value={v} style={{ width: '100%' }} onChange={n => setMaterials(p => p.map(m => m.id === r.id ? { ...m, needed: n || 1, toBuy: Math.max(0, (n || 1) - m.inStock) } : m))} /> },
          { title: 'Tồn kho', dataIndex: 'inStock', width: 70, align: 'center' as const, render: (v: number) => inventoryChecked ? <Tag color={v > 0 ? 'green' : 'red'}>{v}</Tag> : <Text type="secondary">--</Text> },
          { title: 'Cần mua', dataIndex: 'toBuy', width: 70, align: 'center' as const, render: (v: number) => inventoryChecked ? (v > 0 ? <Tag color="orange">{v}</Tag> : <Tag color="green">0</Tag>) : <Text type="secondary">--</Text> },
          { title: 'Đơn giá (tr)', dataIndex: 'unitPrice', width: 90, render: (v: number, r: MaterialItem) => <InputNumber size="small" min={0} value={v} style={{ width: '100%' }} onChange={n => setMaterials(p => p.map(m => m.id === r.id ? { ...m, unitPrice: n || 0 } : m))} /> },
          { title: 'Thành tiền', width: 80, render: (_: unknown, r: MaterialItem) => <Text strong style={{ fontSize: 12, color: colors.navy }}>{formatCurrency(r.needed * r.unitPrice)}</Text> },
          { title: '', width: 35, render: (_: unknown, r: MaterialItem) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => setMaterials(p => p.filter(m => m.id !== r.id))} /> },
        ]}
        locale={{ emptyText: 'Bấm "Thêm" để thêm vật tư' }}
      />
    </Card>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 5: NHÂN LỰC (pre-filled from costItems labor)
  // ═══════════════════════════════════════════════════════════
  const handleSuggestLabor = () => {
    if (laborItems.length > 0) return;
    setLaborLoading(true);
    const dept = mission?.assignedDepartment ? departments.find(d => d.id === mission.assignedDepartment)?.name : '';
    setTimeout(() => {
    setLaborItems([
      { id: `l-${Date.now()}`, role: `Kỹ sư trưởng - ${dept}`, quantity: 1, days: 60, dailyRate: 1.2, skills: 'Chuyên gia hệ thống/sản phẩm' },
      { id: `l-${Date.now()+1}`, role: 'Thợ kỹ thuật bậc cao', quantity: 4, days: 45, dailyRate: 0.8, skills: 'Tháo lắp, hiệu chỉnh' },
      { id: `l-${Date.now()+2}`, role: 'Thợ kỹ thuật', quantity: 6, days: 30, dailyRate: 0.6, skills: 'Sửa chữa điện tử' },
    ]);
    setLaborSuggested(true);
    setLaborLoading(false);
    message.success('Đã gợi ý nhân lực từ QL Nguồn lực');
    }, 600);
  };

  const renderStep5 = () => (
    <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Text strong style={{ fontSize: 15, color: colors.navy }}></Text>
          <Tag color="blue">{laborItems.length} vai trò</Tag>
        </Space>
        <Space>
          <Button icon={<TeamOutlined />} onClick={handleSuggestLabor} size="small" loading={laborLoading}
            style={{ borderColor: '#52c41a', color: '#52c41a' }}>{laborSuggested ? 'Đã gợi ý' : 'Gợi ý từ QL Nguồn lực'}</Button>
          <Button icon={<PlusCircleOutlined />} size="small"
            onClick={() => setLaborItems(prev => [...prev, { id: `l-${Date.now()}`, role: '', quantity: 1, days: 1, dailyRate: 0.6 }])}
            style={{ borderColor: colors.navy, color: colors.navy }}>Thêm</Button>
        </Space>
      </div>
      <Table dataSource={laborItems} rowKey="id" pagination={false} size="small"
        columns={[
          { title: '#', width: 35, render: (_: unknown, __: unknown, i: number) => i + 1 },
          { title: 'Vai trò / Chức danh', dataIndex: 'role', render: (v: string, r: LaborItem) => <Input size="small" value={v} onChange={e => setLaborItems(p => p.map(l => l.id === r.id ? { ...l, role: e.target.value } : l))} placeholder="Vai trò" /> },
          { title: 'Năng lực', dataIndex: 'skills', width: 150, render: (v: string | undefined, r: LaborItem) => <Input size="small" value={v || ''} onChange={e => setLaborItems(p => p.map(l => l.id === r.id ? { ...l, skills: e.target.value } : l))} placeholder="Chuyên môn" /> },
          { title: 'SL', dataIndex: 'quantity', width: 55, render: (v: number, r: LaborItem) => <InputNumber size="small" min={1} value={v} style={{ width: '100%' }} onChange={n => setLaborItems(p => p.map(l => l.id === r.id ? { ...l, quantity: n || 1 } : l))} /> },
          { title: 'Ngày công', dataIndex: 'days', width: 70, render: (v: number, r: LaborItem) => <InputNumber size="small" min={1} value={v} style={{ width: '100%' }} onChange={n => setLaborItems(p => p.map(l => l.id === r.id ? { ...l, days: n || 1 } : l))} /> },
          { title: 'Đơn giá/ngày (tr)', dataIndex: 'dailyRate', width: 110, render: (v: number, r: LaborItem) => <InputNumber size="small" min={0} step={0.1} value={v} style={{ width: '100%' }} onChange={n => setLaborItems(p => p.map(l => l.id === r.id ? { ...l, dailyRate: n || 0 } : l))} /> },
          { title: 'Thành tiền', width: 80, render: (_: unknown, r: LaborItem) => <Text strong style={{ fontSize: 12, color: colors.navy }}>{formatCurrency(r.quantity * r.days * r.dailyRate)}</Text> },
          { title: '', width: 35, render: (_: unknown, r: LaborItem) => <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => setLaborItems(p => p.filter(l => l.id !== r.id))} /> },
        ]}
        locale={{ emptyText: 'Bấm "Gợi ý" hoặc "Thêm" để thêm nhân lực' }}
      />
    </Card>
  );

  // ═══════════════════════════════════════════════════════════
  // STEP 6: DỰ TOÁN & GIÁ THÀNH
  // ═══════════════════════════════════════════════════════════
  const renderStep6 = () => (
    <div>
      {/* Chi phí tự tính */}
      <Card className="db-chart-card" style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: 20 } }}>
        <Text strong style={{ fontSize: 15, color: colors.navy, display: "block", marginBottom: 16 }}></Text>
        <Row gutter={12}>
          {[
            { label: 'Vật tư', value: costSummary.materialCost, color: '#2563eb' },
            { label: 'Nhân công', value: costSummary.laborCost, color: '#059669' },
            { label: 'Chi phí chung (8%)', value: costSummary.overhead, color: '#d97706' },
            { label: 'TỔNG DỰ TOÁN', value: costSummary.total, color: colors.navy },
          ].map((item, idx) => (
            <Col xs={12} md={6} key={idx}>
              <div style={{ background: `${item.color}10`, borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${item.color}` }}>
                <Text style={{ fontSize: 13, color: '#666', display: 'block' }}>{item.label}</Text>
                <Text strong style={{ fontSize: 16, color: item.color }}>{formatCurrency(item.value)}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Giá đề xuất */}
      <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 20 } }}>
        <Text strong style={{ fontSize: 15, color: colors.navy, display: "block", marginBottom: 16 }}></Text>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Giá đề xuất (triệu đồng)" rules={[{ required: true, message: 'Nhập giá' }]}>
              <InputNumber min={0} style={{ width: '100%' }} size="large" value={proposedPrice}
                onChange={v => setProposedPrice(v || 0)} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <div style={{ paddingTop: 30 }}>
              <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Tỷ lệ lợi nhuận</Text>
              <Text strong style={{ fontSize: 20, color: Number(profitMargin) > 0 ? '#059669' : '#dc2626' }}>{profitMargin}%</Text>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ paddingTop: 30 }}>
              <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>Chênh lệch</Text>
              <Text strong style={{ fontSize: 20, color: colors.navy }}>{formatCurrency(proposedPrice - costSummary.total)}</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // SUMMARY PANEL (sticky right)
  // ═══════════════════════════════════════════════════════════
  const renderSummary = () => (
    <div style={{ position: 'sticky', top: 80 }}>
      <Card className="db-chart-card" style={{ borderRadius: 12 }} styles={{ body: { padding: 16 } }}>
        <Text strong style={{ color: colors.navy, fontSize: 14, display: 'block', marginBottom: 12 }}>Tổng hợp đề xuất</Text>

        {mission && (
          <div style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 10px', marginBottom: 12, fontSize: 13 }}>
            <Text strong style={{ fontSize: 13, color: colors.navy, display: 'block' }}>{mission.code}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{mission.equipmentType}</Text>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Text style={{ fontSize: 13, color: '#666' }}>Khối lượng CV</Text>
            <Text strong style={{ fontSize: 13 }}>{workVolumes.length} hạng mục</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Text style={{ fontSize: 13, color: '#666' }}>Tổng ngày</Text>
            <Text strong style={{ fontSize: 13 }}>{workVolumes.reduce((s, w) => s + w.estimatedDays, 0)} ngày</Text>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Text style={{ fontSize: 13, color: '#666' }}>Vật tư</Text>
            <Text strong style={{ fontSize: 13 }}>{materials.length} mục</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <Text style={{ fontSize: 13, color: '#666' }}>Nhân lực</Text>
            <Text strong style={{ fontSize: 13 }}>{laborItems.reduce((s, l) => s + l.quantity, 0)} người</Text>
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <Text style={{ fontSize: 13, color: '#666' }}>CP Vật tư</Text>
          <Text style={{ fontSize: 13 }}>{formatCurrency(costSummary.materialCost)}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <Text style={{ fontSize: 13, color: '#666' }}>CP Nhân công</Text>
          <Text style={{ fontSize: 13 }}>{formatCurrency(costSummary.laborCost)}</Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <Text style={{ fontSize: 13, color: '#666' }}>CP Chung</Text>
          <Text style={{ fontSize: 13 }}>{formatCurrency(costSummary.overhead)}</Text>
        </div>

        <div style={{
          background: `${colors.navy}08`, borderRadius: 6, padding: '10px 12px', marginTop: 8,
          borderLeft: `3px solid ${colors.navy}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text strong style={{ fontSize: 12, color: colors.navy }}>TỔNG DỰ TOÁN</Text>
            <Text strong style={{ fontSize: 14, color: colors.navy }}>{formatCurrency(costSummary.total)}</Text>
          </div>
          {proposedPrice > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 13, color: '#666' }}>Giá đề xuất</Text>
              <Text strong style={{ fontSize: 12, color: '#059669' }}>{formatCurrency(proposedPrice)}</Text>
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  const stepItems = [
    { title: 'Thông tin chung' },
    { title: 'Phương án KT' },
    { title: 'Khối lượng CV' },
    { title: 'Vật tư - Thiết bị' },
    { title: 'Nhân lực' },
    { title: 'Dự toán & Giá' },
  ];

  const stepsContent = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];

  return (
    <div style={{ padding: '0 0 24px' }}>
      {/* Hero Banner - Gold edit icon */}
      <Card style={{ marginBottom: 16, borderRadius: 14, border: 'none', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2a 0%, #1B3A5C 50%, #2d5a8e 100%)',
          padding: '16px 24px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(212,168,67,0.06)' }} />
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="middle" align="center">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff' }} />
                <Space size={8} align="center">
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(212,168,67,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EditOutlined style={{ color: '#f0d890', fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Chỉnh sửa đề xuất & dự toán</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                      {proposal.code} — {mission?.name || ''}
                    </div>
                  </div>
                </Space>
              </Space>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Steps - free navigation (any step clickable) */}
      <Card className="db-chart-card" style={{ borderRadius: 12, marginBottom: 16 }} styles={{ body: { padding: '12px 20px' } }}>
        <Steps current={currentStep} size="small" items={stepItems}
          onChange={step => setCurrentStep(step)} />
      </Card>

      {/* Main Content: 2 columns */}
      <Row gutter={16}>
        <Col xs={24} lg={17}>
          <Form form={form} layout="vertical" requiredMark="optional" preserve={true}
            initialValues={{
              proposalName: `Đề xuất ${mission?.name || ''}`,
              description: proposal.technicalPlan,
              technicalAnalysis: proposal.technicalPlan,
              technicalPlan: proposal.workProcess,
              configReference: proposal.configReference || '',
              estimatedDuration: proposal.estimatedDuration,
            }}
          >
            {stepsContent[currentStep]()}
          </Form>
        </Col>
        <Col xs={0} lg={7}>
          {renderSummary()}
        </Col>
      </Row>

      {/* Sticky Footer */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff', padding: '12px 20px', marginTop: 16,
        borderRadius: 12, boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Bước {currentStep + 1} / {stepItems.length}: {stepItems[currentStep].title}</Text>
        <Space>
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(prev => prev - 1)} style={{ borderRadius: 8, height: 38, padding: '0 20px' }}>
              Quay lại
            </Button>
          )}
          {currentStep < 5 ? (
            <Button type="primary" onClick={handleNext}
              style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8, height: 38, padding: '0 24px', fontWeight: 600 }}>
              Tiếp theo
            </Button>
          ) : (
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}
              style={{ background: colors.navy, borderColor: colors.navy, borderRadius: 8, height: 38, padding: '0 24px', fontWeight: 600 }}>
              Lưu & Trình duyệt
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default ProposalEditPage;
