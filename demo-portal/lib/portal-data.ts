// Portal data - Doanh nghiệp A

export const siteConfig = {
  name: "Doanh nghiệp A",
  shortName: "DA",
  slogan: "Cổng thông tin nội bộ",
  unit: "Tổng công ty Doanh nghiệp A — Tập đoàn công nghệ",
  address: "Phường Yên Viên, Gia Lâm, Hà Nội",
  phone: "(024) 3827 xxxx",
  email: "contact@doanhnghiepa.vn",
  established: "1965",
};

export const navMenu = [
  { label: "Trang chủ", href: "/" },
  {
    label: "Giới thiệu",
    href: "/gioi-thieu",
    children: [
      { label: "Lịch sử hình thành", href: "/gioi-thieu#lich-su" },
      { label: "Chức năng nhiệm vụ", href: "/gioi-thieu#chuc-nang" },
      { label: "Cơ cấu tổ chức", href: "/gioi-thieu#co-cau" },
      { label: "Ban Giám đốc", href: "/gioi-thieu#lanh-dao" },
    ],
  },
  {
    label: "Tin tức - Sự kiện",
    href: "/tin-tuc",
    children: [
      { label: "Tin hoạt động", href: "/tin-tuc/hoat-dong" },
      { label: "Thông báo", href: "/thong-bao" },
      { label: "Sự kiện nổi bật", href: "/tin-tuc/su-kien" },
    ],
  },
  {
    label: "Văn bản - Chỉ đạo",
    href: "/van-ban",
    children: [
      { label: "Quyết định", href: "/van-ban?loai=Quyết định" },
      { label: "Công văn", href: "/van-ban?loai=Công văn" },
      { label: "Chỉ thị", href: "/van-ban?loai=Chỉ thị" },
      { label: "Thông báo", href: "/van-ban?loai=Thông báo" },
    ],
  },
  {
    label: "Biểu mẫu",
    href: "/bieu-mau",
  },
  {
    label: "Phần mềm nghiệp vụ",
    href: "/he-thong",
    children: [
      { label: "Tài chính Kế toán", href: "https://pkkq-taichinhketoan-staging.dft.vn" },
      { label: "Quản lý Mua hàng", href: "https://pkkq-muahang-staging.dft.vn" },
      { label: "Hợp đồng & Nhiệm vụ", href: "https://pkkq-hopdongnhiemvu-staging.dft.vn" },
      { label: "Quản lý Kho tàng", href: "https://pkkq-kho-staging.dft.vn" },
      { label: "Quản lý Sản xuất", href: "https://pkkq-sanxuat-staging.dft.vn" },
      { label: "Quản lý Bảo trì", href: "https://pkkq-baotri-staging.dft.vn" },
      { label: "Quản lý Sửa chữa", href: "https://pkkq-suachua-staging.dft.vn" },
      { label: "Quản trị nội dung (CMS)", href: "/cms" },
      { label: "Quản lý SSO & Phân quyền", href: "/sso-management" },
    ],
  },
];

export interface PortalEvent {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  date: string;
  location: string;
  type: string;
  status: "upcoming" | "ongoing" | "ended";
  featured: boolean;
}

export const portalEvents: PortalEvent[] = [
  {
    id: "SK002",
    title: "Doanh nghiệp A kỷ niệm 60 năm Ngày truyền thống và đón nhận Bằng khen của Thủ tướng Chính phủ",
    subtitle: "Sáng 7-8, Doanh nghiệp A tổ chức Lễ kỷ niệm 60 năm Ngày truyền thống (7-8-1965 / 7-8-2025) và đón nhận Bằng khen của Thủ tướng Chính phủ. Lãnh đạo Bộ TT&TT gửi Thư khen",
    image: "/images/anhduc.jpg",
    category: "Sự kiện",
    date: "07/08/2025",
    location: "Hội trường Doanh nghiệp A",
    type: "Lễ kỷ niệm",
    status: "ended",
    featured: true,
  },
  {
    id: "SK003",
    title: "Đảng bộ Doanh nghiệp A tổ chức thành công Đại hội đại biểu lần thứ XXV, nhiệm kỳ 2025 - 2030",
    subtitle: "Trong 2 ngày (15 và 16-5), Đảng bộ Doanh nghiệp A tổ chức Đại hội đại biểu Đảng bộ lần thứ XXV, nhiệm kỳ 2025 - 2030 với sự tham dự của 80 đại biểu đại diện toàn thể đảng viên trong Đảng bộ",
    image: "/images/daihoi.jpg",
    category: "Đảng - Đoàn thể",
    date: "15/05/2025",
    location: "Hội trường Doanh nghiệp A",
    type: "Đại hội",
    status: "ended",
    featured: true,
  },
  {
    id: "SK001",
    title: "Doanh nghiệp A thăm, tặng quà các gia đình bị thiệt hại do bão số 3",
    subtitle: "Đoàn công tác do Đào Ngọc Đại - Giám đốc Nhân sự làm trưởng đoàn đến thăm, tặng quà các gia đình tại xã Mỹ Lương và xã Đông Yên bị thiệt hại do bão số 3 gây ra",
    image: "/images/anhdai.jpg",
    category: "Hoạt động",
    date: "20/09/2024",
    location: "Huyện Chương Mỹ và Quốc Oai, Hà Nội",
    type: "Hoạt động xã hội",
    status: "ended",
    featured: true,
  },
  {
    id: "SK004",
    title: "Hội thảo khoa học ứng dụng công nghệ số trong vận hành hệ thống monitoring",
    subtitle: "Các báo cáo khoa học về ứng dụng công nghệ đo lường hiện đại và chẩn đoán tự động trong vận hành hệ thống monitoring",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop&auto=format&q=80",
    category: "Khoa học",
    date: "12/03/2026",
    location: "Hội trường Doanh nghiệp A",
    type: "Hội thảo",
    status: "ended",
    featured: false,
  },
  {
    id: "SK005",
    title: "Hội nghị Tổng kết công tác vận hành thiết bị năm 2025",
    subtitle: "Tổng kết kết quả vận hành, bảo trì hệ thống monitoring và module phần mềm năm 2025 và triển khai nhiệm vụ trọng tâm năm 2026",
    image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&h=500&fit=crop&auto=format&q=80",
    category: "Hội nghị",
    date: "20/03/2026",
    location: "Hội trường A – Trụ sở Tổng công ty",
    type: "Hội nghị",
    status: "upcoming",
    featured: false,
  },
  {
    id: "SK006",
    title: "Triển lãm Công nghệ Việt Nam 2026 – Hà Nội",
    subtitle: "Đoàn đại biểu Doanh nghiệp A tham dự Triển lãm Công nghệ Quốc tế Việt Nam, giới thiệu năng lực phát triển và cung ứng phần mềm",
    image: "https://images.unsplash.com/photo-1493528820574-a2bd0e2ab62f?w=800&h=500&fit=crop&auto=format&q=80",
    category: "Quốc tế",
    date: "06/03/2026",
    location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    type: "Triển lãm",
    status: "ended",
    featured: false,
  },
];

// Derived: banners = featured events (ordered by featured first)
export const heroBanners = portalEvents.filter((e) => e.featured);

export const latestNews = [
  {
    id: "N001",
    title: "Doanh nghiệp A triển khai thành công hệ thống chẩn đoán lỗi tự động cho hệ thống monitoring",
    excerpt: "Ngày 15/3/2026, Doanh nghiệp A đã chính thức đưa vào vận hành hệ thống chẩn đoán lỗi tự động tích hợp thiết bị đo Tektronix và phần mềm phân tích tín hiệu, bước đầu đạt kết quả tốt.",
    category: "Tin hoạt động",
    date: "15/03/2026",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=280&fit=crop&auto=format&q=80",
    isHot: true,
    views: 342,
  },
  {
    id: "N002",
    title: "Hội thảo khoa học 'Ứng dụng công nghệ mới trong vận hành hệ thống monitoring'",
    excerpt: "Hội thảo thu hút hơn 80 nhà khoa học, kỹ sư từ các đơn vị trong và ngoài Tổng công ty, tập trung vào việc ứng dụng thiết bị đo lường hiện đại và công nghệ số trong vận hành hệ thống monitoring và module phần mềm.",
    category: "Khoa học",
    date: "12/03/2026",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=280&fit=crop&auto=format&q=80",
    isHot: false,
    views: 218,
  },
  {
    id: "N003",
    title: "Trung tâm Vận hành Hệ thống hoàn thành nâng cấp hệ thống 36D6 cho Phòng Triển khai P261",
    excerpt: "Sau 6 tháng vận hành và hiệu chỉnh, Trung tâm Alpha đã hoàn thành nâng cấp hệ thống monitoring 36D6, đáp ứng yêu cầu kỹ thuật của Ban Giám đốc.",
    category: "Dự án",
    date: "10/03/2026",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=280&fit=crop&auto=format&q=80",
    isHot: false,
    views: 195,
  },
  {
    id: "N004",
    title: "Đoàn cán bộ Doanh nghiệp A tham quan học tập kinh nghiệm vận hành thiết bị tại Trung tâm phần mềm Beta",
    excerpt: "Đoàn cán bộ kỹ thuật 12 người đã đến Trung tâm phần mềm Beta trao đổi kinh nghiệm vận hành module điều khiển S-300PMU và thiết bị điện tử hiện đại.",
    category: "Hợp tác",
    date: "08/03/2026",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&auto=format&q=80",
    isHot: false,
    views: 276,
  },
  {
    id: "N005",
    title: "Nghiệm thu đề tài nghiên cứu khoa học cấp Tổng công ty",
    excerpt: "Hội đồng nghiệm thu đề tài 'Nghiên cứu giải pháp nâng cao độ chính xác hiệu chỉnh hệ thống monitoring ST-68 sau nâng cấp' đã thông qua kết quả nghiên cứu xuất sắc.",
    category: "Nghiên cứu KH",
    date: "06/03/2026",
    image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=280&fit=crop&auto=format&q=80",
    isHot: false,
    views: 163,
  },
  {
    id: "N006",
    title: "Kết nạp 18 đảng viên mới trong đợt 26/3 nhân kỷ niệm thành lập Đoàn TNCS",
    excerpt: "Đảng ủy Doanh nghiệp A đã tổ chức lễ kết nạp đảng viên mới cho 18 quần chúng ưu tú, tiêu biểu trong phong trào thi đua của đơn vị năm 2025.",
    category: "Đảng ủy",
    date: "03/03/2026",
    image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400&h=280&fit=crop&auto=format&q=80",
    isHot: false,
    views: 134,
  },
];

export const featuredNews = {
  id: "FN001",
  title: "Doanh nghiệp A kỷ niệm 60 năm Ngày truyền thống và đón nhận Bằng khen của Thủ tướng Chính phủ",
  excerpt: "Sáng 07/8/2025, Doanh nghiệp A long trọng tổ chức lễ kỷ niệm 60 năm thành lập (1965–2025) và đón nhận Bằng khen của Thủ tướng Chính phủ trao tặng.",
  category: "Sự kiện",
  date: "07/08/2025",
  image: "/images/kyniem.jpg",
};

export const newsContent: Record<string, {
  author: string;
  authorTitle: string;
  tags: string[];
  sapo: string;
  body: string[];
}> = {
  "FN001": {
    author: "Phòng Truyền thông",
    authorTitle: "Doanh nghiệp A",
    tags: ["Kỷ niệm", "60 năm", "Bằng khen"],
    sapo: "Sáng 07/8/2025, Doanh nghiệp A long trọng tổ chức lễ kỷ niệm 60 năm Ngày truyền thống (07/8/1965 – 07/8/2025) và đón nhận Bằng khen của Thủ tướng Chính phủ trao tặng.",
    body: [
      "Sáng 07/8/2025, tại Hội trường Doanh nghiệp A, đơn vị long trọng tổ chức lễ kỷ niệm 60 năm Ngày truyền thống (07/8/1965 – 07/8/2025) và đón nhận Bằng khen của Thủ tướng Chính phủ. Buổi lễ có sự tham dự của Lê Huy Vịnh — TGĐ Tổng công ty, Vũ Hồng Sơn — Phó TGĐ phụ trách công nghệ, cùng các đồng chí lão thành và toàn thể cán bộ, nhân viên đơn vị. Lãnh đạo Bộ TT&TT gửi Thư khen.",
      "Doanh nghiệp A được thành lập năm 1965 dưới mã đơn vị MZ-495 với nhiệm vụ vận hành và bảo trì hệ thống monitoring phục vụ vận hành. Trong giai đoạn đầu, đơn vị tích cực vận hành thiết bị cả tại trụ sở lẫn cơ động tại các trung tâm dữ liệu, góp phần vào nhiều dự án trọng điểm quốc gia. Đơn vị sau đó được nâng cấp thành Trung tâm V119, rồi Doanh nghiệp A; năm 1987 được tái cấu trúc thành Tổng công ty Công nghệ.",
      "Trải qua 60 năm, Doanh nghiệp A đã triển khai, nâng cấp hàng trăm dự án phần mềm và hệ thống monitoring, từ các module P-12, P-18, 36D6, P-37, ST-68 đến hệ thống module S-75, S-125 và S-300PMU. Đơn vị đã từng bước nâng cấp công nghệ từ kiến trúc monolith sang microservices, vi dịch vụ và xử lý dữ liệu thời gian thực, làm chủ nhiều công nghệ phần mềm hiện đại.",
      "Ghi nhận những đóng góp to lớn trong 60 năm qua, Thủ tướng Chính phủ đã trao tặng Doanh nghiệp A Bằng khen. Đây là phần thưởng cao quý, khẳng định vị thế của đơn vị trong sự nghiệp chuyển đổi số quốc gia.",
      "Phát biểu chỉ đạo tại buổi lễ, Phó TGĐ Vũ Hồng Sơn biểu dương những thành tích xuất sắc của Doanh nghiệp A và yêu cầu đơn vị tiếp tục phát huy truyền thống, nâng cao năng lực phát triển và vận hành các hệ thống monitoring và module phần mềm thế hệ mới, xứng đáng với sự tin tưởng của khách hàng và đối tác."
    ]
  },
  "N001": {
    author: "Phòng Kỹ thuật",
    authorTitle: "Doanh nghiệp A",
    tags: ["Công nghệ số", "Chẩn đoán tự động", "Monitoring", "Chuyển đổi số"],
    sapo: "Ngày 15/3/2026, Doanh nghiệp A đã chính thức đưa vào vận hành hệ thống chẩn đoán lỗi tự động cho hệ thống monitoring thế hệ mới, đánh dấu bước chuyển mình quan trọng trong công cuộc chuyển đổi số của đơn vị.",
    body: [
      "Sau hơn 18 tháng nghiên cứu và triển khai thử nghiệm, ngày 15/03/2026, Doanh nghiệp A đã chính thức tổ chức lễ khai trương và đưa vào vận hành Hệ thống Chẩn đoán Lỗi Tự động (Automated Fault Diagnosis System – AFDS) cho hệ thống monitoring. Đây là hệ thống tích hợp giữa thiết bị đo lường Tektronix thế hệ mới và phần mềm phân tích tín hiệu được phát triển theo yêu cầu đặc thù của Doanh nghiệp A.",
      "Hệ thống AFDS cho phép các trung tâm vận hành chẩn đoán nhanh các lỗi hỏng phức tạp trên các khối chức năng của hệ thống monitoring, từ khối thu thập, khối xử lý, khối phân tích đến khối hiển thị, trên một nền tảng thống nhất. Đặc biệt, hệ thống tích hợp cơ sở dữ liệu lỗi hỏng từ hơn 500 lượt vận hành trước đó, giúp rút ngắn thời gian chẩn đoán từ 3–5 ngày xuống còn 4–8 giờ. Đây là bước đột phá trong việc nâng cao hiệu suất vận hành của hơn 80 kỹ sư và chuyên viên kỹ thuật tại Doanh nghiệp A.",
      "Phòng Kỹ thuật – đơn vị chủ trì triển khai – cho biết, trong giai đoạn đầu, hệ thống sẽ phục vụ Trung tâm Alpha (Vận hành Monitoring) và Trung tâm Delta (Điện tử), quản lý dữ liệu chẩn đoán cho các hệ thống P-18, 36D6, P-37 và ST-68. Đến cuối năm 2026, hệ thống sẽ được mở rộng sang Trung tâm Beta (Module phần mềm) để hỗ trợ chẩn đoán hệ thống điều khiển module S-125 và S-300PMU.",
      "Giám đốc Trần Văn Đức đánh giá đây là thành quả của quá trình nỗ lực không ngừng của tập thể cán bộ, kỹ sư Doanh nghiệp A trong việc ứng dụng công nghệ cao vào công tác vận hành hệ thống monitoring. Ông nhấn mạnh: 'Việc làm chủ công cụ chẩn đoán số hiện đại không chỉ nâng cao năng suất mà còn góp phần đảm bảo bảo mật cao khi toàn bộ dữ liệu được lưu trữ trên hệ thống máy chủ nội bộ, không phụ thuộc vào đám mây nước ngoài.'",
      "Trong thời gian tới, Doanh nghiệp A tiếp tục lên kế hoạch đào tạo nâng cao cho toàn bộ đội ngũ kỹ sư về sử dụng hệ thống, đồng thời nghiên cứu tích hợp thêm module phân tích phổ tín hiệu và mô phỏng mạch điện tử vào nền tảng AFDS để xây dựng một môi trường chẩn đoán số hoàn chỉnh."
    ]
  },
  "N002": {
    author: "Phòng Kỹ thuật",
    authorTitle: "Doanh nghiệp A",
    tags: ["Hội thảo khoa học", "Công nghệ mới", "Vận hành thiết bị", "Monitoring"],
    sapo: "Hội thảo khoa học với chủ đề 'Ứng dụng công nghệ mới trong vận hành hệ thống monitoring' thu hút hơn 80 nhà khoa học và kỹ sư từ nhiều đơn vị, tập trung vào việc ứng dụng thiết bị đo lường hiện đại và công nghệ số trong vận hành monitoring và module phần mềm.",
    body: [
      "Ngày 12/03/2026, Doanh nghiệp A phối hợp với Học viện Kỹ thuật tổ chức Hội thảo khoa học với chủ đề 'Ứng dụng công nghệ mới trong vận hành hệ thống monitoring'. Hội thảo diễn ra trong một ngày tại Hội trường đơn vị, với sự tham gia của hơn 80 nhà khoa học, kỹ sư đến từ Doanh nghiệp A, Viện KH-CN, Trung tâm phần mềm Beta, Gamma, Trung tâm Đo lường khu vực và một số trường đại học kỹ thuật trong nước.",
      "Hội thảo tập trung vào 03 chủ đề chính: (1) Ứng dụng thiết bị đo lường thế hệ mới (Tektronix, Siemens) trong kiểm tra và hiệu chỉnh hệ thống monitoring sau vận hành; (2) Công nghệ phục hồi và thay thế linh kiện điện tử trên hệ thống điều khiển module phần mềm; và (3) Ứng dụng phần mềm mô phỏng trong đào tạo kỹ thuật vận hành hệ thống. Tổng cộng 14 báo cáo khoa học đã được trình bày và thảo luận sôi nổi.",
      "Đáng chú ý, nhóm nghiên cứu của Doanh nghiệp A đã báo cáo kết quả ứng dụng phương pháp phân tích phổ tín hiệu số để chẩn đoán lỗi hỏng trên khối thu thập hệ thống 36D6, đạt được tỷ lệ phát hiện lỗi chính xác trên 95% so với phương pháp kiểm tra truyền thống. Đây được coi là bước đột phá đáng ghi nhận trong nghiên cứu vận hành hệ thống nội địa.",
      "Tại phiên thảo luận, nhiều ý kiến nhấn mạnh tầm quan trọng của việc phát triển đội ngũ kỹ sư tích hợp – vừa có kiến thức chuyên sâu về hệ thống monitoring, vừa có năng lực ứng dụng công nghệ đo lường và chẩn đoán tiên tiến. Đại diện Học viện Kỹ thuật đề xuất xây dựng chương trình đào tạo liên kết với Doanh nghiệp A để đào tạo thế hệ kỹ sư vận hành thiết bị 4.0.",
      "Kết thúc hội thảo, Ban Tổ chức đã tổng hợp và thông qua Tuyên bố chung với 08 kiến nghị gửi Ban Giám đốc Tổng công ty về định hướng phát triển công nghệ vận hành thiết bị giai đoạn 2026–2030, bao gồm đầu tư trang thiết bị đo lường hiện đại và xây dựng cơ sở dữ liệu chuẩn về lỗi hỏng hệ thống monitoring Việt Nam."
    ]
  },
  "N003": {
    author: "Trung tâm Vận hành Hệ thống",
    authorTitle: "Doanh nghiệp A",
    tags: ["Vận hành", "Hệ thống 36D6", "Phòng Triển khai 261"],
    sapo: "Sau 6 tháng vận hành và hiệu chỉnh tập trung, Trung tâm Alpha đã hoàn thiện toàn bộ công tác nâng cấp hệ thống monitoring 36D6 cho Phòng Triển khai P261, đáp ứng đầy đủ các yêu cầu kỹ thuật do Ban Giám đốc đề ra.",
    body: [
      "Ngày 10/03/2026, Trung tâm Vận hành Hệ thống đã tổ chức buổi báo cáo kết quả và bàn giao hồ sơ nâng cấp hệ thống monitoring 36D6 lên Ban Giám đốc Doanh nghiệp A. Đây là dự án nâng cấp cấp Tổng công ty cho hệ thống có khả năng giám sát phạm vi rộng, phục vụ nhiệm vụ giám sát hệ thống của Phòng Triển khai module P261 thuộc Khối K361.",
      "Hồ sơ nâng cấp gồm hơn 120 biên bản kiểm tra kỹ thuật, 15 phiếu đo lường thông số và 08 biên bản hiệu chỉnh chi tiết. Đặc biệt, lần đầu tiên toàn bộ dữ liệu đo lường được số hóa trên hệ thống chẩn đoán AFDS, cho phép so sánh tự động giữa thông số thực tế và thông số chuẩn nội bộ.",
      "Về thông số kỹ thuật sau nâng cấp, hệ thống monitoring 36D6 đạt khả năng phát hiện sự kiện trên dải rộng (vượt 5% so với yêu cầu), độ chính xác đo cự ly sai lệch nhỏ hơn 200m, độ chính xác đo góc phương vị sai lệch nhỏ hơn 20 phút góc. Toàn bộ 24 khối chức năng chính đều đạt tiêu chuẩn kỹ thuật sau khi thay thế linh kiện và hiệu chỉnh.",
      "Trưởng nhóm Trung tâm Alpha, Trưởng phòng Nguyễn Hữu Toàn, cho biết trong quá trình thực hiện, nhóm vận hành đã vượt qua nhiều thách thức kỹ thuật, đặc biệt là việc phục hồi khối thu cao tần khi một số linh kiện gốc đã ngừng sản xuất. Giải pháp thay thế bằng linh kiện tương đương do Trung tâm R&D Hà Nội cung cấp đã được thử nghiệm và đạt yêu cầu.",
      "Sau khi được Ban Giám đốc phê duyệt, hệ thống monitoring sẽ được vận chuyển về Phòng Triển khai P261 để lắp đặt và thử nghiệm thực địa. Dự kiến bàn giao chính thức vào cuối tháng 3/2026 sau khi hoàn thành giai đoạn chạy thử 72 giờ liên tục tại trung tâm dữ liệu."
    ]
  },
  "N004": {
    author: "Phòng Kế hoạch",
    authorTitle: "Doanh nghiệp A",
    tags: ["Hợp tác", "Trung tâm phần mềm Beta", "Module S-300PMU"],
    sapo: "Đoàn cán bộ kỹ thuật 12 người của Doanh nghiệp A đã đến Trung tâm phần mềm Beta trao đổi kinh nghiệm vận hành hệ thống điều khiển module S-300PMU và thiết bị điện tử hiện đại.",
    body: [
      "Từ ngày 06/03 đến 08/03/2026, đoàn công tác gồm 12 cán bộ kỹ thuật và chuyên viên lành nghề của Doanh nghiệp A đã đến thăm và trao đổi kinh nghiệm tại Trung tâm phần mềm Beta. Đây là hoạt động nằm trong chương trình hợp tác kỹ thuật giữa các trung tâm vận hành thiết bị thuộc Tổng công ty công nghệ, nhằm nâng cao năng lực vận hành các hệ thống module thế hệ mới.",
      "Trong 03 ngày làm việc, đoàn đã tham quan và trao đổi kỹ thuật tại các trung tâm vận hành chuyên dụng, đặc biệt tập trung vào 03 lĩnh vực: (1) Quy trình vận hành hệ thống điều khiển module S-300PMU; (2) Công nghệ phục hồi mạch in nhiều lớp trên các bo mạch điều khiển; (3) Phương pháp hiệu chỉnh hệ thống định tuyến module SA-3 sau vận hành.",
      "Đặc biệt, đoàn đã có buổi làm việc chính thức với phòng kỹ thuật của Trung tâm phần mềm Beta về khả năng chuyển giao quy trình vận hành khối nguồn cung cấp cao áp cho hệ thống P-37. Phía Beta đã chia sẻ kinh nghiệm xử lý sự cố thường gặp và bày tỏ sẵn sàng hỗ trợ kỹ thuật cho Doanh nghiệp A trong quá trình tiếp nhận vận hành hệ thống P-37 từ Khối K367.",
      "Trưởng đoàn, Phó Giám đốc Nguyễn Cảnh Toàn, đánh giá chuyến công tác đã mang lại nhiều thông tin và kinh nghiệm thực tế quý báu. Ông cho biết đoàn đã thu thập được nhiều tài liệu kỹ thuật, quy trình vận hành và phương pháp kiểm tra hiện đại, sẽ là nguồn tham khảo quan trọng cho công tác nâng cao năng lực vận hành trong thời gian tới.",
      "Kết thúc chuyến công tác, đoàn đã tổng hợp báo cáo và đề xuất lên Ban Giám đốc về một số hướng hợp tác kỹ thuật tiềm năng, trong đó đặc biệt nhấn mạnh việc nghiên cứu ứng dụng công nghệ kiểm tra không phá hủy (NDT) trong đánh giá tình trạng kỹ thuật các bộ phận cơ khí của giá đỡ module, nhằm kéo dài tuổi thọ và đảm bảo an toàn vận hành."
    ]
  },
  "N005": {
    author: "Phòng Kỹ thuật",
    authorTitle: "Doanh nghiệp A",
    tags: ["Nghiên cứu khoa học", "Hệ thống ST-68", "Tổng công ty"],
    sapo: "Hội đồng nghiệm thu cấp Tổng công ty đã thông qua kết quả đề tài nghiên cứu khoa học về giải pháp nâng cao độ chính xác hiệu chỉnh hệ thống monitoring ST-68 sau nâng cấp, đánh giá xuất sắc toàn diện.",
    body: [
      "Ngày 06/03/2026, tại trụ sở Tổng công ty, Hội đồng Khoa học cấp Tổng công ty đã tổ chức phiên họp nghiệm thu đề tài nghiên cứu khoa học cấp Tổng công ty mang tên 'Nghiên cứu giải pháp nâng cao độ chính xác hiệu chỉnh hệ thống monitoring đo cao ST-68 sau nâng cấp'. Đề tài do Doanh nghiệp A chủ trì thực hiện trong 3 năm (2023–2025).",
      "Hội đồng gồm 09 thành viên là các chuyên gia đầu ngành về kỹ thuật monitoring, đo lường điện tử và tự động hóa. Sau khi nghe báo cáo tổng kết và phản biện khoa học, Hội đồng đánh giá đề tài đã hoàn thành đầy đủ 06 mục tiêu đề ra, đồng thời có 02 kết quả vượt chỉ tiêu, đặc biệt ở phần thuật toán hiệu chỉnh tự động và kết quả đo thực nghiệm.",
      "Kết quả nổi bật nhất của đề tài là đã phát triển thành công bộ công cụ hiệu chỉnh tự động cho hệ thống monitoring đo cao ST-68, sử dụng thuật toán bù sai số thích nghi kết hợp với mảng cảm biến đo góc cao độ phân giải cao. Hệ thống giúp giảm sai số đo cao xuống còn 50m ở cự ly 200km, cải thiện 40% so với phương pháp hiệu chỉnh thủ công truyền thống.",
      "Chủ nhiệm đề tài, TS. Trần Đức Mạnh – Trưởng phòng Kỹ thuật, cho biết điểm sáng tạo cốt lõi của đề tài nằm ở việc tích hợp thuật toán xử lý tín hiệu số tiên tiến vào quy trình hiệu chỉnh, giúp tự động bù các sai số hệ thống phát sinh sau quá trình tháo lắp và thay thế linh kiện trong nâng cấp. Đây là lần đầu tiên một thuật toán loại này được phát triển và thử nghiệm thành công trên hệ thống monitoring nội địa.",
      "Hội đồng nhất trí xếp loại đề tài Xuất sắc và đề nghị Tổng công ty sớm triển khai ứng dụng kết quả vào thực tiễn, trước tiên là áp dụng bộ công cụ hiệu chỉnh này cho tất cả các hệ thống ST-68 nâng cấp tại Doanh nghiệp A từ năm 2026. Đề tài cũng đã đăng ký bảo hộ 02 giải pháp kỹ thuật hữu ích tại Cục Sở hữu trí tuệ."
    ]
  },
  "N006": {
    author: "Đảng ủy Doanh nghiệp A",
    authorTitle: "Doanh nghiệp A",
    tags: ["Đảng ủy", "Kết nạp Đảng", "Đoàn Thanh niên"],
    sapo: "Đảng ủy Doanh nghiệp A tổ chức lễ kết nạp đảng viên mới cho 18 quần chúng ưu tú, tiêu biểu trong phong trào thi đua của đơn vị năm 2025.",
    body: [
      "Nhân kỷ niệm 96 năm Ngày thành lập Đoàn TNCS Hồ Chí Minh (26/3/1931 – 26/3/2026), ngày 03/03/2026, Đảng ủy Doanh nghiệp A đã long trọng tổ chức Lễ kết nạp đảng viên mới cho 18 quần chúng ưu tú. Buổi lễ diễn ra trang trọng tại Hội trường đơn vị, với sự chứng kiến của Thủ trưởng Đảng ủy, Bí thư các chi bộ và đông đảo cán bộ, đảng viên trong toàn đơn vị.",
      "18 quần chúng được kết nạp lần này là những cán bộ, kỹ sư, chuyên viên kỹ thuật tiêu biểu đã trải qua quá trình phấn đấu, rèn luyện nghiêm túc và liên tục. Phần lớn trong số họ là kỹ sư trẻ và nhân viên bậc cao thuộc thế hệ 8X, 9X, có trình độ chuyên môn cao, nhiều người tốt nghiệp sau đại học, đang trực tiếp tham gia các dự án vận hành thiết bị quan trọng của đơn vị.",
      "Phát biểu tại buổi lễ, Bí thư Đảng ủy – Đào Ngọc Đại – nhấn mạnh: 'Mỗi kỹ sư, chuyên viên khi trở thành đảng viên không chỉ đặt lên vai mình trách nhiệm lớn hơn trước Đảng và nhân dân, mà còn là cam kết sẽ phấn đấu hết mình trong công tác chuyên môn, đặt chất lượng vận hành thiết bị và trách nhiệm với khách hàng lên hàng đầu.'",
      "Trong năm 2025, tổ chức Đảng của Doanh nghiệp A đã được Ban Thường vụ Đảng ủy Tổng công ty công nhận là 'Tổ chức Đảng trong sạch vững mạnh'. Đảng ủy đơn vị cũng vinh dự nhận Bằng khen của Ban Giám đốc Tổng công ty vì đã lãnh đạo, chỉ đạo hoàn thành xuất sắc nhiệm vụ chính trị năm 2025, trong đó có việc hoàn thành đúng tiến độ 05 dự án nâng cấp thiết bị cấp Tổng công ty.",
      "Đây là lần kết nạp đảng viên lớn nhất trong 05 năm trở lại đây của đơn vị, phản ánh sự lớn mạnh về số lượng và chất lượng đội ngũ cán bộ, đồng thời thể hiện quyết tâm của tổ chức Đảng trong việc xây dựng Doanh nghiệp A ngày càng vững mạnh toàn diện."
    ]
  },
  "N007": {
    author: "Phòng Truyền thông",
    authorTitle: "Doanh nghiệp A",
    tags: ["Kỷ niệm", "60 năm", "Bằng khen"],
    sapo: "Doanh nghiệp A kỷ niệm 60 năm Ngày truyền thống (07/8/1965 – 07/8/2025) và vinh dự đón nhận Bằng khen của Thủ tướng Chính phủ trao tặng.",
    body: [
      "Doanh nghiệp A được thành lập năm 1965 dưới mã đơn vị MZ-495 với nhiệm vụ vận hành và bảo trì hệ thống monitoring phục vụ vận hành. Trong giai đoạn đầu, đơn vị tích cực vận hành thiết bị cả tại trụ sở lẫn cơ động tại các trung tâm dữ liệu, góp phần quan trọng vào nhiều dự án trọng điểm quốc gia.",
      "Trải qua 60 năm, Doanh nghiệp A đã triển khai, nâng cấp hàng trăm dự án phần mềm và hệ thống monitoring các loại, từ các module P-12, P-18, 36D6, P-37, ST-68 đến hệ thống module S-75, S-125 và S-300PMU. Đơn vị sau đó được nâng cấp thành Trung tâm V119, rồi Doanh nghiệp A; năm 1987 được tái cấu trúc thành Tổng công ty Công nghệ.",
      "Sau năm 1975, đơn vị được đầu tư công nghệ, từng bước nâng cấp từ kiến trúc monolith sang microservices, vi dịch vụ và xử lý dữ liệu thời gian thực. Nhiều kỹ sư được đào tạo tại các tập đoàn công nghệ ở Nga và Belarus, tạo nền tảng vững chắc cho việc tự chủ công nghệ phần mềm.",
      "Sáng 07/8/2025, đơn vị long trọng tổ chức lễ kỷ niệm với sự tham dự của Lê Huy Vịnh — TGĐ Tổng công ty, Vũ Hồng Sơn — Phó TGĐ phụ trách công nghệ. Lãnh đạo Bộ TT&TT gửi Thư khen ghi nhận những đóng góp xuất sắc của đơn vị.",
      "Thủ tướng Chính phủ đã trao tặng Doanh nghiệp A Bằng khen — phần thưởng cao quý khẳng định 60 năm cống hiến cho sự nghiệp chuyển đổi số quốc gia."
    ]
  }
};

export const recentAnnouncements = [
  { id: "A1", title: "Triệu tập Hội nghị Tổng kết công tác năm 2025 vào ngày 20/03/2026", date: "17/03/2026", urgent: true },
  { id: "A2", title: "Thông báo lịch trực ban tuần 12/2026 (18-24/3)", date: "16/03/2026", urgent: false },
  { id: "A3", title: "Kết quả xét duyệt sáng kiến cải tiến kỹ thuật quý I/2026", date: "15/03/2026", urgent: false },
  { id: "A4", title: "Phân công nhiệm vụ nâng cấp hệ thống module S-125 cho Khối K363", date: "14/03/2026", urgent: true },
  { id: "A5", title: "Mời tham gia đào tạo sử dụng thiết bị đo Tektronix MDO34 - khóa 3/2026", date: "13/03/2026", urgent: false },
  { id: "A6", title: "Thông báo lịch tiêm phòng định kỳ cho cán bộ nhân viên", date: "12/03/2026", urgent: false },
];

export const recentDocuments = [
  { id: "D1", soHieu: "25/QĐ-DA", title: "Quyết định phân công nhiệm vụ nâng cấp hệ thống monitoring 36D6 năm 2026", loai: "Quyết định", date: "14/03/2026" },
  { id: "D2", soHieu: "102/CV-BGĐ", title: "Về việc tăng cường bảo mật thông tin trong hệ thống nội bộ", loai: "Công văn", date: "13/03/2026" },
  { id: "D3", soHieu: "15/CT-DA", title: "Chỉ thị triển khai giai đoạn 2 nâng cấp hệ thống module S-125", loai: "Chỉ thị", date: "08/03/2026" },
  { id: "D4", soHieu: "07/TB-BGĐ", title: "Thông báo kế hoạch kiểm tra định kỳ các đơn vị trực thuộc", loai: "Thông báo", date: "10/03/2026" },
  { id: "D5", soHieu: "12/KH-DA", title: "Kế hoạch công tác tháng 3 năm 2026", loai: "Kế hoạch", date: "01/03/2026" },
];

export const quickLinks = [
  { label: "Tin tức - Sự kiện", href: "/tin-tuc", icon: "Newspaper", count: null },
  { label: "Văn bản chỉ đạo", href: "/van-ban", icon: "FileText", count: 12 },
  { label: "Thông báo nội bộ", href: "/thong-bao", icon: "Bell", count: 5 },
  { label: "Biểu mẫu & Quy trình", href: "/bieu-mau", icon: "ClipboardList", count: null },
  { label: "Phần mềm nghiệp vụ", href: "/he-thong", icon: "FolderKanban", count: null },
];

export const libraryItems = [
  { id: "L001", title: "TCVN 7782:2008 - Quy phạm kỹ thuật vận hành hệ thống monitoring", type: "TCVN", category: "Tiêu chuẩn", downloads: 145 },
  { id: "L002", title: "Sổ tay Vận hành Hệ thống P-18 - Phiên bản 4", type: "Nội bộ", category: "Tài liệu nội bộ", downloads: 67 },
  { id: "L003", title: "ISO 9001:2015 - Hệ thống quản lý chất lượng", type: "ISO", category: "Tiêu chuẩn", downloads: 201 },
  { id: "L004", title: "Quy trình nâng cấp hệ thống module S-125 Pechora", type: "Nội bộ", category: "Tài liệu nội bộ", downloads: 89 },
  { id: "L005", title: "Tiêu chuẩn kỹ thuật thiết bị monitoring - Tập 2", type: "Nội bộ", category: "Tài liệu nội bộ", downloads: 53 },
  { id: "L006", title: "Hướng dẫn hiệu chỉnh hệ thống monitoring đo cao ST-68", type: "Nội bộ", category: "Tài liệu nội bộ", downloads: 112 },
  { id: "L007", title: "ISO/IEC 17025:2017 - Yêu cầu chung cho phòng thử nghiệm", type: "ISO", category: "Tiêu chuẩn quốc tế", downloads: 78 },
  { id: "L008", title: "Quy trình kiểm tra hệ thống điều khiển module S-300PMU", type: "Nội bộ", category: "Tài liệu nội bộ", downloads: 44 },
  { id: "L009", title: "Tài liệu kỹ thuật hệ thống định tuyến P-37", type: "Kỹ thuật", category: "Thiết bị", downloads: 61 },
  { id: "L010", title: "Hướng dẫn sử dụng thiết bị đo Tektronix MDO34", type: "Kỹ thuật", category: "Thiết bị", downloads: 37 },
];

export const formItems = [
  { id: "F001", title: "Phiếu đề nghị cấp phát vật tư phụ tùng vận hành", category: "Logistics", code: "BM-LG-01" },
  { id: "F002", title: "Phiếu đăng ký sáng kiến cải tiến kỹ thuật", category: "Khoa học - Kỹ thuật", code: "BM-KH-01" },
  { id: "F003", title: "Đơn xin nghỉ phép / nghỉ ốm", category: "Nhân sự", code: "BM-NS-01" },
  { id: "F004", title: "Biểu mẫu báo cáo tiến độ vận hành thiết bị", category: "Dự án", code: "BM-DA-01" },
  { id: "F005", title: "Phiếu yêu cầu hỗ trợ kỹ thuật đo lường", category: "Kỹ thuật", code: "BM-KT-01" },
  { id: "F006", title: "Tờ trình đề xuất mua sắm linh kiện, thiết bị", category: "Logistics", code: "BM-LG-02" },
  { id: "F007", title: "Biên bản nghiệm thu chất lượng thiết bị sau vận hành", category: "KCS", code: "BM-KCS-01" },
];

export const statsData = [
  { label: "Năm thành lập", value: "1965", suffix: "" },
  { label: "Cán bộ nhân viên", value: "400", suffix: "+" },
  { label: "Dự án triển khai", value: "1.000", suffix: "+" },
  { label: "Trung tâm nòng cốt", value: "4", suffix: "" },
];
