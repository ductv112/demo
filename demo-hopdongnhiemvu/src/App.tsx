import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import theme from './theme/themeConfig';
import { UserProvider } from './contexts/UserContext';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import TaskReception from './pages/TaskReception';
import TaskReceptionCreate from './pages/TaskReceptionCreate';
import TaskReceptionDetail from './pages/TaskReceptionDetail';
import TaskReceptionEdit from './pages/TaskReceptionEdit';
import Proposal from './pages/Proposal';
import ProposalCreate from './pages/ProposalCreate';
import ProposalDetail from './pages/ProposalDetail';
import ProposalEdit from './pages/ProposalEdit';
import Contract from './pages/Contract';
import ContractCreate from './pages/ContractCreate';
import ContractDetail from './pages/ContractDetail';
import ContractEdit from './pages/ContractEdit';
import ProgressTracking from './pages/ProgressTracking';
import Acceptance from './pages/Acceptance';
import AcceptanceDetail from './pages/AcceptanceDetail';
import Settlement from './pages/Settlement';
import SettlementDetail from './pages/SettlementDetail';
import Reports from './pages/Reports';
import Monitoring from './pages/Monitoring';
import MissionApproval from './pages/Approvals/MissionApproval';
import ContractApproval from './pages/Approvals/ContractApproval';
import ProposalApproval from './pages/Approvals/ProposalApproval';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import ApprovalAndSign from './pages/ApprovalAndSign';
import WBSEditor from './pages/WBSEditor';
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
                <Route path="missions" element={<TaskReception />} />
                <Route path="missions/create" element={<TaskReceptionCreate />} />
                <Route path="missions/:id" element={<TaskReceptionDetail />} />
                <Route path="missions/:id/edit" element={<TaskReceptionEdit />} />
                <Route path="proposals" element={<Proposal />} />
                <Route path="proposals/create" element={<ProposalCreate />} />
                <Route path="proposals/:id" element={<ProposalDetail />} />
                <Route path="proposals/:id/edit" element={<ProposalEdit />} />
                <Route path="approval-sign" element={<ApprovalAndSign />} />
                <Route path="approval-sign/workflow/:proposalId" element={<ApprovalWorkflow />} />
                <Route path="contracts" element={<Contract />} />
                <Route path="contracts/create" element={<ContractCreate />} />
                <Route path="contracts/:id/edit" element={<ContractEdit />} />
                <Route path="contracts/:id/wbs" element={<WBSEditor />} />
                <Route path="contracts/:id" element={<ContractDetail />} />
                <Route path="progress" element={<ProgressTracking />} />
                <Route path="acceptance" element={<Acceptance />} />
                <Route path="acceptance/:id" element={<AcceptanceDetail />} />
                <Route path="settlement" element={<Settlement />} />
                <Route path="settlement/:id" element={<SettlementDetail />} />
                <Route path="reports" element={<Reports />} />
                <Route path="monitoring" element={<Monitoring />} />
                <Route path="approvals/missions" element={<MissionApproval />} />
                <Route path="approvals/proposals" element={<ProposalApproval />} />
                <Route path="approvals/contracts" element={<ContractApproval />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
