# Demo workspace — context cho Claude Code

Workspace này chứa 19 demo modules dùng để chạy prototype cho khách hàng doanh nghiệp. Mỗi module là một app React/Next.js độc lập (Vite hoặc Next.js).

## Bối cảnh

**Nhiệm vụ:** Rebrand toàn bộ mockdata + UI text từ chủ đề Quân đội PKKQ (Phòng Không – Không Quân) sang doanh nghiệp generic **"Doanh nghiệp A"** — công ty công nghệ (sản xuất + cung ứng phần mềm).

**Trạng thái: HOÀN TẤT.** Toàn bộ 19 module đã sạch user-visible military terminology. Lịch sử commit:
- `b2947f6` — Initial 1042 files (partial rebrand)
- `6277e38` — Add CLAUDE.md
- `53e51eb` — Wave 1 (demo-suachua, demo-antoan, demo-vongdoi)
- `06f2b4f` — Wave 2 (demo-chatbot, demo-dms)
- `bcfcf49` — Wave 3+4 (demo-daitu, demo-sanxuat, demo-taichinhketoan, sweep)

**Match còn lại (đều intentional):**
- AppSwitcher URLs `pkkq-*-staging.dft.vn` — DNS staging thật, KHÔNG đổi
- `package.json` field `name` (vd `pkkq-suachua`) — KHÔNG đổi
- TS type literals `'radar' | 'missile'`, `'pkkq-suachua' | 'pkkq-daitu'` — KHÔNG đổi
- Code identifier values: `unitId: 'Z119'`, `equipmentCode: 'RADAR-001'`, `source: 'pkkq-daitu'` — KHÔNG đổi
- CSS variables `--pkkq-*`, CSS classes `.pkkq-*`, TS exports `PKKQ_CHART_COLORS`, function/interface `PkkqTooltip` — KHÔNG đổi
- localStorage keys `pkkq_authenticated` / `pkkq_remember_me` — KHÔNG đổi
- File `pkkq-tooltip.tsx`, `chart-theme.ts` — KHÔNG đổi
- `Đối tác chiến lược` (strategic partner) trong demo-muahang — false positive `tác chiến`, đã rebrand từ "military supplier" → giữ
- Bilingual comment `// Khí tài / Thiết bị` (rất ít chỗ) — comment, không user-visible

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
- **AppSwitcher URLs** giờ trỏ về `http://localhost:PORT` (xem [§ Port mapping](#port-mapping-localhost-demo) bên dưới). Cross-module navigation chạy được khi tất cả module dev server cùng chạy.
- **Số tài khoản kế toán VAS** (111, 112, 511...) trong `demo-taichinhketoan`
- **"Đơn vị" trong context "đơn vị đo"** (kg, m, V, A) — giữ trong `demo-doluong`, `demo-kho`
- **"Đơn vị tính"** (Cái, Bộ, Lít) trong kho — giữ

CHỈ đổi NỘI DUNG STRING mà người dùng nhìn thấy.

## Port mapping (localhost demo)

Mỗi module bind 1 port riêng (đã set sẵn trong `vite.config.ts` với Vite, hoặc `package.json` script với Next.js). Chạy `npm run dev` trong từng module → server lên đúng port. AppSwitcher điều hướng cross-module qua các URL `http://localhost:<PORT>`.

| Module | Port | Stack |
|---|---|---|
| `demo-portal` | 3000 | Next.js |
| `demo-dms` | 3010 | Next.js |
| `demo-chatbot` | 3011 | Next.js |
| `demo-sso` | 5173 | Vite |
| (`dieuhanhbi` — không có thư mục, chỉ link ngoài) | 5174 | — |
| `demo-taichinhketoan` | 5175 | Vite |
| `demo-hopdongnhiemvu` | 5176 | Vite |
| `demo-muahang` | 5177 | Vite |
| `demo-kho` | 5178 | Vite |
| `demo-sanxuat` | 5179 | Vite |
| `demo-baotri` | 5180 | Vite |
| `demo-suachua` | 5181 | Vite |
| `demo-daitu` | 5182 | Vite |
| `demo-vongdoi` | 5183 | Vite |
| `demo-chatluong` | 5184 | Vite (skeleton — chỉ AppSwitcher) |
| `demo-suco` | 5185 | Vite (skeleton) |
| `demo-thunghiem` | 5186 | Vite (skeleton) |
| `demo-doluong` | 5187 | Vite |
| `demo-antoan` | 5188 | Vite |

CMS subroute: `http://localhost:3000/cms` (sub-route trong `demo-portal`).

## Phạm vi cần quét

- File `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.html`, `.css`
- Mockdata (`src/data/`, `src/lib/mock-data.ts`, `src/lib/*-api.ts`)
- UI text: layout, sidebar, header, page titles, components, placeholder, tooltip, button text, error/empty state
- HTML `<title>`, meta description
- README.md, ROADMAP.md
- `package.json` field `description` (KHÔNG đổi `name`)
- Logo/favicon: file ảnh comment TODO; SVG inline đổi thành "DA"

## Trạng thái từng module

**TẤT CẢ 19 MODULE ĐÃ SẠCH** user-visible military terminology (verify cuối: 0 match cho mọi keyword quân sự, ngoại trừ các identifier intentional và 1 false-positive "Đối tác chiến lược" trong demo-muahang).

| Module | Stack | Branding | Notes |
|---|---|---|---|
| `demo-portal` | Next.js | Hệ thống quản trị Doanh nghiệp A | Hub/landing |
| `demo-sso` | Vite + AntD | DOANH NGHIỆP A | Còn file ảnh `public/bg-sso.jpg` + `image/background SSO.jpg` (TODO trong App.css) |
| `demo-doluong` | Vite + AntD | Doanh nghiệp A | Đo lường chất lượng phần mềm / KPI |
| `demo-kho` | Vite + AntD | Doanh nghiệp A | Kho IT asset / license |
| `demo-sanxuat` | Vite + AntD | Trung tâm Phần mềm Alpha | Phát triển phần mềm / DevOps |
| `demo-taichinhketoan` | Vite + AntD | Doanh nghiệp A | Finance & accounting (giữ TK VAS) |
| `demo-daitu` | Vite + AntD | Doanh nghiệp A | Đại tu hệ thống / major upgrade |
| `demo-baotri` | Vite + AntD | Doanh nghiệp A | Bảo trì hệ thống / server |
| `demo-suachua` | Vite + AntD | Doanh nghiệp A | Khắc phục sự cố / sửa chữa thiết bị |
| `demo-antoan` | Vite + AntD | Doanh nghiệp A | An toàn / IT Security |
| `demo-vongdoi` | Vite + AntD | Doanh nghiệp A | SDLC sản phẩm phần mềm |
| `demo-muahang` | Vite + AntD | Doanh nghiệp A | IT Procurement |
| `demo-hopdongnhiemvu` | Vite + AntD | Doanh nghiệp A | Hợp đồng dự án / SOW |
| `demo-chatbot` | Next.js | Doanh nghiệp A | Chatbot AI doanh nghiệp |
| `demo-dms` | Next.js | Doanh nghiệp A | Document Management System |
| `demo-chatluong` / `demo-suco` / `demo-thunghiem` | Vite + AntD | (skeleton) | Chỉ có 1 file `AppSwitcher.tsx` mỗi module — không có nghiệp vụ |

### File ảnh chưa thay (không phá build, có thể thay sau bằng tay)
- `demo-sso/public/bg-sso.jpg` + `demo-sso/image/background SSO.jpg` — ảnh nền hero login (TODO trong `App.css`)
- `demo-portal/image portal/` + `demo-portal/public/` — chưa kiểm kê hết; agent KHÔNG xóa file ảnh

### Các module còn lại
Logo trong sidebar dùng inline SVG hoặc lucide-react icon (đã thay text "DA" hoặc giữ icon trung tính).

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

## Nếu tìm thấy chỗ sót

Rebrand đã hoàn tất nhưng nếu phát hiện chỗ sót:

1. Pull về máy: `git pull origin main`
2. Chạy grep ở trên trong module nghi ngờ.
3. Phân biệt: nếu là code identifier (variable name, type literal, file name, CSS var, package name, AppSwitcher URL, equipmentCode data ID) — KHÔNG đổi. Nếu là user-visible text — đổi theo mapping table.
4. Edit + commit nhỏ.

**Lessons learned từ session đầu tiên:** Tránh giao >5 module song song cho agent — vài agent bị truncate khi load nặng. Wave 3-5 module / lần là an toàn.

## Repo

- Origin: https://github.com/ductv112/demo
- Branch: `main`
- Commits: `b2947f6` (init) → `6277e38` (CLAUDE.md) → `53e51eb` (W1) → `06f2b4f` (W2) → `bcfcf49` (W3+W4)
