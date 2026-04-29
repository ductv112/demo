'use client';

import { useEffect, useState } from 'react';
import { DashboardPeriod } from '@/types/dashboard';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';

interface DepartmentNode {
  id: string;
  name: string;
  children?: DepartmentNode[];
}

interface FlatDept {
  id: string;
  name: string;
  depth: number;
  label: string; // indented display label
}

function flattenTree(nodes: DepartmentNode[], depth = 0): FlatDept[] {
  const result: FlatDept[] = [];
  for (const node of nodes) {
    const indent = depth > 0 ? '\u00A0\u00A0\u00A0\u00A0'.repeat(depth) + '└ ' : '';
    result.push({ id: node.id, name: node.name, depth, label: indent + node.name });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, depth + 1));
    }
  }
  return result;
}

interface TimeFilterProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  departmentId?: string;
  onDepartmentChange?: (id: string | undefined) => void;
  showDepartmentFilter: boolean;
}

export function TimeFilter({
  period,
  onPeriodChange,
  departmentId,
  onDepartmentChange,
  showDepartmentFilter,
}: TimeFilterProps) {
  const t = useTranslations('dashboard');
  const [departments, setDepartments] = useState<FlatDept[]>([]);
  const [open, setOpen] = useState(false);

  const PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
    { value: 'day', label: t('periodFilterDay') },
    { value: 'week', label: t('periodFilterWeek') },
    { value: 'month', label: t('periodFilterMonth') },
    { value: 'quarter', label: t('periodFilterQuarter') },
  ];

  useEffect(() => {
    if (showDepartmentFilter) {
      api
        .get<{ data: DepartmentNode[] }>('/departments/tree')
        .then((res) => setDepartments(flattenTree(res.data.data || [])))
        .catch(() => setDepartments([]));
    }
  }, [showDepartmentFilter]);

  const selectedLabel = departmentId
    ? (departments.find((d) => d.id === departmentId)?.name ?? t('allDepartments'))
    : t('allDepartments');

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Period toggle buttons */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPeriodChange(opt.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
              period === opt.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Department filter — chỉ hiện cho admin */}
      {showDepartmentFilter && onDepartmentChange && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-52 h-9 text-xs justify-between font-normal"
            >
              <span className="truncate">{selectedLabel}</span>
              <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <Command>
              <CommandInput placeholder="Tìm phòng ban..." className="h-9 text-xs" />
              <CommandList className="max-h-64 overflow-y-auto">
                <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
                  Không tìm thấy phòng ban.
                </CommandEmpty>
                <CommandGroup>
                  {/* Tất cả phòng ban */}
                  <CommandItem
                    value="__all__"
                    onSelect={() => {
                      onDepartmentChange(undefined);
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-3.5 w-3.5',
                        !departmentId ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {t('allDepartments')}
                  </CommandItem>

                  {departments.map((dept) => (
                    <CommandItem
                      key={dept.id}
                      value={dept.name}
                      onSelect={() => {
                        onDepartmentChange(dept.id);
                        setOpen(false);
                      }}
                      className="text-xs"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-3.5 w-3.5 shrink-0',
                          departmentId === dept.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span style={{ paddingLeft: `${dept.depth * 12}px` }} className="truncate">
                        {dept.depth > 0 && (
                          <span className="text-muted-foreground mr-1">{'└'}</span>
                        )}
                        {dept.name}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
