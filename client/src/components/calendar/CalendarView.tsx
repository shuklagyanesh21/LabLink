import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import MeetingModal from "./MeetingModal";
import { type Meeting, type Member } from "@shared/schema";
import { formatDisplayDate, formatDisplayTime, getMeetingTypeColor } from "@/utils/dateUtils";
import { format, startOfWeek, startOfMonth, endOfMonth, addDays, parseISO, isSameMonth, isToday } from "date-fns";

export default function CalendarView() {
  const { adminMode } = useAppContext();
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings']
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['/api/members']
  });

  const membersMap = new Map(members.map(m => [m.id, m]));

  const handleTimeSlotClick = (date: string, time: string) => {
    if (adminMode) {
      setSelectedDate(date);
      setShowMeetingModal(true);
    }
  };

  const getCurrentWeekDays = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getCurrentMonthDays = () => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    
    const days = [];
    let currentDate = calendarStart;
    
    // Get 6 weeks worth of days to ensure full month coverage
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        days.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }
    }
    
    return { days, monthStart: monthStart };
  };

  const timeSlots = [
    "09:00", "09:15", "09:30", "09:45",
    "10:00", "10:15", "10:30", "10:45",
    "11:00", "11:15", "11:30", "11:45",
    "12:00", "12:15", "12:30", "12:45",
    "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45"
  ];

  const weekDays = getCurrentWeekDays();
  const { days: monthDays, monthStart } = getCurrentMonthDays();

  const getMeetingsForDateAndTime = (date: Date, timeSlot: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return meetings.filter(meeting => {
      if (meeting.date !== dateStr) return false;
      
      // Parse meeting start and end times
      const [meetingStartHour, meetingStartMin] = meeting.startTime.split(':').map(Number);
      const [meetingEndHour, meetingEndMin] = meeting.endTime.split(':').map(Number);
      const [slotHour, slotMin] = timeSlot.split(':').map(Number);
      
      // Convert times to minutes for easier comparison
      const meetingStartMinutes = meetingStartHour * 60 + meetingStartMin;
      const meetingEndMinutes = meetingEndHour * 60 + meetingEndMin;
      const slotMinutes = slotHour * 60 + slotMin;
      const slotEndMinutes = slotMinutes + 15; // Each slot represents 15 minutes
      
      // Check if meeting overlaps with this time slot
      return (meetingStartMinutes < slotEndMinutes && meetingEndMinutes > slotMinutes);
    });
  };

  const getMeetingTypeDisplay = (type: string) => {
    switch (type) {
      case 'PaperPresentation':
        return 'Paper Presentation';
      case 'WorkPresentation':
        return 'Work Presentation';
      case 'Tutorial':
        return 'Tutorial';
      default:
        return type;
    }
  };

  return (
    <div data-testid="calendar-view">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Calendar</h2>
          <p className="text-gray-600 mt-1">Lab meeting schedule</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Calendar Controls */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-none"
              data-testid="button-week-view"
            >
              Week
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
              className="rounded-none"
              data-testid="button-month-view"
            >
              Month
            </Button>
          </div>
          
          {adminMode && (
            <Button
              onClick={() => setShowMeetingModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-add-meeting"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Meeting Type Legend */}
      <Card className="mb-6 p-4" data-testid="meeting-legend">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Meeting Types</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Paper Presentation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Work Presentation</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Tutorial</span>
          </div>
        </div>
      </Card>

      {/* Calendar Grid */}
      {viewMode === "week" && (
        <Card className="p-6" data-testid="calendar-grid">
          <div className="calendar-grid">
            {/* Time Column Header */}
            <div className="h-12 border-b border-gray-200"></div>

            {/* Day Headers */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="h-12 border-b border-gray-200 flex items-center justify-center text-sm font-medium">
                <div className="text-center">
                  <div>{format(day, 'EEE')}</div>
                  <div className="text-xs text-gray-500">{format(day, 'MMM dd')}</div>
                </div>
              </div>
            ))}

            {/* Time slots and content */}
            {timeSlots.map((timeSlot) => (
              <React.Fragment key={`timeslot-${timeSlot}`}>
                {/* Time label - only show for hour slots */}
                <div className={`calendar-time-slot flex items-center justify-center text-xs ${
                  timeSlot.endsWith(':00') ? 'text-gray-700 font-medium border-t border-gray-300' : ''
                }`}>
                  {timeSlot.endsWith(':00') ? timeSlot : ''}
                </div>

                {/* Day columns */}
                {weekDays.map((day) => {
                  const dayMeetings = getMeetingsForDateAndTime(day, timeSlot);
                  const dateStr = format(day, 'yyyy-MM-dd');
                  
                  return (
                    <div 
                      key={`${day.toISOString()}-${timeSlot}`}
                      className={`calendar-time-slot relative cursor-pointer hover:bg-gray-50 ${
                        timeSlot.endsWith(':00') ? 'border-t border-gray-300' : ''
                      }`}
                      onClick={() => handleTimeSlotClick(dateStr, timeSlot)}
                      data-testid={`time-slot-${dateStr}-${timeSlot}`}
                    >
                      {dayMeetings.map((meeting) => {
                        const presenter = membersMap.get(meeting.presenterId);
                        const colors = getMeetingTypeColor(meeting.type);
                        
                        // Calculate meeting position and height based on start time and duration
                        const [meetingStartHour, meetingStartMin] = meeting.startTime.split(':').map(Number);
                        const [meetingEndHour, meetingEndMin] = meeting.endTime.split(':').map(Number);
                        const [slotHour, slotMin] = timeSlot.split(':').map(Number);
                        
                        const meetingStartMinutes = meetingStartHour * 60 + meetingStartMin;
                        const meetingEndMinutes = meetingEndHour * 60 + meetingEndMin;
                        const slotMinutes = slotHour * 60 + slotMin;
                        
                        // Only show the meeting in the first slot it appears in
                        const isFirstSlot = meetingStartMinutes >= slotMinutes && meetingStartMinutes < slotMinutes + 15;
                        
                        if (!isFirstSlot) return null;
                        
                        // Calculate the height based on meeting duration
                        const durationMinutes = meetingEndMinutes - meetingStartMinutes;
                        const heightInSlots = Math.ceil(durationMinutes / 15);
                        const meetingHeight = `${heightInSlots * 1.5}rem`;
                        
                        return (
                          <div
                            key={meeting.id}
                            className="absolute left-1 right-1 rounded border-l-4 p-1 text-xs z-10"
                            style={{
                              backgroundColor: colors.background,
                              borderLeftColor: colors.border,
                              color: colors.text,
                              height: meetingHeight,
                              top: '0.125rem'
                            }}
                            data-testid={`calendar-meeting-${meeting.id}`}
                          >
                            <div className="font-medium truncate">
                              {meeting.title}
                            </div>
                            <div className="opacity-75 truncate">
                              {formatDisplayTime(meeting.startTime)} - {formatDisplayTime(meeting.endTime)}
                            </div>
                            <div className="opacity-75 truncate">
                              {presenter?.name || 'Unknown'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </Card>
      )}

      {/* Month View */}
      {viewMode === "month" && (
        <Card className="p-6" data-testid="calendar-grid-month">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{format(monthStart, 'MMMM yyyy')}</h3>
          </div>
          
          {/* Month calendar header */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="p-3 text-center border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">{day}</span>
              </div>
            ))}
          </div>
          
          {/* Month calendar grid */}
          <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
            {monthDays.map((day, index) => {
              const dayMeetings = meetings?.filter(meeting => 
                format(parseISO(meeting.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
              ) || [];
              
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-32 p-2 border-b border-r border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                  } ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => handleTimeSlotClick(format(day, 'yyyy-MM-dd'), '09:00')}
                  data-testid={`calendar-cell-${format(day, 'yyyy-MM-dd')}`}
                >
                  <div className={`text-sm font-medium mb-2 ${isCurrentDay ? 'text-blue-600 font-bold' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 3).map((meeting) => {
                      const presenter = membersMap.get(meeting.presenterId);
                      const colors = getMeetingTypeColor(meeting.type);
                      
                      return (
                        <div
                          key={meeting.id}
                          className="text-xs p-1 rounded font-medium truncate border-l-2"
                          style={{
                            backgroundColor: colors.background,
                            borderLeftColor: colors.border,
                            color: colors.text
                          }}
                          title={`${meeting.title} - ${formatDisplayTime(meeting.startTime)} to ${formatDisplayTime(meeting.endTime)} (${presenter?.name || 'Unknown'})`}
                          data-testid={`meeting-${meeting.id}`}
                        >
                          {meeting.title}
                        </div>
                      );
                    })}
                    {dayMeetings.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayMeetings.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Meeting Modal */}
      {showMeetingModal && (
        <MeetingModal
          isOpen={showMeetingModal}
          onClose={() => {
            setShowMeetingModal(false);
            setSelectedDate("");
          }}
          defaultDate={selectedDate}
        />
      )}
    </div>
  );
}
