import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveChartProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  desktopHeight?: number;
  mobileHeight?: number;
  className?: string;
}

export function ResponsiveChart({
  title,
  description,
  icon,
  children,
  desktopHeight = 300,
  mobileHeight = 250,
  className,
}: ResponsiveChartProps) {
  const isMobile = useIsMobile();
  const height = isMobile ? mobileHeight : desktopHeight;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          {icon}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs md:text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
