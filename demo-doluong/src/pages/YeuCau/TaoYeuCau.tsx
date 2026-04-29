import { useState } from 'react';
import {
  Typography, Button, Input, Select, DatePicker, Row, Col, Upload, Tabs, message,
} from 'antd';
import {
  ArrowLeftOutlined, SaveOutlined, SendOutlined,
  PlusOutlined, DeleteOutlined, InboxOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  InfoCircleOutlined, FileTextOutlined,
  RadarChartOutlined, ExperimentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { colors } from '../../theme/themeConfig';
import { danhSachDonVi } from '../../data/donVi';
import { danhSachNguoiDung } from '../../data/nguoiDung';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const ktvList = danhSachNguoiDung.filter((nd) => ['ktv', 'manager'].includes(nd.vaiTro));
const labOptions = [
  'Phòng Lab Điện-Điện tử', 'Phòng Lab Tần số-Vô tuyến', 'Phòng Lab Nhiệt-Quang',
  'Phòng Lab Áp suất', 'Phòng Lab Khối lượng-Hình học', 'Phòng Lab Lưu lượng', 'Phòng Lab Rung động',
];

interface ThamSoDo {
  id: string; ten: string; donVi: string; daiDo: string; saiSo: string; ghiChu: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>
        {label} {required && <span style={{ color: '#ff4d4f' }}>*</span>}
      </Text>
    </div>
  );
}

function SectionCard({ title, subtitle, children, highlight }: {
  title: string; subtitle?: string; children: React.ReactNode; highlight?: boolean;
}) {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, marginBottom: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      border: highlight ? `1px solid ${colors.navy}30` : '1px solid #edf0f4',
    }}>
      <div style={{
        padding: '14px 24px', borderBottom: '1px solid #f0f0f0',
        background: highlight ? `${colors.navy}04` : undefined,
      }}>
        <Text strong style={{ fontSize: 14, color: '#1a1a2e' }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 12, color: '#8c8c8c', display: 'block', marginTop: 1 }}>{subtitle}</Text>}
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function TaoYeuCau() {
  const navigate = useNavigate();
  const [thamSo, setThamSo] = useState<ThamSoDo[]>([
    { id: '1', ten: '', donVi: '', daiDo: '', saiSo: '', ghiChu: '' },
  ]);
  const [fileList, setFileList] = useState<any[]>([]);

  // Checklist
  const [hasThongTin, setHasThongTin] = useState(false);
  const [hasDoiTuong, setHasDoiTuong] = useState(false);
  const [hasNoiDung, setHasNoiDung] = useState(false);
  const [hasThamSo, setHasThamSo] = useState(false);
  const [hasHanTra, setHasHanTra] = useState(false);

  const addRow = () => {
    setThamSo((p) => [...p, { id: String(Date.now()), ten: '', donVi: '', daiDo: '', saiSo: '', ghiChu: '' }]);
    setHasThamSo(true);
  };
  const removeRow = (id: string) => setThamSo((p) => p.filter((t) => t.id !== id));
  const updateRow = (id: string, field: keyof ThamSoDo, value: string) => {
    setThamSo((p) => p.map((t) => t.id === id ? { ...t, [field]: value } : t));
    if (field === 'ten' && value) setHasThamSo(true);
  };

  const checklist = [
    { label: 'Đã nhập thông tin chung', ok: hasThongTin },
    { label: 'Đã khai báo đối tượng đo', ok: hasDoiTuong },
    { label: 'Đã nhập nội dung yêu cầu đo', ok: hasNoiDung },
    { label: 'Đã khai báo ≥1 tham số đo', ok: hasThamSo },
    { label: 'Đã chọn hạn trả kết quả', ok: hasHanTra },
  ];
  const doneCount = checklist.filter((c) => c.ok).length;

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight: '100%' }}>

      {/* ═══ HEADER — match ChiTietYeuCau style ═══════════════════════════════ */}
      <div style={{
        background: '#edf4fc', borderBottom: '1px solid #d6e4f5',
        padding: '20px 32px',
      }}>
        <Button type="text" icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/yeu-cau')}
          style={{ color: colors.navy, marginBottom: 8, padding: '4px 0', fontSize: 13 }}>
          Quay lại danh sách yêu cầu
        </Button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <Title level={4} style={{ color: '#1a1a2e', margin: 0 }}>Tạo mới yêu cầu đo lường</Title>
              <span style={{
                padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                background: '#f5f7fa', color: '#8c8c8c', border: '1px solid #e8e8e8',
              }}>Bản nháp</span>
            </div>
            <Text style={{ color: '#595959', fontSize: 13 }}>Create Measurement Request — Doanh nghiệp A</Text>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<SaveOutlined />} onClick={() => message.info('Đã lưu nháp')}>Lưu nháp</Button>
            <Button type="primary" icon={<SendOutlined />}
              onClick={() => { message.success('Đã gửi yêu cầu phê duyệt'); navigate('/yeu-cau'); }}>
              Gửi phê duyệt
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ TABS — match ChiTietYeuCau style ═══════════════════════════════ */}
      <div style={{ padding: '0 32px 32px' }}>
        <Tabs
          defaultActiveKey="info"
          style={{ marginTop: 4 }}
          size="large"
          items={[
            // ─── TAB 1: Thông tin chung & Đối tượng đo ─────────────────
            {
              key: 'info',
              label: <span><FileTextOutlined /> Thông tin yêu cầu</span>,
              children: (
                <div>
                    {/* Thông tin chung */}
                    <SectionCard title="Thông tin chung">
                      <Row gutter={16}>
                        <Col span={6}>
                          <FieldLabel label="Mã yêu cầu" />
                          <Input value="YC-2026-013" disabled style={{ background: '#f8fafc', fontWeight: 600, color: colors.navy }} />
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Ngày tạo" />
                          <DatePicker value={dayjs('2026-03-27')} disabled style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Đơn vị yêu cầu" required />
                          <Select placeholder="Chọn đơn vị" style={{ width: '100%' }} showSearch optionFilterProp="children"
                            onChange={() => setHasThongTin(true)}>
                            {danhSachDonVi.map((dv) => <Option key={dv.id} value={dv.id}>{dv.ten}</Option>)}
                          </Select>
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Mức ưu tiên" required />
                          <Select placeholder="Chọn" style={{ width: '100%' }}>
                            <Option value="thap">Thấp</Option>
                            <Option value="trung_binh">Trung bình</Option>
                            <Option value="cao">Cao</Option>
                            <Option value="khan_cap">Khẩn cấp</Option>
                          </Select>
                        </Col>
                      </Row>
                      <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={6}>
                          <FieldLabel label="Mục đích đo" required />
                          <Select placeholder="Chọn mục đích" style={{ width: '100%' }}>
                            {['Kiểm tra định kỳ', 'Đánh giá sau sửa chữa', 'Đo kiểm nghiệm thu', 'Xác minh sai lệch kỹ thuật', 'Kiểm tra phục vụ bảo dưỡng', 'Khác'].map((m) => (
                              <Option key={m} value={m}>{m}</Option>
                            ))}
                          </Select>
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Hạn trả kết quả" required />
                          <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày"
                            onChange={(d) => setHasHanTra(!!d)} />
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Mức độ mật" />
                          <Select defaultValue="thuong" style={{ width: '100%' }}>
                            <Option value="thuong">Thường</Option>
                            <Option value="mat">Mật</Option>
                            <Option value="toi_mat">Tối mật</Option>
                          </Select>
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Người tạo yêu cầu" />
                          <Input value="Trần Quốc Bảo" disabled style={{ background: '#f8fafc' }} />
                        </Col>
                      </Row>
                    </SectionCard>

                    {/* Đối tượng đo */}
                    <SectionCard title="Thông tin đối tượng đo" subtitle="Khí tài / hệ thống kỹ thuật được yêu cầu đo, kiểm tra, đánh giá">
                      <Row gutter={16}>
                        <Col span={10}>
                          <FieldLabel label="Tên đối tượng đo" required />
                          <Input placeholder="VD: Khối phát hệ thống monitoring TX-18 Terek, Hệ thống làm mát data center DC-300 số 02"
                            onChange={(e) => setHasDoiTuong(!!e.target.value)} />
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Mã quản lý / Số hiệu" required />
                          <Input placeholder="VD: DTD-RA18-361-01" style={{ fontFamily: 'monospace' }} />
                        </Col>
                        <Col span={4}>
                          <FieldLabel label="Loại đối tượng đo" required />
                          <Select placeholder="Chọn loại" style={{ width: '100%' }}>
                            {['Hệ thống monitoring', 'Module phần mềm', 'Server', 'Thiết bị điều khiển', 'Khối điện tử', 'Module kỹ thuật', 'Bộ nguồn', 'Cảm biến', 'Hệ thống làm mát', 'Khác'].map((l) => (
                              <Option key={l} value={l}>{l}</Option>
                            ))}
                          </Select>
                        </Col>
                        <Col span={4}>
                          <FieldLabel label="Tình trạng hiện tại" required />
                          <Select placeholder="Chọn" style={{ width: '100%' }}>
                            {['Đang khai thác', 'Sau sửa chữa', 'Chờ nghiệm thu', 'Có nghi ngờ sai lệch', 'Bảo dưỡng định kỳ'].map((s) => (
                              <Option key={s} value={s}>{s}</Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                      <Row gutter={16} style={{ marginTop: 16 }}>
                        <Col span={6}>
                          <FieldLabel label="Model / Phiên bản" />
                          <Input placeholder="VD: TX-18 Terek, DC-300PMU1" />
                        </Col>
                        <Col span={18}>
                          <FieldLabel label="Mô tả hiện tượng / Vấn đề kỹ thuật" />
                          <TextArea rows={1} placeholder="Mô tả chi tiết hiện tượng kỹ thuật, lý do cần đo..." />
                        </Col>
                      </Row>
                    </SectionCard>

                    {/* Đề xuất & Ghi chú */}
                    <SectionCard title="Đề xuất xử lý & Hồ sơ đính kèm">
                      <Row gutter={16}>
                        <Col span={6}>
                          <FieldLabel label="Đề xuất phòng Lab" />
                          <Select placeholder="Chọn phòng Lab" style={{ width: '100%' }} allowClear>
                            {labOptions.map((l) => <Option key={l} value={l}>{l}</Option>)}
                          </Select>
                        </Col>
                        <Col span={6}>
                          <FieldLabel label="Đề xuất người phụ trách" />
                          <Select placeholder="Chọn KTV" style={{ width: '100%' }} allowClear showSearch optionFilterProp="children">
                            {ktvList.map((nd) => <Option key={nd.id} value={nd.id}>{nd.capBac} {nd.hoTen}</Option>)}
                          </Select>
                        </Col>
                        <Col span={12}>
                          <FieldLabel label="Ghi chú nội bộ" />
                          <TextArea rows={1} placeholder="Ý kiến bổ sung, lưu ý cho bộ phận xử lý..." />
                        </Col>
                      </Row>
                      <div style={{ marginTop: 16 }}>
                        <Dragger
                          multiple fileList={fileList}
                          onChange={({ fileList: fl }) => setFileList(fl)}
                          beforeUpload={() => false}
                          style={{ borderRadius: 8 }}
                        >
                          <p style={{ marginBottom: 8 }}><InboxOutlined style={{ fontSize: 28, color: colors.navy }} /></p>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>Kéo thả file vào đây hoặc bấm để chọn</p>
                          <p style={{ fontSize: 11, color: '#8c8c8c' }}>PDF, Word, Excel, ảnh — tối đa 20MB/file</p>
                        </Dragger>
                      </div>
                    </SectionCard>
                </div>
              ),
            },

            // ─── TAB 2: Nội dung yêu cầu đo ───────────────────────────
            {
              key: 'noiDung',
              label: <span><ExperimentOutlined /> Nội dung yêu cầu đo</span>,
              children: (
                <div>
                  <SectionCard title="Mô tả nội dung yêu cầu đo" highlight>
                    <Row gutter={16}>
                      <Col span={16}>
                        <FieldLabel label="Nội dung yêu cầu đo" required />
                        <TextArea rows={3}
                          placeholder="VD: Yêu cầu đo kiểm tra tham số phát hệ thống monitoring TX-18: tần số trung tâm, công suất phát xung, độ rộng xung..."
                          onChange={(e) => setHasNoiDung(!!e.target.value)} />
                      </Col>
                      <Col span={8}>
                        <FieldLabel label="Lý do phát sinh yêu cầu" />
                        <TextArea rows={3} placeholder="VD: Phát hiện sụt giảm công suất phát khi kiểm tra vận hành..." />
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: 16 }}>
                      <Col span={12}>
                        <FieldLabel label="Yêu cầu kỹ thuật / Giới hạn chấp nhận" />
                        <TextArea rows={2} placeholder="VD: Sai số tần số ≤0.2 MHz, công suất phát ≥85% giá trị danh định..." />
                      </Col>
                      <Col span={12}>
                        <FieldLabel label="Căn cứ kỹ thuật / Tài liệu tham chiếu" />
                        <TextArea rows={2} placeholder="VD: Tài liệu KT hệ thống monitoring TX-18 (bản dịch), ĐLVN 154:2022..." />
                      </Col>
                    </Row>
                  </SectionCard>

                  <SectionCard title="Tham số / Đại lượng cần đo" subtitle="Khai báo các đại lượng cần đo và giới hạn cho phép" highlight>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                      <Button type="primary" ghost icon={<PlusOutlined />} size="small" onClick={addRow}>Thêm dòng</Button>
                    </div>

                    <div style={{
                      display: 'grid', gridTemplateColumns: '36px 1fr 80px 120px 100px 1fr 36px',
                      gap: 8, padding: '8px 12px', fontSize: 11, fontWeight: 600, color: '#8c8c8c',
                      textTransform: 'uppercase', letterSpacing: '0.3px',
                      background: '#f8fafc', borderRadius: '8px 8px 0 0', border: '1px solid #edf0f4', borderBottom: 'none',
                    }}>
                      <span>STT</span><span>Tên tham số đo</span><span>Đơn vị</span>
                      <span>Dải đo</span><span>Sai số CP</span><span>Ghi chú</span><span />
                    </div>

                    <div style={{ border: '1px solid #edf0f4', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                      {thamSo.map((ts, idx) => (
                        <div key={ts.id} style={{
                          display: 'grid', gridTemplateColumns: '36px 1fr 80px 120px 100px 1fr 36px',
                          gap: 8, padding: '8px 12px', alignItems: 'center',
                          borderBottom: idx < thamSo.length - 1 ? '1px solid #f5f5f5' : 'none',
                          background: idx % 2 === 0 ? '#fff' : '#fafbfc',
                        }}>
                          <Text style={{ fontSize: 12, color: '#8c8c8c', textAlign: 'center' }}>{idx + 1}</Text>
                          <Input size="small" variant="borderless" value={ts.ten} placeholder="Tên tham số"
                            onChange={(e) => updateRow(ts.id, 'ten', e.target.value)} />
                          <Input size="small" variant="borderless" value={ts.donVi} placeholder="V, MHz"
                            onChange={(e) => updateRow(ts.id, 'donVi', e.target.value)} />
                          <Input size="small" variant="borderless" value={ts.daiDo} placeholder="0–28"
                            onChange={(e) => updateRow(ts.id, 'daiDo', e.target.value)} />
                          <Input size="small" variant="borderless" value={ts.saiSo} placeholder="±0.5"
                            onChange={(e) => updateRow(ts.id, 'saiSo', e.target.value)} />
                          <Input size="small" variant="borderless" value={ts.ghiChu} placeholder="Ghi chú"
                            onChange={(e) => updateRow(ts.id, 'ghiChu', e.target.value)} />
                          <Button type="text" danger size="small" icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                            disabled={thamSo.length <= 1} onClick={() => removeRow(ts.id)} />
                        </div>
                      ))}
                    </div>

                    {thamSo.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: '#bfbfbf' }}>
                        <ExperimentOutlined style={{ fontSize: 24, marginBottom: 6 }} />
                        <div style={{ fontSize: 13 }}>Chưa có tham số đo. Bấm "Thêm dòng" để bắt đầu.</div>
                      </div>
                    )}
                  </SectionCard>
                </div>
              ),
            },
          ]}
        />

      </div>
    </div>
  );
}
