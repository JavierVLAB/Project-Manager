'use client';
import React, { useState, useEffect } from 'react';
import { Person, Assignment } from '@/types';
import { AssignmentBar } from './AssignmentBar';
import { assignmentsOverlap } from '@/utils/calendarUtils';
import { WeekDay } from '@/types';
import { useCalendarStore } from '@/stores/calendarStore';
import { useCapacity } from '@/hooks/useCapacity';

interface PersonRowProps {
  person: Person;
  assignments: Assignment[];
  weekDays: WeekDay[];
  onPercentageChange?: (assignmentId: string, percentage: number) => void;
  onDateRangeChange?: (assignmentId: string, startDate: Date, endDate: Date) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
}

/**
 * PersonRow component displays a single person's row with their assignments
 * Follows Single Responsibility Principle: only handles person row display
 */
export const PersonRow: React.FC<PersonRowProps> = ({ person, assignments, weekDays, onPercentageChange, onDateRangeChange, onDeleteAssignment }) => {
  const projects = useCalendarStore((state) => state.projects);
  const { getPersonCapacity, getCapacityColor } = useCapacity();
  const [capacity, setCapacity] = useState(0);
  const [capacityColor, setCapacityColor] = useState('green');

  useEffect(() => {
    const cap = getPersonCapacity(person.id);
    setCapacity(cap);
    setCapacityColor(getCapacityColor(cap));
  }, [person.id, getPersonCapacity, getCapacityColor]);

  // Calculate stack styles for overlapping assignments
  const getStackStyle = (assignment: Assignment): { height: string; top: string } => {
    // Group assignments by their time period (overlapping ones)
    const allOverlappingGroups: Assignment[][] = [];
    const processedAssignments = new Set<string>();

    assignments.forEach(assignment => {
      if (processedAssignments.has(assignment.id)) return;

      const group = assignments.filter(a =>
        !processedAssignments.has(a.id) && assignmentsOverlap(assignment, a)
      );

      group.forEach(a => processedAssignments.add(a.id));
      allOverlappingGroups.push(group);
    });

    // Find which group this assignment belongs to
    const assignmentGroup = allOverlappingGroups.find(group =>
      group.some(a => a.id === assignment.id)
    );

    if (!assignmentGroup) {
      return { height: '16px', top: '24px' }; // fallback
    }

    // Sort the group by ID for consistent ordering
    assignmentGroup.sort((a, b) => a.id.localeCompare(b.id));

    // Find this assignment's position in the stack
    const assignmentIndex = assignmentGroup.findIndex(a => a.id === assignment.id);

    // Calculate top position: center the first bar, then stack below
    const baseTop = 24; // Center of 64px container
    const top = baseTop + (assignmentIndex * 16);

    return {
      height: '16px', // Fixed height for all bars
      top: `${top}px`,
    };
  };

  return (
    <div className="flex gap-1 items-center">
      {/* Person info */}
      <div className="w-48 p-3 bg-white border rounded-lg shadow-sm">
        <div className="font-medium text-gray-900">{person.name}</div>
        <div className="text-sm text-gray-500">{person.role}</div>
        <div className="mt-2">
          <div className="text-xs text-gray-700 mb-1">Capacity: {capacity}%</div>
          <div className="w-full bg-gray-200 rounded-full h-3 border border-gray-300">
            <div
              className={`h-2.5 rounded-full mt-px ${
                capacityColor === 'green' ? 'bg-green-500' :
                capacityColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(capacity, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Single week container for assignment bars */}
      <div className="flex-1 relative bg-gray-50 border rounded-lg p-1" style={{ height: `${Math.max(64, assignments.length * 16 + 24)}px` }}>
        {/* Day grid lines */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex-1 border-r border-gray-200 last:border-r-0"></div>
          ))}
        </div>

        {assignments.map((assignment) => {
          const { height, top } = getStackStyle(assignment);
          return (
            <AssignmentBar
              key={assignment.id}
              assignment={assignment}
              weekDays={weekDays}
              projects={projects}
              onPercentageChange={onPercentageChange}
              onDateRangeChange={onDateRangeChange}
              onDelete={onDeleteAssignment}
              height={height}
              top={top}
            />
          );
        })}
      </div>
    </div>
  );
};