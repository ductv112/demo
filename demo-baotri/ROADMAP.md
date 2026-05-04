# ROADMAP - Doanh nghiệp A Quản lý Bảo trì (pkkq-baotri)

> Phần mềm Quản lý Bảo trì - Hệ thống Doanh nghiệp A
> Đơn vị demo: Trung tâm phần mềm Alpha

---

## Tổng quan hệ thống

| Thông tin | Chi tiết |
|---|---|
| **Mã phần mềm** | pkkq-baotri |
| **Tên** | Quản lý Bảo trì |
| **Nhóm** | Thực thi kỹ thuật |
| **Badge** | BT |
| **Domain staging** | localhost:5180 |
| **Tech stack** | React 19 + TypeScript 5.9 + Vite 7 + Ant Design 5 |

---

## Phân hệ nghiệp vụ (9 module + Báo cáo)

### Module 1: Quản lý đội ngũ kỹ thuật bảo trì
- **Trang**: `/maintenance-team`
- **Chức năng**:
  - Khai báo danh sách nhân sự bảo trì (họ tên, mã, đơn vị, chuyên môn, trạng thái)
  - Quản lý năng lực & chuyên môn (loại thiết bị, cấp độ, kinh nghiệm)
  - Quản lý chứng chỉ & điều kiện hành nghề (cảnh báo hết hạn)
  - Tổ chức đội/nhóm bảo trì (cố định, linh hoạt, trưởng nhóm)
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 2: Quản lý quy trình và hướng dẫn bảo trì
- **Trang**: `/procedures`
- **Chức năng**:
  - Xây dựng quy trình bảo trì theo loại thiết bị
  - Checklist & bảng công việc chi tiết
  - Quản lý tài liệu kỹ thuật (PDF, sơ đồ, bản vẽ)
  - Biểu mẫu ghi nhận kết quả
  - Phiên bản hóa quy trình (version control)
  - Kiểm soát tuân thủ quy trình
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 3: Lập kế hoạch và lịch bảo trì
- **Trang**: `/maintenance-plans`
- **Chức năng**:
  - Thu thập nhu cầu bảo trì (định kỳ, phát sinh, cảnh báo)
  - Phân loại & xác định mức độ ưu tiên
  - Kiểm tra nguồn lực (nhân sự, vật tư, lịch sản xuất)
  - Xây dựng kế hoạch tổng thể & lịch chi tiết
  - Phê duyệt & phát hành kế hoạch
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 4: Thực hiện bảo trì định kỳ
- **Trang**: `/scheduled-maintenance`
- **Chức năng**:
  - Tiếp nhận kế hoạch & chuẩn bị
  - Kiểm tra điều kiện, khóa thiết bị (lock-out)
  - Nhận & sử dụng vật tư
  - Thực hiện theo checklist
  - Kiểm tra sau bảo trì, mở khóa, bàn giao
  - Ghi nhận kết quả & hoàn thành
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 5: Thực hiện bảo trì sửa chữa nhỏ
- **Trang**: `/corrective-maintenance`
- **Chức năng**:
  - Tiếp nhận yêu cầu sửa chữa phát sinh
  - Đánh giá & phân loại sự cố
  - Phân công xử lý nhanh
  - Thực hiện sửa chữa & thay thế
  - Kiểm tra, bàn giao & đóng yêu cầu
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 6: Quản lý vật tư bảo trì
- **Trang**: `/spare-parts`
- **Chức năng**:
  - Xác định nhu cầu vật tư từ kế hoạch/yêu cầu
  - Kiểm tra tồn kho (liên kết phân hệ Kho)
  - Yêu cầu cấp phát & xuất kho
  - Ghi nhận sử dụng & hoàn trả dư thừa
  - Đối soát vật tư (cấp - dùng - trả)
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 7: Theo dõi tình trạng và hiệu suất thiết bị
- **Trang**: `/equipment-monitoring`
- **Chức năng**:
  - Thu thập dữ liệu vận hành (nhiệt độ, áp suất, tín hiệu, giờ chạy)
  - Phân tích tình trạng & phát hiện bất thường
  - Cảnh báo tự động khi vượt ngưỡng
  - Đề xuất bảo trì dự phòng
  - Đánh giá hiệu suất (MTBF, MTTR, uptime)
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 8: Quản lý lịch sử bảo trì
- **Trang**: `/maintenance-history`
- **Chức năng**:
  - Lưu trữ lịch sử theo thiết bị & thời gian
  - Truy vết & tra cứu (theo mã thiết bị, loại lỗi, thời gian)
  - Phục vụ kiểm tra nội bộ & đánh giá chất lượng
  - Phân tích tần suất hỏng, xu hướng lỗi
- **Trạng thái**: [ ] Chưa bắt đầu

### Module 9: Đánh giá và cải tiến công tác bảo trì
- **Trang**: `/evaluation`
- **Chức năng**:
  - Thu thập & xây dựng chỉ số KPI (MTBF, MTTR, chi phí)
  - Phân tích hiệu quả theo thời gian, thiết bị, đội
  - Xác định nguyên nhân gốc rễ
  - Đề xuất cải tiến (chu kỳ, quy trình, vật tư)
  - Theo dõi hiệu quả sau cải tiến
- **Trạng thái**: [ ] Chưa bắt đầu

### Báo cáo bảo trì
- **Trang**: `/reports`
- **Danh sách báo cáo**:
  1. Báo cáo kế hoạch và thực hiện bảo trì
  2. Báo cáo lịch sử bảo trì theo thiết bị
  3. Báo cáo sự cố và sửa chữa
  4. Báo cáo thời gian dừng thiết bị
  5. Báo cáo hiệu suất thiết bị (MTBF, MTTR)
  6. Báo cáo chi phí bảo trì
  7. Báo cáo tiêu hao vật tư bảo trì
  8. Báo cáo tồn kho vật tư bảo trì
  9. Báo cáo năng suất đội bảo trì
  10. Báo cáo phân công và sử dụng nhân sự
  11. Báo cáo tuân thủ kế hoạch bảo trì
  12. Báo cáo cảnh báo và bất thường thiết bị
  13. Báo cáo xu hướng hỏng hóc thiết bị
  14. Báo cáo so sánh hiệu quả giữa các thiết bị
  15. Báo cáo so sánh hiệu quả giữa các đội bảo trì
  16. Báo cáo đánh giá chất lượng bảo trì
  17. Báo cáo hiệu quả cải tiến bảo trì
  18. Dashboard tổng hợp bảo trì
- **Trạng thái**: [ ] Chưa bắt đầu

---

## Cấu trúc trang & Routing

| # | Route | Trang | Mô tả |
|---|---|---|---|
| 1 | `/` | Dashboard | Tổng quan KPI, biểu đồ, cảnh báo |
| 2 | `/maintenance-team` | MaintenanceTeam | Danh sách nhân sự, năng lực, chứng chỉ |
| 3 | `/procedures` | Procedures | Quy trình, checklist, tài liệu kỹ thuật |
| 4 | `/maintenance-plans` | MaintenancePlan | Kế hoạch & lịch bảo trì |
| 5 | `/maintenance-plans/:id` | MaintenancePlanDetail | Chi tiết kế hoạch |
| 6 | `/scheduled-maintenance` | ScheduledMaintenance | Danh sách bảo trì định kỳ |
| 7 | `/scheduled-maintenance/:id` | ScheduledMaintenanceDetail | Chi tiết lệnh bảo trì định kỳ |
| 8 | `/corrective-maintenance` | CorrectiveMaintenance | Danh sách sửa chữa nhỏ |
| 9 | `/corrective-maintenance/:id` | CorrectiveMaintenanceDetail | Chi tiết yêu cầu sửa chữa |
| 10 | `/spare-parts` | SpareParts | Quản lý vật tư bảo trì |
| 11 | `/equipment-monitoring` | EquipmentMonitoring | Theo dõi tình trạng thiết bị |
| 12 | `/maintenance-history` | MaintenanceHistory | Lịch sử bảo trì |
| 13 | `/evaluation` | Evaluation | Đánh giá & cải tiến |
| 14 | `/reports` | Reports | Báo cáo bảo trì |

---

## Phân quyền theo vai trò (3 roles)

| Chức năng | Quản lý bảo trì | Phòng/Trung tâm | Ban Giám đốc |
|---|---|---|---|
| Dashboard | Full KPI | KPI đơn vị | KPI tổng quan |
| Đội ngũ kỹ thuật | CRUD | Xem đội mình | Xem tổng |
| Quy trình & hướng dẫn | CRUD | Xem & thực hiện | Xem & phê duyệt |
| Kế hoạch bảo trì | Lập & quản lý | Xem kế hoạch đơn vị | Phê duyệt |
| Bảo trì định kỳ | Quản lý & giám sát | Thực hiện | Xem báo cáo |
| Sửa chữa nhỏ | Tiếp nhận & phân công | Tạo yêu cầu & thực hiện | Xem báo cáo |
| Vật tư bảo trì | Quản lý cấp phát | Yêu cầu & sử dụng | Xem tồn kho |
| Theo dõi thiết bị | Full monitoring | Xem thiết bị đơn vị | Xem tổng quan |
| Lịch sử bảo trì | Full truy vết | Xem đơn vị | Xem tổng |
| Đánh giá & cải tiến | Phân tích & đề xuất | -- | Phê duyệt |
| Báo cáo | Full | Báo cáo đơn vị | Full + so sánh |

---

## User Profiles (Demo)

| Role | Tên | Đơn vị | Chức vụ |
|---|---|---|---|
| maintenance | Trần Đức Mạnh | Phòng Kỹ thuật (P.KT) | Trưởng phòng |
| department | Hoàng Minh Tuấn | Trung tâm Vận hành Hạ tầng (TT1) | Trưởng trung tâm |
| director | Phạm Quốc Hưng | Ban Giám đốc | Giám đốc |

---

## Tiến độ tổng thể

| Giai đoạn | Nội dung | Trạng thái |
|---|---|---|
| **GĐ 1** | Khởi tạo project, theme, layout, routing | [ ] |
| **GĐ 2** | Mock data + Dashboard | [ ] |
| **GĐ 3** | Module 1-3 (Đội ngũ, Quy trình, Kế hoạch) | [ ] |
| **GĐ 4** | Module 4-5 (Bảo trì định kỳ, Sửa chữa nhỏ) | [ ] |
| **GĐ 5** | Module 6-7 (Vật tư, Theo dõi thiết bị) | [ ] |
| **GĐ 6** | Module 8-9 (Lịch sử, Đánh giá & cải tiến) | [ ] |
| **GĐ 7** | Báo cáo bảo trì | [ ] |
| **GĐ 8** | CI/CD, Build, Deploy staging | [ ] |

---

*Cập nhật lần cuối: 02/04/2026*
