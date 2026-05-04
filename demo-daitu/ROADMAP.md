# ROADMAP - Quản lý Đại tu (pkkq-daitu)

> Phần mềm #10 trong hệ thống 16 phần mềm Doanh nghiệp A
> Tham chiếu cấu trúc từ `pkkq-taichinhketoan`
> Domain: `localhost:5182`

---

## Tổng quan hệ thống

Quản lý toàn bộ quy trình đại tu thiết bị / hệ thống / sản phẩm phần mềm tại Trung tâm phần mềm Alpha, từ tiếp nhận đánh giá, lập kế hoạch, tháo rã, kiểm tra, phục hồi/thay thế, lắp ráp, thử nghiệm đến truy vết cấu hình sau đại tu.

**8 quy trình nghiệp vụ chính** + Dashboard + Báo cáo + Danh mục

---

## Danh sách Pages & Routes

| # | Page | Route | Mô tả |
|---|------|-------|-------|
| 1 | Dashboard | `/` | Tổng quan KPI, tiến độ, thống kê đại tu |
| 2 | OverhaulReception | `/overhaul-receptions` | DS tiếp nhận & đánh giá tổng thể |
| 3 | OverhaulReceptionDetail | `/overhaul-receptions/:id` | Chi tiết hồ sơ tiếp nhận |
| 4 | OverhaulOrder | `/overhaul-orders` | DS lệnh đại tu & kế hoạch |
| 5 | OverhaulOrderDetail | `/overhaul-orders/:id` | Chi tiết lệnh đại tu |
| 6 | Disassembly | `/disassemblies` | DS tháo rã & quản lý cấu phần |
| 7 | DisassemblyDetail | `/disassemblies/:id` | Chi tiết phiên tháo rã |
| 8 | TechnicalInspection | `/technical-inspections` | DS kiểm tra & đánh giá kỹ thuật |
| 9 | TechnicalInspectionDetail | `/technical-inspections/:id` | Chi tiết kiểm tra kỹ thuật |
| 10 | Restoration | `/restorations` | DS phục hồi, thay thế & nâng cấp |
| 11 | RestorationDetail | `/restorations/:id` | Chi tiết xử lý cấu phần |
| 12 | Assembly | `/assemblies` | DS lắp ráp & hiệu chỉnh |
| 13 | AssemblyDetail | `/assemblies/:id` | Chi tiết lắp ráp |
| 14 | TestAcceptance | `/test-acceptances` | DS thử nghiệm & nghiệm thu |
| 15 | TestAcceptanceDetail | `/test-acceptances/:id` | Chi tiết thử nghiệm |
| 16 | Traceability | `/traceability` | Truy vết & cấu hình sau đại tu |
| 17 | TraceabilityDetail | `/traceability/:id` | Chi tiết truy vết thiết bị |
| 18 | Reports | `/reports` | Báo cáo đại tu (31 loại) |
| 19 | Categories | `/categories/*` | Danh mục (thiết bị, đơn vị, vật tư...) |

---

## Phân pha triển khai

### Phase 1: Nền tảng & Khung dự án
> Khởi tạo project, thiết lập cấu trúc, theme, layout, routing

| Task | File/Thư mục | Trạng thái |
|------|-------------|-----------|
| Khởi tạo Vite + React 19 + TypeScript | `package.json`, `vite.config.ts`, `tsconfig.json` | [ ] |
| Cấu hình theme Ant Design (palette chung) | `src/theme/themeConfig.ts` | [ ] |
| Tạo MainLayout (sidebar + header) | `src/layouts/MainLayout.tsx` | [ ] |
| Tạo UserContext (3 roles) | `src/contexts/UserContext.tsx` | [ ] |
| Định nghĩa TypeScript interfaces | `src/types/index.ts` | [ ] |
| Tạo utils (format, statusConfig) | `src/utils/format.ts` | [ ] |
| Cấu hình Router + App.tsx | `src/App.tsx` | [ ] |
| Global CSS + App.css | `src/index.css`, `src/App.css` | [ ] |
| CI/CD files (copy từ taichinhketoan) | `.gitlab-ci.yml`, `Dockerfile`, `nginx.conf` | [ ] |

---

### Phase 2: Dashboard
> Trang tổng quan với KPI cards, biểu đồ, bảng tóm tắt

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data tổng quan | `src/data/dashboard.ts` — số liệu KPI, thống kê | [ ] |
| Stat Cards (KPI) | Tổng lệnh đại tu, Đang thực hiện, Hoàn thành, Chậm tiến độ | [ ] |
| Biểu đồ tiến độ đại tu | Pie/Bar chart trạng thái lệnh đại tu | [ ] |
| Biểu đồ theo trung tâm | Bar chart khối lượng công việc PX1-PX4 | [ ] |
| Bảng lệnh đại tu gần đây | Table top 5-10 lệnh mới nhất | [ ] |
| Cảnh báo & thông báo | Chậm tiến độ, thiếu vật tư, chờ nghiệm thu | [ ] |
| Timeline tiến độ | Gantt-like hoặc Steps cho lệnh đang chạy | [ ] |

---

### Phase 3: Tiếp nhận & Đánh giá tổng thể
> Quy trình 1: Tiếp nhận thiết bị, đánh giá kỹ thuật, xác định phạm vi đại tu

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data tiếp nhận | `src/data/overhaulReceptions.ts` | [ ] |
| Trang danh sách OverhaulReception | Bảng + filter theo trạng thái, thiết bị, đơn vị gửi | [ ] |
| Trang chi tiết OverhaulReceptionDetail | Thông tin thiết bị, hồ sơ kỹ thuật, kết quả đánh giá | [ ] |
| Tab: Thông tin thiết bị | Loại, serial, đơn vị gửi, số giờ vận hành | [ ] |
| Tab: Kiểm tra ban đầu | Checklist kiểm tra ngoại quan, rò rỉ, biến dạng | [ ] |
| Tab: Đánh giá hao mòn | Bảng đánh giá từng cụm, mức độ hao mòn | [ ] |
| Tab: Phạm vi & định tuyến | Phạm vi đại tu, phân loại cấp đại tu | [ ] |

**Trạng thái**: `Chờ tiếp nhận` → `Đang đánh giá` → `Đã đánh giá` → `Chờ lập kế hoạch`

---

### Phase 4: Lập kế hoạch & Lệnh đại tu
> Quy trình 2: Phương án đại tu, hạng mục công việc, vật tư, nhân lực, thời gian

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data lệnh đại tu | `src/data/overhaulOrders.ts` | [ ] |
| Mock data công đoạn | `src/data/workStages.ts` | [ ] |
| Mock data vật tư | `src/data/materials.ts` | [ ] |
| Trang danh sách OverhaulOrder | Bảng + filter theo trạng thái, thiết bị, trung tâm | [ ] |
| Trang chi tiết OverhaulOrderDetail | Toàn bộ thông tin lệnh đại tu | [ ] |
| Tab: Phương án tổng thể | Chiến lược, mức độ can thiệp từng cụm | [ ] |
| Tab: Hạng mục & công đoạn | Bảng các bước: tháo rã → kiểm tra → phục hồi → lắp ráp → thử nghiệm | [ ] |
| Tab: Vật tư & linh kiện | Danh mục vật tư cần, bắt buộc thay, tiêu hao | [ ] |
| Tab: Nhân lực | Phân công đội KTV, chuyên gia, phân ca | [ ] |
| Tab: Kế hoạch thời gian | Timeline/Gantt các công đoạn, tổng thời gian | [ ] |

**Trạng thái**: `Nháp` → `Chờ duyệt` → `Đã duyệt` → `Đang thực hiện` → `Hoàn thành` → `Đã đóng`

---

### Phase 5: Tháo rã & Quản lý cấu phần
> Quy trình 3: Tháo rã theo tiêu chuẩn, đánh dấu, phân loại, quản lý cấu phần

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data tháo rã | `src/data/disassemblies.ts` | [ ] |
| Mock data cấu phần | `src/data/components.ts` | [ ] |
| Trang danh sách Disassembly | Bảng phiên tháo rã theo lệnh đại tu | [ ] |
| Trang chi tiết DisassemblyDetail | Tiến trình tháo rã, danh sách cấu phần | [ ] |
| Tab: Trình tự tháo rã | Steps theo thứ tự kỹ thuật | [ ] |
| Tab: Danh sách cấu phần | Bảng cấu phần đã tháo, mã, vị trí, trạng thái | [ ] |
| Tab: Phân loại cấu phần | Theo hệ thống (nhiên liệu, đánh lửa...), theo loại (mô-đun, linh kiện) | [ ] |

**Trạng thái cấu phần**: `Đã tháo rã` → `Chờ kiểm tra` → `Đang kiểm tra` → `Đã phân loại`

---

### Phase 6: Kiểm tra & Đánh giá kỹ thuật
> Quy trình 4: Kiểm tra NDT, đo kiểm, so sánh giới hạn, xác định hướng xử lý

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data kiểm tra | `src/data/technicalInspections.ts` | [ ] |
| Trang danh sách TechnicalInspection | Bảng yêu cầu kiểm tra, kết quả | [ ] |
| Trang chi tiết TechnicalInspectionDetail | Chi tiết kiểm tra từng cấu phần | [ ] |
| Tab: Yêu cầu kiểm tra | Loại kiểm tra cần cho từng cấu phần | [ ] |
| Tab: Kết quả kiểm tra | Số đo, so sánh giới hạn, đạt/không đạt | [ ] |
| Tab: Hướng xử lý | Giữ lại / Phục hồi / Thay mới / Nâng cấp | [ ] |
| Liên kết phân hệ | Badge hiển thị yêu cầu gửi sang QC, Đo lường | [ ] |

**Hướng xử lý**: `Đạt - Giữ lại` | `Hỏng nhẹ - Phục hồi` | `Vượt giới hạn - Thay mới` | `Nâng cấp`

---

### Phase 7: Phục hồi, Thay thế & Nâng cấp
> Quy trình 5: Xử lý cấu phần theo kết quả đánh giá

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data phục hồi | `src/data/restorations.ts` | [ ] |
| Trang danh sách Restoration | Bảng cấu phần theo nhóm xử lý | [ ] |
| Trang chi tiết RestorationDetail | Chi tiết xử lý từng cấu phần | [ ] |
| Tab: Phục hồi | Làm sạch, gia công, hàn, mạ, chống ăn mòn | [ ] |
| Tab: Thay thế | Linh kiện bắt buộc thay, hư hỏng, vượt giới hạn | [ ] |
| Tab: Nâng cấp | Phiên bản mới, cải tiến thiết kế | [ ] |
| Tab: Ghi nhận kết quả | Phương pháp, linh kiện đã thay, trạng thái mới | [ ] |

**Trạng thái**: `Chờ xử lý` → `Đang phục hồi` / `Đang thay thế` / `Đang nâng cấp` → `Sẵn sàng lắp ráp`

---

### Phase 8: Lắp ráp, Hiệu chỉnh & Kiểm soát kỹ thuật
> Quy trình 6: Lắp ráp lại, kiểm soát mô-men, khe hở, hiệu chỉnh thông số

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data lắp ráp | `src/data/assemblies.ts` | [ ] |
| Trang danh sách Assembly | Bảng phiên lắp ráp theo lệnh đại tu | [ ] |
| Trang chi tiết AssemblyDetail | Chi tiết quy trình lắp ráp | [ ] |
| Tab: Chuẩn bị lắp ráp | Kiểm tra đầy đủ cấu phần, dụng cụ | [ ] |
| Tab: Lắp ráp & kiểm soát | Trình tự lắp, mô-men siết, khe hở, dung sai | [ ] |
| Tab: Hiệu chỉnh | Căn chỉnh, cân bằng, thông số vận hành | [ ] |
| Tab: Ghi nhận | Lực siết, cấu hình lắp, người thực hiện | [ ] |

**Trạng thái**: `Chuẩn bị` → `Đang lắp ráp` → `Đang hiệu chỉnh` → `Chờ thử nghiệm`

---

### Phase 9: Thử nghiệm chức năng & Nghiệm thu
> Quy trình 7: Thử nghiệm trên bệ thử, nghiệm thu, bàn giao

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data thử nghiệm | `src/data/testAcceptances.ts` | [ ] |
| Trang danh sách TestAcceptance | Bảng thử nghiệm & kết quả nghiệm thu | [ ] |
| Trang chi tiết TestAcceptanceDetail | Chi tiết thử nghiệm thiết bị | [ ] |
| Tab: Chuẩn bị thử nghiệm | Kịch bản, bệ thử, thông số cần đo | [ ] |
| Tab: Kết quả thử nghiệm | Công suất, rò rỉ, thông số vận hành, đạt/không đạt | [ ] |
| Tab: Nghiệm thu | So sánh tiêu chuẩn, phê duyệt, ký nghiệm thu | [ ] |
| Tab: Xử lý không đạt | Nguyên nhân, quay lại bước trước, thử lại | [ ] |
| Tab: Bàn giao | Đơn vị nhận, trạng thái sẵn sàng, đóng lệnh | [ ] |

**Trạng thái**: `Chờ thử nghiệm` → `Đang thử nghiệm` → `Đạt` / `Không đạt` → `Đã bàn giao`

---

### Phase 10: Truy vết & Cấu hình sau đại tu
> Quy trình 8: Lịch sử đại tu, cấu hình thiết bị, thay đổi kỹ thuật, đồng bộ phân hệ

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Mock data truy vết | `src/data/traceability.ts` | [ ] |
| Trang danh sách Traceability | Bảng thiết bị đã đại tu, lịch sử | [ ] |
| Trang chi tiết TraceabilityDetail | Chi tiết truy vết thiết bị | [ ] |
| Tab: Lịch sử đại tu | Timeline các lần đại tu, phạm vi, kết quả | [ ] |
| Tab: Cấu hình sau đại tu | Mô-đun/linh kiện hiện tại, phiên bản | [ ] |
| Tab: Thay đổi kỹ thuật | Tiêu chuẩn mới, cải tiến, thay đổi vật liệu | [ ] |
| Tab: Truy vết cấu phần | Liên kết linh kiện → hồ sơ đại tu → vòng đời | [ ] |
| Tab: Đồng bộ phân hệ | Trạng thái đồng bộ: Tài chính, Vòng đời, Bảo trì | [ ] |

---

### Phase 11: Báo cáo
> 31 báo cáo chia theo 7 nhóm

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Trang Reports | Layout tabs/cards cho 7 nhóm báo cáo | [ ] |
| **Nhóm 1: Tiến độ** | | |
| — Báo cáo tiến độ đại tu | Tổng quan tiến độ tất cả lệnh | [ ] |
| — Báo cáo trạng thái lệnh đại tu | Phân bổ theo trạng thái | [ ] |
| — Báo cáo thời gian thực hiện | So sánh kế hoạch vs thực tế | [ ] |
| — Báo cáo chậm tiến độ | Danh sách lệnh chậm, nguyên nhân | [ ] |
| **Nhóm 2: Cấu phần** | | |
| — Báo cáo trạng thái cấu phần sau tháo rã | Thống kê theo trạng thái | [ ] |
| — Báo cáo phân loại cấu phần | Theo hệ thống, loại, nhóm | [ ] |
| — Báo cáo kết quả kiểm tra kỹ thuật | Đạt/không đạt, hướng xử lý | [ ] |
| **Nhóm 3: Phục hồi & Thay thế** | | |
| — Báo cáo danh sách linh kiện phục hồi | Linh kiện đã phục hồi | [ ] |
| — Báo cáo danh sách linh kiện thay thế | Linh kiện đã thay | [ ] |
| — Báo cáo danh mục linh kiện bắt buộc thay | Theo quy định kỹ thuật | [ ] |
| **Nhóm 4: Lắp ráp & Hiệu chỉnh** | | |
| — Báo cáo kết quả hiệu chỉnh | Thông số đã hiệu chỉnh | [ ] |
| — Báo cáo thông số lắp ráp | Mô-men, khe hở, dung sai | [ ] |
| — Báo cáo lỗi phát sinh trong đại tu | Lỗi theo công đoạn | [ ] |
| **Nhóm 5: Thử nghiệm & Nghiệm thu** | | |
| — Báo cáo kết quả thử nghiệm chức năng | Công suất, thông số | [ ] |
| — Báo cáo thông số vận hành sau đại tu | So sánh trước/sau | [ ] |
| — Báo cáo kết quả nghiệm thu | Đạt/không đạt tổng hợp | [ ] |
| — Báo cáo thiết bị không đạt sau thử nghiệm | Danh sách + nguyên nhân | [ ] |
| **Nhóm 6: Vật tư & Chi phí** | | |
| — Báo cáo vật tư sử dụng trong đại tu | Tổng hợp vật tư theo lệnh | [ ] |
| — Báo cáo tiêu hao vật tư | So sánh định mức vs thực tế | [ ] |
| — Báo cáo linh kiện thay thế theo thiết bị | Thống kê theo từng thiết bị | [ ] |
| — Báo cáo chi phí đại tu theo thiết bị | Chi phí từng lệnh | [ ] |
| — Báo cáo chi phí vật tư | Tổng chi phí vật tư | [ ] |
| — Báo cáo chi phí nhân công | Tổng chi phí nhân công | [ ] |
| — Báo cáo tổng chi phí đại tu | Tổng hợp tất cả chi phí | [ ] |
| — Báo cáo so sánh chi phí KH và thực tế | Kế hoạch vs thực tế | [ ] |
| **Nhóm 7: Truy vết & Vòng đời** | | |
| — Báo cáo lịch sử đại tu thiết bị | Timeline đại tu từng thiết bị | [ ] |
| — Báo cáo thay đổi cấu hình sau đại tu | Trước/sau đại tu | [ ] |
| — Báo cáo truy vết linh kiện | Linh kiện → nguồn gốc → lệnh đại tu | [ ] |
| — Báo cáo vòng đời cấu phần | Tuổi thọ, số lần phục hồi | [ ] |
| — Báo cáo hiệu quả đại tu | KPI hiệu quả tổng hợp | [ ] |
| — Báo cáo tỷ lệ đạt ngay lần đầu | First-pass yield | [ ] |
| — Báo cáo lỗi lặp lại sau đại tu | Recurring defects | [ ] |

---

### Phase 12: Danh mục & Dữ liệu nền
> Master data dùng chung trong toàn hệ thống

| Task | Chi tiết | Trạng thái |
|------|---------|-----------|
| Danh mục thiết bị | Hệ thống monitoring, module, hệ thống truyền thông — loại, model, thông số | [ ] |
| Danh mục đơn vị | Khối, Phòng / Trung tâm gửi thiết bị | [ ] |
| Danh mục trung tâm | PX1-PX4, năng lực, chuyên môn | [ ] |
| Danh mục loại đại tu | Cấp xưởng, chuyên sâu, ưu tiên | [ ] |
| Danh mục vật tư & linh kiện | Mã, tên, nhóm, nhà cung cấp | [ ] |
| Danh mục loại kiểm tra | NDT, đo kiểm, kiểm tra bề mặt... | [ ] |
| Danh mục tiêu chuẩn kỹ thuật | Giới hạn kỹ thuật, dung sai | [ ] |

---

## Cấu trúc Mock Data chính

| File | Nội dung | Entities |
|------|---------|----------|
| `overhaulReceptions.ts` | Hồ sơ tiếp nhận thiết bị | ~8-10 records |
| `overhaulOrders.ts` | Lệnh đại tu | ~8-10 records |
| `workStages.ts` | Công đoạn theo lệnh | ~30-40 records |
| `materials.ts` | Vật tư & linh kiện | ~20-30 records |
| `components.ts` | Cấu phần sau tháo rã | ~40-50 records |
| `disassemblies.ts` | Phiên tháo rã | ~8-10 records |
| `technicalInspections.ts` | Kết quả kiểm tra | ~30-40 records |
| `restorations.ts` | Xử lý cấu phần | ~30-40 records |
| `assemblies.ts` | Phiên lắp ráp | ~8-10 records |
| `testAcceptances.ts` | Thử nghiệm & nghiệm thu | ~8-10 records |
| `traceability.ts` | Lịch sử & cấu hình | ~8-10 records |
| `departments.ts` | Phòng ban Trung tâm Alpha | 11 records |
| `equipment.ts` | Danh mục thiết bị | ~15-20 records |
| `alerts.ts` | Cảnh báo hệ thống | ~10-15 records |

---

## TypeScript Interfaces chính (src/types/index.ts)

```
OverhaulReception    — Hồ sơ tiếp nhận & đánh giá
OverhaulOrder        — Lệnh đại tu (Work Order)
WorkStage            — Công đoạn trong lệnh đại tu
Equipment            — Thiết bị / Hệ thống
Component            — Cấu phần / Linh kiện
DisassemblyRecord    — Phiên tháo rã
InspectionResult     — Kết quả kiểm tra kỹ thuật
RestorationRecord    — Hồ sơ phục hồi/thay thế/nâng cấp
AssemblyRecord       — Phiên lắp ráp & hiệu chỉnh
TestAcceptance       — Thử nghiệm & nghiệm thu
TraceabilityRecord   — Truy vết & cấu hình sau đại tu
Material             — Vật tư, linh kiện
Department           — Phòng ban / Trung tâm
Personnel            — Nhân sự kỹ thuật
Alert                — Cảnh báo hệ thống
```

---

## Sidebar Menu

```
Dashboard                           /
─────────────────────────────────
TIẾP NHẬN & KẾ HOẠCH
  Tiếp nhận đánh giá               /overhaul-receptions
  Lệnh đại tu                      /overhaul-orders
─────────────────────────────────
THỰC HIỆN ĐẠI TU
  Tháo rã & Cấu phần               /disassemblies
  Kiểm tra kỹ thuật                 /technical-inspections
  Phục hồi & Thay thế              /restorations
  Lắp ráp & Hiệu chỉnh            /assemblies
─────────────────────────────────
NGHIỆM THU & TRUY VẾT
  Thử nghiệm & Nghiệm thu         /test-acceptances
  Truy vết & Cấu hình              /traceability
─────────────────────────────────
BÁO CÁO & DANH MỤC
  Báo cáo                           /reports
  Danh mục                          /categories
```

---

## Luồng nghiệp vụ tổng thể

```
Tiếp nhận thiết bị ──→ Đánh giá tổng thể ──→ Lập kế hoạch ──→ Lệnh đại tu
                                                                     │
        ┌────────────────────────────────────────────────────────────┘
        ▼
    Tháo rã ──→ Phân loại cấu phần ──→ Kiểm tra kỹ thuật
                                              │
                    ┌─────────────┬────────────┼────────────┐
                    ▼             ▼            ▼            ▼
                Giữ lại     Phục hồi     Thay mới     Nâng cấp
                    │             │            │            │
                    └─────────────┴────────────┴────────────┘
                                        │
                                        ▼
                    Lắp ráp ──→ Hiệu chỉnh ──→ Kiểm soát KT
                                                      │
                                                      ▼
                    Thử nghiệm ──→ Nghiệm thu ──→ Bàn giao
                         │                            │
                         ▼                            ▼
                    Không đạt?               Đóng lệnh đại tu
                    → Quay lại                        │
                                                      ▼
                                    Truy vết & Cấu hình sau đại tu
                                              │
                                    ┌─────────┼──────────┐
                                    ▼         ▼          ▼
                               Tài chính  Vòng đời   Bảo trì
                               Kế toán    Cấu hình   Sửa chữa
```

---

## Ghi chú triển khai

- **Thứ tự build**: Phase 1 → 2 → 3 → 4 → ... → 12 (tuần tự theo luồng nghiệp vụ)
- **Tham chiếu**: Copy pattern từ `pkkq-taichinhketoan` cho layout, theme, stat cards, table, status tags
- **Mock data**: Ngữ cảnh Trung tâm phần mềm Alpha, hệ thống monitoring P-18/36D6/P-37/ST-68, module S-75/S-125/S-300PMU
- **Locale**: Toàn bộ tiếng Việt, `viVN` locale, ngày `DD/MM/YYYY`
- **Build check**: `npm run build` phải pass trước khi push
- **Branch**: Commit vào `develop`, không commit trực tiếp `main`
