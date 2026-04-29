import React from 'react';
import { Input, Select, Button, Typography } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  width?: number;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchText: string;
  searchPlaceholder?: string;
  onSearchChange: (text: string) => void;
  filters: FilterField[];
  resultCount: number;
  totalCount: number;
  onClearAll?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchText,
  searchPlaceholder = 'Tìm kiếm...',
  onSearchChange,
  filters,
  resultCount,
  totalCount,
  onClearAll,
}) => {
  const hasActiveFilter = searchText || filters.some((f) => f.value);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        flexWrap: 'wrap',
      }}
    >
      {/* Search */}
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        allowClear
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ flex: '1 1 250px', maxWidth: 360, minWidth: 200 }}
      />

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: '#e8e8e8', flexShrink: 0 }} />

      {/* Filter selects */}
      {filters.map((filter) => (
        <Select
          key={filter.key}
          placeholder={filter.placeholder}
          allowClear
          style={{
            flex: `0 1 ${filter.width || 150}px`,
            minWidth: 120,
          }}
          value={filter.value || undefined}
          onChange={(v) => filter.onChange(v || '')}
          options={filter.options}
        />
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Clear all button — only show when filters active */}
      {hasActiveFilter && onClearAll && (
        <Button
          type="text"
          icon={<ClearOutlined />}
          size="small"
          onClick={onClearAll}
          style={{ color: '#8c8c8c', fontSize: 12 }}
        >
          Xóa bộ lọc
        </Button>
      )}

      {/* Result count */}
      <Text style={{ fontSize: 13, color: '#8c8c8c', whiteSpace: 'nowrap' }}>
        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{resultCount}</span>
        {' / '}
        {totalCount} kết quả
      </Text>
    </div>
  );
};

export default FilterBar;
