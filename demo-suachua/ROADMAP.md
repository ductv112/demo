# ROADMAP - Phần mềm Quản lý Sửa chữa (pkkq-suachua)

> Phần mềm #9 trong hệ thống 16 phần mềm Doanh nghiệp A
> Đơn vị demo: **Doanh nghiệp A**
> Tham chiếu: `pkkq-taichinhketoan`

---

## Tổng quan nghiệp vụ

Hệ thống Quản lý Sửa chữa quản lý toàn bộ quy trình sửa chữa thiết bị, hệ thống công nghệ tại Doanh nghiệp A, từ tiếp nhận yêu cầu đến bàn giao và theo dõi hiệu quả.

### 6 nhóm quy trình chính

| # | Quy trình | Mô tả |
|---|-----------|-------|
| 1 | Tiếp nhận & Phân loại | Tiếp nhận thiết bị, ghi nhận tình trạng, phân loại sửa chữa (nhỏ/vừa/hiện trường) |
| 2 | Tiếp nhận kết quả chẩn đoán | Nhận kết luận kỹ thuật từ phân hệ Sự cố & Chẩn đoán |
| 3 | Lập lệnh & Kế hoạch | Lập lệnh sửa chữa, phân công nhân lực, lập lịch, chuẩn bị vật tư |
| 4 | Thực hiện sửa chữa | Thực hiện theo công đoạn, thay thế/phục hồi linh kiện, ghi nhận quá trình |
| 5 | Kiểm tra, nghiệm thu & Bàn giao | Kiểm tra kỹ thuật, thử nghiệm, nghiệm thu, bàn giao đơn vị |
| 6 | Ghi nhận, theo dõi & Cải tiến | Chi phí, lịch sử, hiệu quả, xu hướng, đề xuất cải tiến |

---

## Kiến trúc kỹ thuật

- **Tech stack**: React 19 + TypeScript 5.9 + Vite 7 + Ant Design 5
- **Theme**: Navy Primary `#1B3A5C`, Gold Accent `#D4A843`
- **Layout**: Sidebar (260px) + Header (56px) + Content
- **Badge sidebar**: `SC` - Quản lý Sửa chữa
- **Domain staging**: `localhost:5181`
- **3 roles**: Kỹ thuật (repair), Phòng ban (department), Ban Giám đốc (director)

---

## Cấu trúc thư mục

```
pkkq-suachua/
├── .gitlab-ci.yml
├── .gitlab/
│   └── auto-deploy-values.yaml
├── Dockerfile
├── nginx.conf
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── index.css
    ├── theme/
    │   └── themeConfig.ts
    ├── types/
    │   └── index.ts
    ├── contexts/
    │   └── UserContext.tsx
    ├── layouts/
    │   └── MainLayout.tsx
    ├── utils/
    │   └── format.ts
    ├── data/
    │   ├── departments.ts
    │   ├── repairRequests.ts
    │   ├── diagnosticResults.ts
    │   ├── workOrders.ts
    │   ├── repairTasks.ts
    │   ├── materials.ts
    │   ├── inspections.ts
    │   ├── repairHistory.ts
    │   └── alerts.ts
    └── pages/
        ├── Dashboard/index.tsx
        ├── RepairReception/index.tsx
        ├── DiagnosticResults/index.tsx
        ├── WorkOrders/index.tsx
        ├── WorkOrderDetail/index.tsx
        ├── RepairExecution/index.tsx
        ├── RepairExecutionDetail/index.tsx
        ├── Inspection/index.tsx
        ├── Handover/index.tsx
        ├── RepairHistory/index.tsx
        ├── CostTracking/index.tsx
        ├── Reports/index.tsx
        ├── Monitoring/index.tsx
        └── Approvals/
            └── WorkOrderApproval.tsx
```

---

## Danh sách Pages & Phân kỳ triển khai

### Phase 1: Nền tảng (Foundation)

| # | Task | File | Mô tả |
|---|------|------|-------|
| 1.1 | Project setup | `package.json`, `vite.config.ts`, configs | Khởi tạo project, cài dependencies |
| 1.2 | Theme config | `src/theme/themeConfig.ts` | Ant Design theme theo CLAUDE.md palette |
| 1.3 | TypeScript types | `src/types/index.ts` | Định nghĩa interfaces cho toàn bộ domain |
| 1.4 | User context | `src/contexts/UserContext.tsx` | 3 roles: repair, department, director |
| 1.5 | Main layout | `src/layouts/MainLayout.tsx` | Sidebar + Header + role-based menu |
| 1.6 | Utils & Format | `src/utils/format.ts` | Formatters, status configs |
| 1.7 | Global styles | `src/App.css`, `src/index.css` | CSS base styles |
| 1.8 | App Router | `src/App.tsx`, `src/main.tsx` | Route definitions |
| 1.9 | CI/CD files | `.gitlab-ci.yml`, `Dockerfile`, `nginx.conf` | Copy & adapt từ taichinhketoan |

### Phase 2: Mock Data

| # | Task | File | Mô tả |
|---|------|------|-------|
| 2.1 | Departments | `src/data/departments.ts` | Cơ cấu tổ chức Doanh nghiệp A (dùng chung) |
| 2.2 | Repair Requests | `src/data/repairRequests.ts` | Yêu cầu sửa chữa, phân loại |
| 2.3 | Diagnostic Results | `src/data/diagnosticResults.ts` | Kết quả chẩn đoán từ phân hệ sự cố |
| 2.4 | Work Orders | `src/data/workOrders.ts` | Lệnh sửa chữa, kế hoạch, phân công |
| 2.5 | Repair Tasks | `src/data/repairTasks.ts` | Công việc sửa chữa theo công đoạn |
| 2.6 | Materials | `src/data/materials.ts` | Vật tư, linh kiện sử dụng |
| 2.7 | Inspections | `src/data/inspections.ts` | Kiểm tra, thử nghiệm, nghiệm thu |
| 2.8 | Repair History | `src/data/repairHistory.ts` | Lịch sử sửa chữa, chi phí |
| 2.9 | Alerts | `src/data/alerts.ts` | Cảnh báo: chậm tiến độ, vượt chi phí |

### Phase 3: Trang chính (Core Pages)

| # | Task | Route | Mô tả |
|---|------|-------|-------|
| 3.1 | **Dashboard** | `/` | KPI cards (tổng yêu cầu, đang sửa, hoàn thành, chậm tiến độ) + biểu đồ tiến độ + cảnh báo + lệnh sửa chữa gần đây |
| 3.2 | **Tiếp nhận sửa chữa** | `/repair-reception` | Danh sách yêu cầu tiếp nhận, form tạo mới, phân loại (nhỏ/vừa/hiện trường), chuyển chẩn đoán |
| 3.3 | **Kết quả chẩn đoán** | `/diagnostic-results` | Danh sách kết quả chẩn đoán từ phân hệ sự cố, đối chiếu, xác nhận hướng xử lý |
| 3.4 | **Lệnh sửa chữa** | `/work-orders` | Danh sách Work Orders, tạo lệnh, phân công, lập lịch, trạng thái |
| 3.5 | **Chi tiết lệnh SC** | `/work-orders/:id` | Timeline lệnh SC, danh sách công việc, vật tư, nhân lực, tiến độ |
| 3.6 | **Thực hiện sửa chữa** | `/repair-execution` | Danh sách công việc đang thực hiện, theo công đoạn, ghi nhận tiến độ |
| 3.7 | **Chi tiết thực hiện** | `/repair-execution/:id` | Chi tiết từng công việc, vật tư đã dùng, nhật ký thực hiện |

### Phase 4: Kiểm tra & Bàn giao

| # | Task | Route | Mô tả |
|---|------|-------|-------|
| 4.1 | **Kiểm tra & Nghiệm thu** | `/inspection` | Kết quả kiểm tra chất lượng, thử nghiệm, nghiệm thu |
| 4.2 | **Bàn giao** | `/handover` | Bàn giao thiết bị, đóng lệnh sửa chữa |
| 4.3 | **Phê duyệt lệnh SC** | `/approvals/work-orders` | Director phê duyệt lệnh sửa chữa |

### Phase 5: Theo dõi & Báo cáo

| # | Task | Route | Mô tả |
|---|------|-------|-------|
| 5.1 | **Lịch sử sửa chữa** | `/repair-history` | Lịch sử theo thiết bị, tần suất hỏng, lỗi lặp lại |
| 5.2 | **Theo dõi chi phí** | `/cost-tracking` | Chi phí vật tư, nhân công, theo thiết bị/đơn vị |
| 5.3 | **Giám sát & Cảnh báo** | `/monitoring` | Cảnh báo chậm tiến độ, vượt chi phí, lỗi lặp |
| 5.4 | **Báo cáo** | `/reports` | Tổng hợp 24 loại báo cáo theo nhóm |

---

## TypeScript Domain Models (tóm tắt)

### Core Entities

```
RepairRequest          - Yêu cầu sửa chữa (tiếp nhận)
  Status: received → diagnosing → diagnosed → planning → ready
  Fields: id, code, equipmentId, equipmentName, equipmentType,
          unitName, receivedDate, initialCondition, repairType,
          classification, priority, status

DiagnosticResult       - Kết quả chẩn đoán
  Fields: id, repairRequestId, diagnosis, rootCause,
          affectedComponents, recommendedAction, severity

WorkOrder              - Lệnh sửa chữa
  Status: draft → approved → in_progress → quality_check →
          testing → accepted → handed_over → closed
  Fields: id, code, repairRequestId, repairType, method,
          tasks[], assignedTeam, plannedStart, plannedEnd,
          actualStart, actualEnd, status, totalCost

RepairTask             - Công việc sửa chữa (con của WorkOrder)
  Status: pending → in_progress → completed → failed
  Fields: id, workOrderId, taskName, stage (electronic/mechanical/
          optical/assembly), assignee, materials[], plannedHours,
          actualHours, progress, notes

Material               - Vật tư sửa chữa
  Fields: id, name, code, type, quantity, unit, unitPrice,
          totalPrice, workOrderId, taskId, issuedDate

Inspection             - Kiểm tra & Nghiệm thu
  Status: pending → passed → failed → retesting
  Fields: id, workOrderId, type (quality/testing/acceptance),
          result, inspector, date, notes

RepairHistory          - Lịch sử sửa chữa
  Fields: id, equipmentId, workOrderId, completedDate,
          totalCost, materialCost, laborCost, repairDuration,
          outcome, nextScheduledCheck

Alert                  - Cảnh báo
  Types: overdue, over_budget, recurring_failure, pending_approval
  Severity: critical, warning, info
```

### Enums

```
RepairType:       small | medium | field
RepairStage:      electronic | mechanical | optical | assembly | testing
RepairMethod:     in_place | replacement | restoration | overhaul_transfer
EquipmentType:    radar | missile | communication | electronic
Priority:         critical | high | medium | low
```

---

## User Roles & Menu

### Role: Kỹ thuật (`repair`) — Phòng Kỹ thuật / Trung tâm
- Người demo: **Trần Văn Đức** — Trưởng phòng Kỹ thuật
- Menu: Dashboard, Tiếp nhận SC, Kết quả chẩn đoán, Lệnh SC, Thực hiện SC, Kiểm tra & Nghiệm thu, Bàn giao, Lịch sử SC, Chi phí, Giám sát

### Role: Phòng ban (`department`) — Trung tâm
- Người demo: **Hoàng Minh Tuấn** — Trưởng phòng Kế hoạch
- Menu: Dashboard, Lệnh SC (của đơn vị), Thực hiện SC, Giám sát (cảnh báo liên quan)

### Role: Ban Giám đốc (`director`)
- Người demo: **Phạm Quốc Hưng** — Giám đốc
- Menu: Dashboard, Phê duyệt lệnh SC, Lệnh SC, Chi phí, Giám sát, Báo cáo

---

## Danh sách 24 báo cáo (nhóm theo chức năng)

### Nhóm 1: Tiến độ & Trạng thái
1. Báo cáo tiến độ sửa chữa
2. Báo cáo trạng thái lệnh sửa chữa
3. Báo cáo thời gian thực hiện sửa chữa
4. Báo cáo chậm tiến độ sửa chữa

### Nhóm 2: Tiếp nhận & Phân loại
5. Báo cáo tiếp nhận sửa chữa
6. Báo cáo phân loại sửa chữa
7. Báo cáo kết quả chẩn đoán sự cố
8. Báo cáo phương án xử lý sửa chữa

### Nhóm 3: Thực hiện
9. Báo cáo công việc sửa chữa đã thực hiện
10. Báo cáo vật tư sử dụng trong sửa chữa
11. Báo cáo tiêu hao vật tư sửa chữa
12. Báo cáo linh kiện thay thế

### Nhóm 4: Kiểm tra & Nghiệm thu
13. Báo cáo kết quả kiểm tra sau sửa chữa
14. Báo cáo kết quả thử nghiệm sau sửa chữa
15. Báo cáo nghiệm thu sửa chữa
16. Báo cáo thiết bị không đạt sau sửa chữa

### Nhóm 5: Chi phí
17. Báo cáo chi phí sửa chữa theo thiết bị
18. Báo cáo chi phí vật tư sửa chữa
19. Báo cáo chi phí nhân công sửa chữa

### Nhóm 6: Lịch sử & Hiệu quả
20. Báo cáo lịch sử sửa chữa thiết bị
21. Báo cáo tần suất hỏng theo thiết bị
22. Báo cáo lỗi lặp lại sau sửa chữa
23. Báo cáo hiệu quả sửa chữa
24. Báo cáo tỷ lệ sửa chữa thành công ngay lần đầu

---

## Tiến độ triển khai

| Phase | Trạng thái | Ghi chú |
|-------|-----------|---------|
| Phase 1: Nền tảng | :green_circle: Hoàn thành | 9 tasks - 2026-04-03 |
| Phase 2: Mock Data | :green_circle: Hoàn thành | 9 files - 2026-04-03 |
| Phase 3: Trang chính | :green_circle: Hoàn thành | 7 pages - 2026-04-03 |
| Phase 4: Kiểm tra & Bàn giao | :green_circle: Hoàn thành | 3 pages - 2026-04-03 |
| Phase 5: Theo dõi & Báo cáo | :green_circle: Hoàn thành | 4 pages - 2026-04-03 |

**Tổng cộng: 5 phases, ~32 tasks, 14 pages - BUILD PASSED**

---

## Luồng trạng thái chính

```
Yêu cầu SC:  received → diagnosing → diagnosed → planning → ready

Lệnh SC:     draft → approved → in_progress → quality_check →
              testing → accepted → handed_over → closed
              (có thể rejected ở bước approved)

Công việc:    pending → in_progress → completed | failed

Kiểm tra:    pending → passed | failed → retesting → passed
```

---

## Tích hợp với các phân hệ khác

| Phân hệ | Tương tác |
|----------|-----------|
| pkkq-suco (Sự cố & Chẩn đoán) | Nhận kết quả chẩn đoán, gửi yêu cầu chẩn đoán |
| pkkq-chatluong (Chất lượng QA/QC) | Gửi yêu cầu kiểm tra, nhận kết quả QC |
| pkkq-thunghiem (Thử nghiệm & Nghiệm thu) | Gửi yêu cầu thử nghiệm, nhận kết quả nghiệm thu |
| pkkq-kho (Kho) | Yêu cầu xuất vật tư, linh kiện |
| pkkq-vongdoi (Vòng đời & Cấu hình) | Cập nhật lịch sử sửa chữa thiết bị |
| pkkq-taichinhketoan (Tài chính) | Ghi nhận chi phí sửa chữa |
