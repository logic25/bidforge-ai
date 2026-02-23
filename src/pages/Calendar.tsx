import { useState, useMemo } from "react";
import { useRfps } from "@/hooks/useRfps";
import { useDeadlineEvents } from "@/hooks/useDeadlineEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfWeek, endOfWeek } from "date-fns";

const stageColors: Record<string, string> = {
  draft: "bg-blue-500",
  review: "bg-amber-500",
  submitted: "bg-green-500",
  won: "bg-emerald-600",
  lost: "bg-red-500",
};

type ViewMode = "month" | "agenda";

export default function CalendarPage() {
  const { rfps } = useRfps();
  const { events, createEvent, deleteEvent } = useDeadlineEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventType, setEventType] = useState("custom");
  const [eventDate, setEventDate] = useState("");

  // Build calendar events from RFP deadlines + custom events
  const calendarItems = useMemo(() => {
    const items: { id: string; date: Date; title: string; type: string; stage?: string; rfpId?: string }[] = [];

    rfps.forEach((rfp) => {
      if (rfp.deadline) {
        items.push({
          id: `rfp-${rfp.id}`,
          date: new Date(rfp.deadline),
          title: rfp.title,
          type: "deadline",
          stage: rfp.stage,
          rfpId: rfp.id,
        });
      }
    });

    events.forEach((evt) => {
      items.push({
        id: evt.id,
        date: new Date(evt.event_date),
        title: evt.title,
        type: evt.event_type,
        rfpId: evt.rfp_id || undefined,
      });
    });

    return items;
  }, [rfps, events]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => calendarItems.filter((e) => isSameDay(e.date, day));

  const handleAddEvent = () => {
    if (!eventTitle.trim() || !eventDate) return;
    createEvent.mutate({
      title: eventTitle,
      event_date: new Date(eventDate).toISOString(),
      event_type: eventType as any,
      description: eventDesc || undefined,
    });
    setAddEventOpen(false);
    setEventTitle("");
    setEventDesc("");
    setEventDate("");
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  // Agenda view: upcoming events sorted by date
  const agendaItems = [...calendarItems]
    .filter((e) => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 30);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Submission deadlines and key dates</p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setAddEventOpen(true); setEventDate(format(new Date(), "yyyy-MM-dd")); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        </div>
      </div>

      {viewMode === "month" ? (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px rounded-lg border bg-border overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
            ))}
            {days.map((day) => {
              const dayEvents = getEventsForDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[80px] bg-card p-1 cursor-pointer hover:bg-muted/50 transition-colors ${!inMonth ? "opacity-40" : ""} ${isToday(day) ? "ring-2 ring-inset ring-primary" : ""}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <p className={`text-xs font-medium mb-1 ${isToday(day) ? "text-primary" : ""}`}>{format(day, "d")}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((evt) => (
                      <div key={evt.id} className={`text-[10px] truncate rounded px-1 py-0.5 text-white ${evt.stage ? stageColors[evt.stage] || "bg-muted-foreground" : "bg-muted-foreground"}`}>
                        {evt.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected day events */}
          {selectedDate && (
            <Card>
              <CardContent className="py-4">
                <h3 className="font-medium text-sm mb-3">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No events</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayEvents.map((evt) => (
                      <div key={evt.id} className="flex items-center justify-between rounded-lg border p-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${evt.stage ? stageColors[evt.stage] : "bg-muted-foreground"}`} />
                          <div>
                            <p className="text-sm font-medium">{evt.title}</p>
                            <p className="text-xs text-muted-foreground capitalize">{evt.type}</p>
                          </div>
                        </div>
                        {evt.type !== "deadline" && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteEvent.mutate(evt.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Agenda View */
        <div className="space-y-2">
          {agendaItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No upcoming events</p>
          ) : (
            agendaItems.map((evt) => (
              <Card key={evt.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${evt.stage ? stageColors[evt.stage] : "bg-muted-foreground"}`} />
                    <div>
                      <p className="text-sm font-medium">{evt.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(evt.date, "MMM d, yyyy")} · <span className="capitalize">{evt.type}</span>
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{format(evt.date, "MMM d")}</Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Event Dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="review">Internal Review</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} rows={3} />
            </div>
            <Button onClick={handleAddEvent} disabled={!eventTitle.trim() || !eventDate} className="w-full">
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
