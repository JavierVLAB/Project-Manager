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
}

/**
 * PersonRow component displays a single person's row with their assignments
 * Follows Single Responsibility Principle: only handles person row display
 */
export const PersonRow: React.FC<PersonRowProps> = ({ person, assignments, weekDays, onPercentageChange }) => {
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
    const overlapping = assignments.filter(a => assignmentsOverlap(assignment, a));
    if (overlapping.length === 1) {
      // Non-overlapping: center vertically
      return {
        height: `${assignment.percentage}%`,
        top: `${(100 - assignment.percentage) / 2}%`,
      };
    }
    overlapping.sort((a, b) => a.id.localeCompare(b.id)); // Sort by id for consistent ordering
    let cumulativeTop = 0;
    for (const a of overlapping) {
      if (a.id === assignment.id) {
        return {
          height: `${assignment.percentage}%`,
          top: `${cumulativeTop}%`,
        };
      }
      cumulativeTop += a.percentage;
    }
    return { height: `${assignment.percentage}%`, top: '0%' }; // fallback
  };

  return (
    <div className="grid grid-cols-8 gap-1 items-center">
      {/* Person info */}
      <div className="p-3 bg-white border rounded-lg shadow-sm">
        <div className="font-medium text-gray-900">{person.name}</div>
        <div className="text-sm text-gray-500">{person.role}</div>
        <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1">Capacity: {capacity}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                capacityColor === 'green' ? 'bg-green-500' :
                capacityColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(capacity, 150)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Single week container for assignment bars */}
      <div className="col-span-7 relative h-16 bg-gray-50 border rounded-lg p-1">
        {assignments.map((assignment) => {
          const { height, top } = getStackStyle(assignment);
          return (
            <AssignmentBar
              key={assignment.id}
              assignment={assignment}
              weekDays={weekDays}
              projects={projects}
              onPercentageChange={onPercentageChange}
              height={height}
              top={top}
            />
          );
        })}
      </div>
    </div>
  );
};