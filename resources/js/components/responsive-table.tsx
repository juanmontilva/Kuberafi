import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  mobileLabel?: string; // Label específico para móvil
  priority?: 'high' | 'medium' | 'low'; // Prioridad de columna
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  mobileCardRender?: (item: T) => React.ReactNode; // Render personalizado para móvil
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  mobileCardRender,
}: ResponsiveTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Vista de tabla para desktop
  const TableView = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                className="text-left p-4 font-medium text-sm text-muted-foreground"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={cn(
                'border-b transition-colors',
                onRowClick && 'cursor-pointer hover:bg-muted/50'
              )}
            >
              {columns.map((column) => (
                <td key={column.key} className="p-4">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Vista de cards para móvil
  const MobileView = () => (
    <div className="md:hidden space-y-3">
      {data.map((item, index) => (
        <Card
          key={index}
          onClick={() => onRowClick?.(item)}
          className={cn(
            'p-4',
            onRowClick && 'cursor-pointer active:scale-[0.98] transition-transform'
          )}
        >
          {mobileCardRender ? (
            mobileCardRender(item)
          ) : (
            <div className="space-y-2">
              {columns
                .filter((col) => col.priority !== 'low')
                .map((column) => (
                  <div key={column.key} className="flex justify-between items-start gap-2">
                    <span className="text-sm text-muted-foreground min-w-[100px]">
                      {column.mobileLabel || column.label}:
                    </span>
                    <span className="text-sm font-medium text-right flex-1">
                      {column.render ? column.render(item) : item[column.key]}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <TableView />
      <MobileView />
    </>
  );
}
