import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricCard(props: {
  title: string;
  value: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{props.title}</CardTitle>
        {props.right}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{props.value}</div>
        {props.subtitle ? <p className="mt-1 text-xs text-muted-foreground">{props.subtitle}</p> : null}
      </CardContent>
    </Card>
  );
}
