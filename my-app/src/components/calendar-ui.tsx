import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

interface Event {
  id: number;
  title: string;
  time: string;
  description: string;
  meetingLink: string;
}

interface EventWithDate extends Event {
  date: string;
}

interface EventsMap {
  [key: string]: Event[];
}

export function CalendarUI() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [isRangeMode, setIsRangeMode] = useState<boolean>(false);
  const [events, setEvents] = useState<EventsMap>({});
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [eventTitle, setEventTitle] = useState<string>("");
  const [eventTime, setEventTime] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState<string>("");
  const [isRangeEvent, setIsRangeEvent] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        await api.post("/calendar", { events });
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [events]);

  const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames: string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (
    date: Date,
  ): { firstDay: number; daysInMonth: number } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const handlePrevMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = (): void => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleDateClick = (day: number): void => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    if (isRangeMode) {
      if (!rangeStart) {
        setRangeStart(newDate);
        setRangeEnd(null);
      } else if (!rangeEnd) {
        if (newDate >= rangeStart) {
          setRangeEnd(newDate);
        } else {
          setRangeEnd(rangeStart);
          setRangeStart(newDate);
        }
      } else {
        setRangeStart(newDate);
        setRangeEnd(null);
      }
    } else {
      setSelectedDate(newDate);
      setRangeStart(null);
      setRangeEnd(null);
    }
    setShowEventForm(false);
  };

  const getDatesInRange = (start: Date, end: Date): Date[] => {
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const handleAddEvent = (): void => {
    if (!eventTitle) return;

    const newEvent: Event = {
      id: Date.now(),
      title: eventTitle,
      time: eventTime,
      description: eventDescription,
      meetingLink: meetingLink,
    };

    if (isRangeEvent && rangeStart && rangeEnd) {
      const dates = getDatesInRange(rangeStart, rangeEnd);
      const updatedEvents: EventsMap = { ...events };
      dates.forEach((date) => {
        const dateKey = formatDateKey(date);
        updatedEvents[dateKey] = [
          ...(updatedEvents[dateKey] || []),
          { ...newEvent, id: Date.now() + Math.random() },
        ];
      });
      setEvents(updatedEvents);
    } else if (selectedDate) {
      const dateKey = formatDateKey(selectedDate);
      setEvents((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), newEvent],
      }));
    }

    setEventTitle("");
    setEventTime("");
    setEventDescription("");
    setMeetingLink("");
    setShowEventForm(false);
    setIsRangeEvent(false);
  };

  const handleDeleteEvent = (dateKey: string, eventId: number): void => {
    setEvents((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((e) => e.id !== eventId),
    }));
  };

  const isDateInRange = (date: Date): boolean => {
    if (!rangeStart) return false;
    if (!rangeEnd) return formatDateKey(date) === formatDateKey(rangeStart);
    return date >= rangeStart && date <= rangeEnd;
  };

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day,
      );
      const dateKey = formatDateKey(date);
      const dayEvents = events[dateKey] || [];
      const isSelected =
        selectedDate && formatDateKey(selectedDate) === dateKey;
      const isToday = new Date().toDateString() === date.toDateString();
      const inRange = isDateInRange(date);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`aspect-square p-1 sm:p-1.5 md:p-2 cursor-pointer transition-all duration-200 rounded-lg sm:rounded-xl border-2 relative group
            ${isSelected ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : ""}
            ${isToday && !isSelected ? "bg-accent border-primary" : ""}
            ${inRange && !isSelected ? "bg-muted border-ring" : ""}
            ${!isSelected && !isToday && !inRange ? "bg-card border-border hover:bg-accent hover:border-muted" : ""}
          `}
        >
          <div
            className={`text-[10px] sm:text-xs md:text-sm font-bold mb-0.5 sm:mb-1 ${isSelected ? "" : isToday ? "text-primary" : ""}`}
          >
            {day}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`text-[8px] sm:text-[10px] px-0.5 sm:px-1 md:px-1.5 py-0.5 rounded truncate font-medium
                  ${isSelected ? "bg-primary-foreground/20" : "bg-primary text-primary-foreground"}
                `}
              >
                <span className="hidden xs:inline">
                  {event.time && `${event.time} `}
                </span>
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div
                className={`text-[8px] sm:text-[10px] font-medium ${isSelected ? "opacity-80" : "text-muted-foreground"}`}
              >
                +{dayEvents.length - 2}
              </div>
            )}
          </div>
          {dayEvents.length > 0 && (
            <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary"></div>
          )}
        </div>,
      );
    }

    return days;
  };

  const selectedDateKey: string | null = selectedDate
    ? formatDateKey(selectedDate)
    : null;
  const selectedDateEvents: Event[] = selectedDateKey
    ? events[selectedDateKey] || []
    : [];

  const getRangeEvents = (): EventWithDate[] => {
    if (!rangeStart || !rangeEnd) return [];
    const dates = getDatesInRange(rangeStart, rangeEnd);
    const allEvents: EventWithDate[] = [];
    dates.forEach((date) => {
      const dateKey = formatDateKey(date);
      const dayEvents = events[dateKey] || [];
      dayEvents.forEach((event) => {
        allEvents.push({ ...event, date: dateKey });
      });
    });
    return allEvents;
  };

  const rangeEvents: EventWithDate[] =
    rangeStart && rangeEnd ? getRangeEvents() : [];

  return (
    <div className="min-h-screen bg-background rounded-2xl mt-5 p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 sm:mb-2">
            Calendar
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your schedule with ease
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg border border-border p-3 sm:p-4 md:p-6 lg:p-8">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-card-foreground">
                    {monthNames[currentDate.getMonth()]}
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                    {currentDate.getFullYear()}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted hover:bg-accent transition-all duration-200 hover:scale-105"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-muted hover:bg-accent transition-all duration-200 hover:scale-105"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                  </button>
                </div>
              </div>

              {/* Range Mode Toggle */}
              <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setIsRangeMode(!isRangeMode);
                    setRangeStart(null);
                    setRangeEnd(null);
                    setSelectedDate(null);
                  }}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
                    isRangeMode
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card text-foreground border-border hover:bg-muted"
                  }`}
                >
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">
                    {isRangeMode ? "Range Mode" : "Single Date"}
                  </span>
                  <span className="xs:hidden">
                    {isRangeMode ? "Range" : "Single"}
                  </span>
                </button>
                {isRangeMode && (
                  <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground bg-muted px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-border">
                    {!rangeStart && "Select start"}
                    {rangeStart && !rangeEnd && "Select end"}
                    {rangeStart && rangeEnd && (
                      <span className="block sm:inline">
                        <span className="hidden sm:inline">
                          {rangeStart.toLocaleDateString()} -{" "}
                          {rangeEnd.toLocaleDateString()}
                        </span>
                        <span className="sm:hidden">
                          {rangeStart.getMonth() + 1}/{rangeStart.getDate()} -{" "}
                          {rangeEnd.getMonth() + 1}/{rangeEnd.getDate()}
                        </span>
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-2 sm:mb-3">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center font-bold text-muted-foreground text-[10px] sm:text-xs md:text-sm py-1 sm:py-2"
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
                {renderCalendar()}
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl sm:rounded-3xl shadow-lg border border-border p-3 sm:p-4 md:p-6 lg:sticky lg:top-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-card-foreground">
                {rangeStart && rangeEnd ? (
                  "Range Events"
                ) : selectedDate ? (
                  <span className="block sm:inline">
                    <span className="hidden sm:inline">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="sm:hidden">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </span>
                ) : (
                  "Select a Date"
                )}
              </h3>

              {(selectedDate || (rangeStart && rangeEnd)) && (
                <button
                  onClick={() => setShowEventForm(!showEventForm)}
                  className="w-full mb-3 sm:mb-4 flex items-center justify-center gap-1.5 sm:gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:opacity-90 shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add Event
                </button>
              )}

              {showEventForm && (selectedDate || (rangeStart && rangeEnd)) && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-muted rounded-xl sm:rounded-2xl space-y-2 sm:space-y-3 border border-border">
                  {rangeStart && rangeEnd && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRangeEvent}
                        onChange={(e) => setIsRangeEvent(e.target.checked)}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded accent-primary"
                      />
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        Add to all dates
                      </span>
                    </label>
                  )}
                  <input
                    type="text"
                    placeholder="Event title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-background border-2 border-input rounded-lg sm:rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-background border-2 border-input rounded-lg sm:rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground"
                  />
                  <input
                    type="url"
                    placeholder="Meeting link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-background border-2 border-input rounded-lg sm:rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground placeholder:text-muted-foreground"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-background border-2 border-input rounded-lg sm:rounded-xl focus:ring-2 focus:ring-ring focus:border-ring transition-all resize-none text-foreground placeholder:text-muted-foreground"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddEvent}
                      className="flex-1 bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg sm:rounded-xl font-medium hover:opacity-90 shadow-md transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowEventForm(false);
                        setIsRangeEvent(false);
                      }}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-muted text-foreground rounded-lg sm:rounded-xl font-medium hover:bg-accent border-2 border-border transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto custom-scrollbar">
                {rangeStart && rangeEnd ? (
                  rangeEvents.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-muted" />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        No events in this range
                      </p>
                    </div>
                  ) : (
                    rangeEvents.map((event) => (
                      <div
                        key={`${event.date}-${event.id}`}
                        className="p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl border-2 border-border hover:border-muted hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-card-foreground text-xs sm:text-sm truncate">
                              {event.title}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                              {event.date}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteEvent(event.date, event.id)
                            }
                            className="text-destructive hover:bg-destructive/10 p-1 sm:p-1.5 rounded-lg transition-all flex-shrink-0 ml-2"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        {event.time && (
                          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                            <span className="truncate">{event.time}</span>
                          </div>
                        )}
                        {event.meetingLink && (
                          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm mb-1.5 sm:mb-2">
                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                            <a
                              href={event.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    ))
                  )
                ) : selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3 text-muted" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      No events scheduled
                    </p>
                  </div>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 sm:p-4 bg-card rounded-xl sm:rounded-2xl border-2 border-border hover:border-muted hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                        <h4 className="font-bold text-card-foreground text-xs sm:text-sm flex-1 min-w-0 truncate">
                          {event.title}
                        </h4>
                        <button
                          onClick={() =>
                            selectedDateKey &&
                            handleDeleteEvent(selectedDateKey, event.id)
                          }
                          className="text-destructive hover:bg-destructive/10 p-1 sm:p-1.5 rounded-lg transition-all flex-shrink-0 ml-2"
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      {event.time && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <span className="truncate">{event.time}</span>
                        </div>
                      )}
                      {event.meetingLink && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm mb-1.5 sm:mb-2">
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                          <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                      {event.description && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 sm:mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
