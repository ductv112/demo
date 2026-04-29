import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import Warehouses from './pages/Warehouses';
import WarehouseDetail from './pages/WarehouseDetail';
import InboundOrders from './pages/InboundOrders';
import InboundDetail from './pages/InboundDetail';
import InboundForm from './pages/InboundForm';
import OutboundOrders from './pages/OutboundOrders';
import OutboundDetail from './pages/OutboundDetail';
import OutboundForm from './pages/OutboundForm';
import StockTransfer from './pages/StockTransfer';
import StockTransferForm from './pages/StockTransferForm';
import Inventory from './pages/Inventory';
import ReplenishmentDemand from './pages/ReplenishmentDemand';
import ReplenishmentForecast from './pages/ReplenishmentForecast';
import ReplenishmentPlan from './pages/ReplenishmentPlan';
import ReplenishmentApproval from './pages/ReplenishmentApproval';
import ReplenishmentForm from './pages/ReplenishmentForm';
import ReplenishmentDetail from './pages/ReplenishmentDetail';
import StockCount from './pages/StockCount';
import StockCountForm from './pages/StockCountForm';
import StockCountDetail from './pages/StockCountDetail';
import Alerts from './pages/Alerts';
import ProductForm from './pages/ProductForm';
import ProductEditForm from './pages/ProductEditForm';
import ProductRequests from './pages/ProductRequests';
import ProductRequestForm from './pages/ProductRequestForm';
import ProductRequestDetail from './pages/ProductRequestDetail';
import ProductClassifications from './pages/ProductClassifications';
import ProductClassificationForm from './pages/ProductClassificationForm';
import ProductClassificationDetail from './pages/ProductClassificationDetail';
import PackageList from './pages/PackageList';
import PackageDetail from './pages/PackageDetail';
import PackageForm from './pages/PackageForm';
import TrackingList from './pages/TrackingList';
import TrackingDetail from './pages/TrackingDetail';
import LifecycleList from './pages/LifecycleList';
import LifecycleDetail from './pages/LifecycleDetail';
import Traceability from './pages/Traceability';
import TraceabilityDetail from './pages/TraceabilityDetail';
import DataQuality from './pages/DataQuality';
import Reports from './pages/Reports';
import ReportInventory from './pages/Reports/ReportInventory';
import ReportHistory from './pages/Reports/ReportHistory';
import ReportDispatch from './pages/Reports/ReportDispatch';
import ReportStockCount from './pages/Reports/ReportStockCount';
import ReportAging from './pages/Reports/ReportAging';
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
                <Route path="products" element={<ProductCatalog />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id/edit" element={<ProductEditForm />} />
                <Route path="products/:id" element={<ProductDetail />} />
                <Route path="warehouses" element={<Warehouses />} />
                <Route path="warehouses/:id" element={<WarehouseDetail />} />
                <Route path="inbound" element={<InboundOrders />} />
                <Route path="inbound/new" element={<InboundForm />} />
                <Route path="inbound/:id" element={<InboundDetail />} />
                <Route path="outbound" element={<OutboundOrders />} />
                <Route path="outbound/new" element={<OutboundForm />} />
                <Route path="outbound/:id" element={<OutboundDetail />} />
                <Route path="transfers" element={<StockTransfer />} />
                <Route path="transfers/new" element={<StockTransferForm />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="replenishment/demand" element={<ReplenishmentDemand />} />
                <Route path="replenishment/forecast" element={<ReplenishmentForecast />} />
                <Route path="replenishment/plan" element={<ReplenishmentPlan />} />
                <Route path="replenishment/approval" element={<ReplenishmentApproval />} />
                <Route path="replenishment/new" element={<ReplenishmentForm />} />
                <Route path="replenishment/:id" element={<ReplenishmentDetail />} />
                <Route path="replenishment/:id/edit" element={<ReplenishmentForm />} />
                <Route path="stock-count" element={<StockCount />} />
                <Route path="stock-count/new" element={<StockCountForm />} />
                <Route path="stock-count/:id" element={<StockCountDetail />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="product-requests" element={<ProductRequests />} />
                <Route path="product-requests/new" element={<ProductRequestForm />} />
                <Route path="product-requests/:id/edit" element={<ProductRequestForm />} />
                <Route path="product-requests/:id" element={<ProductRequestDetail />} />
                <Route path="product-classifications" element={<ProductClassifications />} />
                <Route path="product-classifications/new" element={<ProductClassificationForm />} />
                <Route path="product-classifications/:id/edit" element={<ProductClassificationForm />} />
                <Route path="product-classifications/:id" element={<ProductClassificationDetail />} />
                <Route path="packages" element={<PackageList />} />
                <Route path="packages/new" element={<PackageForm />} />
                <Route path="packages/:id" element={<PackageDetail />} />
                <Route path="tracking" element={<TrackingList />} />
                <Route path="tracking/:id" element={<TrackingDetail />} />
                <Route path="lifecycle" element={<LifecycleList />} />
                <Route path="lifecycle/:id" element={<LifecycleDetail />} />
                <Route path="traceability" element={<Traceability />} />
                <Route path="traceability/:id" element={<TraceabilityDetail />} />
                <Route path="data-quality" element={<DataQuality />} />
                <Route path="reports" element={<Reports />} />
                <Route path="reports/inventory" element={<ReportInventory />} />
                <Route path="reports/history" element={<ReportHistory />} />
                <Route path="reports/dispatch" element={<ReportDispatch />} />
                <Route path="reports/stock-count" element={<ReportStockCount />} />
                <Route path="reports/aging" element={<ReportAging />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
