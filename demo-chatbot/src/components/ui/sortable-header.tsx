'use client';

import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  className?: string;
}

/**
 * Sortable column header component
 * 
 * Behavior:
 * - Click header lần 1 → sort ascending (arrow up)
 * - Click header lần 2 (cùng cột) → sort descending (arrow down)
 * - Click header lần 3 (cùng cột) → clear sort (no arrow, về default)
 * - Click header cột khác → sort ascending cột mới
 * 
 * Visual:
 * - Không sort: text + ArrowUpDown icon (muted)
 * - Sort asc: text + ArrowUp icon
 * - Sort desc: text + ArrowDown icon
 */
export function SortableHeader({
  label,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  className,
}: SortableHeaderProps) {
  const isSorted = currentSortBy === sortKey;
  const isAsc = isSorted && currentSortOrder === 'asc';
  const isDesc = isSorted && currentSortOrder === 'desc';

  const handleClick = () => {
    if (!isSorted) {
      // Click cột mới → sort ascending
      onSort(sortKey, 'asc');
    } else if (isAsc) {
      // Click cùng cột lần 2 → sort descending
      onSort(sortKey, 'desc');
    } else {
      // Click cùng cột lần 3 → clear sort (reset về default)
      onSort('', 'asc');
    }
  };

  return (
    <TableHead className={`whitespace-nowrap${className ? ` ${className}` : ''}`}>
      <button
        onClick={handleClick}
        className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors"
      >
        <span>{label}</span>
        {!isSorted && <ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
        {isAsc && <ArrowUp className="h-4 w-4" />}
        {isDesc && <ArrowDown className="h-4 w-4" />}
      </button>
    </TableHead>
  );
}
