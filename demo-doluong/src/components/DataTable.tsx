import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';

interface DataTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: ColumnsType<T>;
  onRowClick?: (record: T) => void;
  pageSize?: number;
  totalLabel?: string;
}

function DataTable<T extends { id?: string } = Record<string, unknown>>({
  columns,
  onRowClick,
  pageSize = 10,
  totalLabel = 'bản ghi',
  ...restProps
}: DataTableProps<T>) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <Table<T>
        columns={columns}
        size="middle"
        pagination={{
          pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} ${totalLabel}`,
          style: { padding: '0 16px' },
        }}
        scroll={{ x: 1100 }}
        onRow={onRowClick ? (record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: 'pointer' },
        }) : undefined}
        rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        {...restProps}
      />

      <style>{`
        .table-row-dark td {
          background: #fafbfc !important;
        }
        .table-row-light td {
          background: #fff !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #e8f4fd !important;
        }
        .ant-table-tbody > tr {
          transition: background 0.15s;
        }
        .ant-table-thead > tr > th {
          font-weight: 600 !important;
          font-size: 13px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.3px !important;
          color: #475569 !important;
          background: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          padding: 12px 16px !important;
        }
        .ant-table-tbody > tr > td {
          padding: 12px 16px !important;
          font-size: 13px !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
      `}</style>
    </div>
  );
}

export default DataTable;
