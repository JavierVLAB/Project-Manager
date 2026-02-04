'use client';

import { useState, useEffect } from 'react';
import { PersonRow } from '@/components/PersonRow';
import { useCalendarStore } from '@/stores/calendarStore';
import { getWeekInfo, WeekInfo } from '@/utils/calendarUtils';

export default function ViewOnlyPage() {
  const { people, assignments, selectedWeek, goToPreviousWeek, goToNextWeek, goToToday, loadData } = useCalendarStore();
  const [weeksInfo, setWeeksInfo] = useState<WeekInfo[]>([]);

  useEffect(() => {
    loadData();
    setWeeksInfo(getWeekInfo(selectedWeek, 8));
  }, [selectedWeek, loadData]);

  const handleGoToPreviousWeek = () => {
    goToPreviousWeek();
    setWeeksInfo(getWeekInfo(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000), 8));
  };

  const handleGoToNextWeek = () => {
    goToNextWeek();
    setWeeksInfo(getWeekInfo(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000), 8));
  };

  const handleGoToToday = () => {
    goToToday();
    // We need to update selectedWeek first, then get the new week info
    setTimeout(() => {
      setWeeksInfo(getWeekInfo(selectedWeek, 8));
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoToPreviousWeek}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ‹ Previous
            </button>
            <button
              onClick={handleGoToToday}
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Today
            </button>
            <button
              onClick={handleGoToNextWeek}
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Next ›
            </button>
            <span className="text-gray-700">
              Week of {selectedWeek.toLocaleDateString('en-US')} to {new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')}
            </span>
          </div>
        </div>

        <div className="flex space-x-6">
          <div className="flex-1">
            {/* Header */}
            <div className="mb-4 flex">
              <div className="w-48 p-2 font-semibold text-gray-700 bg-gray-100 border rounded">Person</div>
              {weeksInfo.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className={`flex-1 p-2 text-center font-semibold text-gray-700 bg-gray-100 border rounded ${weekIndex < 7 ? 'ml-1' : ''}`}
                >
                  <div className="text-sm">Week {week.weekNumber}</div>
                  <div className="text-xs">{week.displayDate}</div>
                </div>
              ))}
            </div>

            {/* Person rows */}
            <div className="space-y-4">
              {people.map((person) => {
                const personAssignments = assignments.filter(
                  (assignment) => assignment.personId === person.id
                );
                return (
                  <PersonRow
                    key={person.id}
                    person={person}
                    assignments={personAssignments}
                    weeksInfo={weeksInfo}
                    onPercentageChange={() => {}} // Empty function for view-only
                    onDateRangeChange={() => {}} // Empty function for view-only
                    onDeleteAssignment={() => {}} // Empty function for view-only
                    onLayerChange={() => {}} // Empty function for view-only
                    isViewOnly={true}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
