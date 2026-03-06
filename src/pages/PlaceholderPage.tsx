import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  breadcrumb?: string;
}

export default function PlaceholderPage({ title, description, breadcrumb }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        {breadcrumb && <p className="text-sm text-muted-foreground">{breadcrumb}</p>}
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{description}</p>
      </div>
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">This page is under construction. Check back soon!</p>
        </CardContent>
      </Card>
    </div>
  );
}
