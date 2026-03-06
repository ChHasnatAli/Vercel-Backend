import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Apps &gt; Calendar</p>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Pick and manage your schedule dates.</p>
      </div>

      <Card className="bg-card border-border w-fit">
        <CardHeader>
          <CardTitle className="text-base">Date Picker</CardTitle>
          <CardDescription>Select a date from the calendar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CalendarPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border border-border"
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {selectedDate ? `Selected: ${format(selectedDate, "PPP")}` : "No date selected"}
            </p>
            {selectedDate && (
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(undefined)}>
                Clear selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
