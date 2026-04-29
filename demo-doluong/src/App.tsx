import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CongDonVi from './pages/CongDonVi';
import LichSuKiemDinh from './pages/CongDonVi/LichSuKiemDinh';
import TheoDoiHanHC from './pages/CongDonVi/TheoDoiHanHC';
import YeuCau from './pages/YeuCau';
import ChiTietYeuCau from './pages/YeuCau/ChiTietYeuCau';
import TaoYeuCau from './pages/YeuCau/TaoYeuCau';
import KeHoachDo from './pages/KeHoachDo';
import ChiTietKeHoach from './pages/KeHoachDo/ChiTietKeHoach';
import TaoKeHoach from './pages/KeHoachDo/TaoKeHoach';
import ChuanDoLuong from './pages/ChuanDoLuong';
import ThietBi from './pages/ThietBi';
import PhongLab from './pages/PhongLab';
import ThucHienDo from './pages/ThucHienDo';
import PhanTichSaiSo from './pages/ThucHienDo/PhanTichSaiSo';
// ChungChi đã gộp vào KetQuaDo
import KetQuaDo from './pages/KetQuaDo';
import TieuChuan from './pages/TieuChuan';
import QuyTrinhDo from './pages/TieuChuan/QuyTrinhDo';
import GiamSat from './pages/GiamSat';
import BieuDoSPC from './pages/GiamSat/BieuDoSPC';
import NguoiDung from './pages/QuanTri/NguoiDung';
import DanhMuc from './pages/QuanTri/DanhMuc';
import PhanQuyen from './pages/QuanTri/PhanQuyen';
import './App.css';

function App() {
  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <AntApp>
        <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              {/* Cổng đơn vị */}
              <Route path="don-vi" element={<CongDonVi />} />
              <Route path="lich-su-kiem-dinh" element={<LichSuKiemDinh />} />
              <Route path="theo-doi-han-hc" element={<TheoDoiHanHC />} />
              {/* Yêu cầu & Kế hoạch */}
              <Route path="yeu-cau" element={<YeuCau />} />
              <Route path="yeu-cau/tao-moi" element={<TaoYeuCau />} />
              <Route path="yeu-cau/:id" element={<ChiTietYeuCau />} />
              <Route path="ke-hoach-do" element={<KeHoachDo />} />
              <Route path="ke-hoach-do/tao-moi" element={<TaoKeHoach />} />
              <Route path="ke-hoach-do/:id" element={<ChiTietKeHoach />} />
              {/* Chuẩn & Thiết bị */}
              <Route path="chuan-do" element={<ChuanDoLuong />} />
              <Route path="thiet-bi" element={<ThietBi />} />
              <Route path="phong-lab" element={<PhongLab />} />
              {/* Thực hiện đo & Phân tích */}
              <Route path="thuc-hien-do" element={<ThucHienDo />} />
              <Route path="phan-tich-sai-so" element={<PhanTichSaiSo />} />
              {/* ChungChi gộp vào tab trong KetQuaDo */}
              <Route path="ket-qua" element={<KetQuaDo />} />
              {/* Kho Tri thức */}
              <Route path="tieu-chuan" element={<TieuChuan />} />
              <Route path="quy-trinh-do" element={<QuyTrinhDo />} />
              {/* Giám sát */}
              <Route path="giam-sat" element={<GiamSat />} />
              <Route path="bieu-do-spc" element={<BieuDoSPC />} />
              {/* Quản trị hệ thống */}
              <Route path="quan-tri/nguoi-dung" element={<NguoiDung />} />
              <Route path="quan-tri/danh-muc" element={<DanhMuc />} />
              <Route path="quan-tri/phan-quyen" element={<PhanQuyen />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
