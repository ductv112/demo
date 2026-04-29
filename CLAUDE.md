# Demo workspace — context cho Claude Code

Workspace này chứa 19 demo modules dùng để chạy prototype cho khách hàng doanh nghiệp. Mỗi module là một app React/Next.js độc lập (Vite hoặc Next.js).

## Bối cảnh & nhiệm vụ đang làm dở

**Nhiệm vụ:** Rebrand toàn bộ mockdata + UI text từ chủ đề Quân đội PKKQ (Phòng Không – Không Quân) sang doanh nghiệp generic **"Doanh nghiệp A"** — công ty công nghệ (sản xuất + cung ứng phần mềm).

**Trạng thái:** Partial. Commit đầu tiên (`b2947f6`) đã push 1042 files lên `origin/main`. Phần đã làm xong và phần cần làm tiếp ghi rõ ở [§ Trạng thái từng module](#trạng-thái-từng-module) bên dưới.

## Quy ước thay thế (mapping bắt buộc)

### Tổ chức / cơ cấu
| Quân sự | Doanh nghiệp |
|---|---|
| PKKQ / Quân chủng Phòng Không – Không Quân / Bộ Tư lệnh | Doanh nghiệp A / Tổng công ty / Ban Giám đốc |
| Bộ Quốc phòng | Ban TGĐ / HĐQT |
| Quân đoàn / Sư đoàn | Khối / Tổng công ty con |
| Trung đoàn / Lữ đoàn | Phòng / Trung tâm |
| Tiểu đoàn / Đại đội / Trung đội / Tiểu đội | Tổ / Nhóm |
| Đơn vị | **Giữ nguyên** (đã trung tính) |
| Phiên hiệu (Sư đoàn 361, Trung đoàn 236...) | Mã đơn vị (Khối K01, Phòng P12...) |

### Nhân sự
| Cấp bậc quân sự | Chức danh doanh nghiệp |
|---|---|
| Đại tướng / Thượng tướng / Trung tướng | Tổng giám đốc |
| Thiếu tướng | Phó Tổng giám đốc |
| Đại tá | Giám đốc |
| Thượng tá / Trung tá | Phó giám đốc |
| Thiếu tá | Trưởng phòng |
| Đại úy | Phó trưởng phòng |
| Thượng úy | Trưởng nhóm |
| Trung úy / Thiếu úy | Chuyên viên cao cấp |
| Thượng sĩ / Trung sĩ | Chuyên viên |
| Hạ sĩ / Binh nhất / Binh nhì | Nhân viên |
| Chính ủy / Chủ nhiệm chính trị | Giám đốc nhân sự |
| Tham mưu trưởng | Trưởng phòng vận hành / COO |
| Bộ đội / chiến sĩ / quân nhân | Nhân viên / cán bộ |

**Tên người Việt:** GIỮ tên gốc, BỎ cấp bậc. Ví dụ "Đại tá Nguyễn Văn A" → "Nguyễn Văn A — Giám đốc kỹ thuật".

### Thiết bị / khí tài
| Quân sự | Doanh nghiệp |
|---|---|
| Khí tài / vũ khí / trang bị | Thiết bị / hệ thống / sản phẩm phần mềm |
| Radar | Hệ thống monitoring / giám sát |
| Tên lửa | Module / Sản phẩm chủ lực |
| Máy bay | Server / Cluster |
| Pháo / súng | Module / Component |
| Đạn dược | License / Subscription |
| Nhà máy Z119, Z125, Z133, Z133D, A35, A41, X28, X32 | Trung tâm phần mềm Alpha / Beta / Gamma / Trung tâm R&D Hà Nội / Trung tâm DevOps Đà Nẵng |
| Phân xưởng PX1-PX4 | Trung tâm Phần mềm Alpha/Beta + TT Hạ tầng/DevOps |

**Mã thiết bị (P-37, S-125, 36D6...):** giữ mã, đổi tên loại. Ví dụ "Radar P-37" → "Hệ thống monitoring P-37".

### Hoạt động
| Quân sự | Doanh nghiệp |
|---|---|
| Nhiệm vụ chiến đấu / SSCĐ / Sẵn sàng chiến đấu | Nhiệm vụ vận hành / Trực vận hành / SLA |
| Tác chiến | Triển khai / Vận hành |
| Huấn luyện chiến đấu | Đào tạo nội bộ / Training |
| Phòng không / không phận | "vận hành hệ thống" hoặc xóa |
| Chiến đấu | Vận hành / Triển khai |
| Hậu cần | Logistics / Kho vận |

### Phân loại bảo mật
| Quân sự | Doanh nghiệp |
|---|---|
| Mật | Nội bộ |
| Tối mật | Hạn chế |
| Tuyệt mật | Bảo mật cao |

### Vòng đời (cho `demo-vongdoi`)
| Quân sự | Doanh nghiệp |
|---|---|
| Tiếp nhận | Phát triển |
| Vận hành (in_service) | Triển khai |
| Sửa chữa | Khắc phục sự cố |
| Đại tu | Nâng cấp lớn |
| Thanh lý | EOL / Loại bỏ |
| Cất kho | Lưu trữ |

## KHÔNG đổi (rất quan trọng — đổi sẽ phá build/route/style)

- **Tên biến code:** `pkkqPrimaryColor`, `pkkqTooltip`, `isRadar`, `isMissile`...
- **Tên file:** `pkkq-tooltip.tsx`, `chart-theme.ts`...
- **Type / interface names:** `type CapChuan`, `type Mission`, `type Equipment`...
- **TypeScript literal types:** `type EquipmentType = 'radar' | 'missile' | ...`
- **Color values, file paths, import paths**
- **`package.json` field `name`** (vd `pkkq-suachua` — giữ)
- **AppSwitcher URLs** (`https://pkkq-*-staging.dft.vn/`) — DNS staging thật, đổi sẽ phá routing cross-module
- **Số tài khoản kế toán VAS** (111, 112, 511...) trong `demo-taichinhketoan`
- **"Đơn vị" trong context "đơn vị đo"** (kg, m, V, A) — giữ trong `demo-doluong`, `demo-kho`
- **"Đơn vị tính"** (Cái, Bộ, Lít) trong kho — giữ

CHỈ đổi NỘI DUNG STRING mà người dùng nhìn thấy.

## Phạm vi cần quét

- File `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.html`, `.css`
- Mockdata (`src/data/`, `src/lib/mock-data.ts`, `src/lib/*-api.ts`)
- UI text: layout, sidebar, header, page titles, components, placeholder, tooltip, button text, error/empty state
- HTML `<title>`, meta description
- README.md, ROADMAP.md
- `package.json` field `description` (KHÔNG đổi `name`)
- Logo/favicon: file ảnh comment TODO; SVG inline đổi thành "DA"

## Trạng thái từng module

### Sạch (không cần làm gì thêm)
- `demo-portal` — landing/hub. Branding mới: "Hệ thống quản trị Doanh nghiệp A".
- `demo-sso` — login + user list. Branding: "DOANH NGHIỆP A". Còn file ảnh `public/bg-sso.jpg` + `image/background SSO.jpg` chưa thay (đã có TODO trong `App.css`).
- `demo-doluong` — đo lường KPI/chất lượng phần mềm.
- `demo-kho` — kho IT asset / license.
- `demo-sanxuat` — phát triển phần mềm / DevOps pipeline.
- `demo-taichinhketoan` — finance & accounting (giữ TK VAS).
- `demo-daitu` — đại tu hệ thống/server.
- `demo-chatluong` / `demo-suco` / `demo-thunghiem` — chỉ có 1 file `AppSwitcher.tsx` (skeleton module). Không có content cần đổi.

### Đã làm phần lớn, còn dư mockdata cần quét
- `demo-baotri` — còn `data/equipment.ts` (4), `data/procedures.ts` (2), `ROADMAP.md` (3), `App.css` (1).
- `demo-muahang` — còn `data/receiving.ts` (8), `data/materialRequests.ts` (8), `data/materials.ts` (1), `utils/format.ts` (5), `types/index.ts` (3), một số pages.
- `demo-hopdongnhiemvu` — còn `pages/ProposalCreate/index.tsx` (5), `pages/ProposalEdit/index.tsx` (5).
- `demo-vongdoi` — partial. **Còn nguyên/lớn:** `data/actualConfigurations.ts` (30), `data/equipment.ts` (17), `data/configurations.ts` (10), `data/changeRequests.ts` (7), `pages/Configuration` (16), `pages/ChangeRequest` (13), `pages/ActualConfiguration` (10), `pages/Categories` (7), `types/index.ts` (7).

### Còn nguyên gần như chưa chạm — cần ưu tiên
- `demo-antoan` — `data/incidents.ts` (20), `data/violations.ts` (15), `data/improvements.ts` (13), `data/risks.ts` (10), `data/controlSheets.ts` (9). Plus pages (Risks, Violations, SafetyControl, Improvements, Incidents, Reports), `contexts/UserContext.tsx`, `layouts/MainLayout.tsx`, `App.css`. Mọi user-visible string còn nguyên: "Tên lửa S-75", "PX2 — Sửa chữa Tên lửa", "Thiếu tá Phạm Văn Tùng", "radar 36D6"...
- `demo-suachua` — `data/workOrders.ts` (63), `data/materialRequests.ts` (9), `data/repairRequests.ts` (6), `data/repairHistory.ts` (6), `data/inspections.ts` (5), `data/diagnosticResults.ts` (5), `data/alerts.ts` (4), `data/repairTasks.ts` (3), `data/inventory.ts` (2). Plus `ROADMAP.md` (17), `App.css`, nhiều pages. Mọi data file giữ "Đài radar P-18", "Sư đoàn 361", "Đại tá Phạm Quốc Hưng", "Phân xưởng Sửa chữa Radar/Tên lửa".
- `demo-chatbot` — `lib/mock-data.ts` (53), `lib/chat-api.ts` (8), `lib/documents-api.ts` (4), `lib/ai-quality-api.ts` (3), `lib/auth.ts` (2), `lib/profile-api.ts` (2), `lib/api/chat-upload.ts` (2), `lib/departments-api.ts` (2), `app/globals.css` (13), `app/layout.tsx` (2), `app/(protected)/layout.tsx` (2), `components/app-switcher.tsx` (25 — gần như URLs), `components/documents/document-preview-dialog.tsx` (2), `contexts/auth-context.tsx` (3). Glossary, chat samples, Q&A có nhiều thuật ngữ quân sự đặc thù — đọc context kỹ.
- `demo-dms` — `lib/mock-data.ts` (14), `lib/auth.ts` (6), `app/globals.css` (13), `components/dashboard/documents-chart.tsx` (8), `components/dashboard/data-classification.tsx` (1), `components/dashboard/user-dashboard.tsx` (1), `components/app-switcher.tsx` (25), `contexts/auth-context.tsx` (4), `app/login/page.tsx` (1). Document types: Điều lệnh → Quy chế, Mệnh lệnh → Chỉ thị/Quyết định, Văn bản mật → Văn bản nội bộ.

## Cách quét nhanh để biết chỗ nào còn cần sửa

Chạy trong từng module (loại trừ `node_modules`, `AppSwitcher.tsx` URLs, và `package*.json` `name` field):

```bash
grep -rniE "PKKQ|phòng không|không quân|quân chủng|quân đội|quân sự|chiến đấu|khí tài|vũ khí|trang bị|radar|tên lửa|máy bay|sư đoàn|trung đoàn|tiểu đoàn|đại đội|đại tướng|trung tướng|thiếu tướng|đại tá|thượng tá|trung tá|thiếu tá|đại úy|thượng úy|trung úy|thiếu úy|thượng sĩ|trung sĩ|Z11[19]|Z12[5]|Z13[3]|A3[15]|A41|X2[8]|X32|bộ đội|chiến sĩ|quân nhân|SSCĐ|sẵn sàng chiến đấu|không phận|tác chiến|chính ủy|tham mưu trưởng|phiên hiệu|tối mật|tuyệt mật|bộ quốc phòng|bộ tư lệnh|hậu cần" \
  --exclude-dir={node_modules,.git,dist,build,.next} \
  --exclude=AppSwitcher.tsx \
  --exclude=app-switcher.tsx \
  --exclude=package.json \
  --exclude=package-lock.json \
  src/
```

Hoặc dùng grep tool của Claude:
- Pattern: `PKKQ|Phòng Không|Không Quân|Quân chủng|khí tài|chiến đấu|Z119|sư đoàn|trung đoàn|đại tá|thiếu tá|tên lửa|radar|máy bay|bộ đội|chiến sĩ|SSCĐ|tác chiến|chính ủy|hậu cần|Bộ Quốc phòng|Bộ Tư lệnh`
- `-i: true`
- `output_mode: "content"`

## Cách tiếp tục

1. Pull về máy: `git pull origin main`
2. `cd` vào module cần làm tiếp (ưu tiên theo thứ tự: `demo-suachua` → `demo-antoan` → `demo-vongdoi` → `demo-chatbot` → `demo-dms` → các module dư ít).
3. Chạy grep ở trên để lấy danh sách file còn match.
4. Edit từng file theo mapping ở trên.
5. Commit theo từng module nhỏ (vd: `git commit -m "rebrand demo-suachua: data files + ROADMAP"`).

**Có thể nhờ Claude Code chạy lại theo từng module:** copy section "Mapping bắt buộc" + "KHÔNG đổi" + "Phạm vi" ở trên, kèm tên module → giao cho 1 agent mỗi lần. Tránh giao 19 module song song như lần trước (1 vài agent bị truncate khi work load lớn).

## Stack tham khảo

- Module Vite (React + TypeScript + Ant Design 5): `demo-antoan`, `demo-baotri`, `demo-daitu`, `demo-doluong`, `demo-hopdongnhiemvu`, `demo-kho`, `demo-muahang`, `demo-sanxuat`, `demo-sso`, `demo-suachua`, `demo-vongdoi`, `demo-taichinhketoan`
- Module Next.js (App Router + Tailwind/shadcn): `demo-portal`, `demo-chatbot`, `demo-dms`
- Module skeleton (1 file): `demo-chatluong`, `demo-suco`, `demo-thunghiem`

## Logo / file ảnh chưa thay

- `demo-sso/public/bg-sso.jpg` + `demo-sso/image/background SSO.jpg` — ảnh nền hero login (TODO đã ghi trong `demo-sso/src/App.css`).
- `demo-portal/image portal/` + `demo-portal/public/` — chưa kiểm kê hết; agent đã được dặn KHÔNG xóa file ảnh, chỉ note.
- Các module còn lại: logo trong sidebar dùng inline SVG hoặc lucide-react icon (đã thay text "DA" hoặc giữ icon trung tính).

## Repo

- Origin: https://github.com/ductv112/demo
- Branch: `main`
- Commit khởi tạo: `b2947f6` (1042 files, đã exclude `node_modules`)
