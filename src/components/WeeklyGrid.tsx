'use client';

import React from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, Modifier } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { getWeekDays } from '@/utils/calendarUtils';

interface WeeklyGridProps {
  children?: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  selectedWeek: Date;
  weeks?: number;
}

/**
 * WeeklyGrid component displays the calendar grid header with days
 * Follows Single Responsibility Principle: only handles grid layout
 * Now includes drag and drop context for assignment bars
 */
export const WeeklyGrid: React.FC<WeeklyGridProps> = ({ children, onDragStart, onDragEnd, selectedWeek, weeks = 1 }) => {
  const weekDays = getWeekDays(selectedWeek, weeks);

  const snapToDay: Modifier = ({ transform, active }) => {
    if (!active) return transform;

    const totalDays = weeks * 7;
    const dayWidth = 100; // 100px per day (matches the w-24 class)
    const snappedX = Math.round(transform.x / dayWidth) * dayWidth;

    return {
      ...transform,
      x: snappedX,
    };
  };

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis, snapToDay]}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="w-full">
        {/* Header with days */}
        <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: `auto repeat(${weeks * 7}, 1fr)` }}>
          <div className="p-2 font-semibold text-gray-700">Person</div>
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className="p-2 text-center font-semibold text-gray-700 bg-gray-100 rounded"
            >
              <div className="text-sm">{day.dayName}</div>
              <div className="text-lg">{day.dayNumber}</div>
            </div>
          ))}
        </div>

        {/* Content area for person rows */}
        <div className="space-y-2">
          {children}
        </div>
      </div>
      <DragOverlay />
    </DndContext>
  );
};