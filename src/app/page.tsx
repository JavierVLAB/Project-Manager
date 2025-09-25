'use client';

import { useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { WeeklyGrid } from '@/components/WeeklyGrid';
import { PersonRow } from '@/components/PersonRow';
import { ProjectLegend } from '@/components/ProjectLegend';
import { AddEditPersonDialog } from '@/components/AddEditPersonDialog';
import { AddEditProjectDialog } from '@/components/AddEditProjectDialog';
import { AddEditAssignmentDialog } from '@/components/AddEditAssignmentDialog';
import { useCalendarStore } from '@/stores/calendarStore';
import { pixelToDate, assignmentsOverlap, pixelWidthToDays, getWeekDays } from '@/utils/calendarUtils';

export default function Home() {
  const { people, assignments, updateAssignment, selectedWeek, goToPreviousWeek, goToNextWeek, goToToday } = useCalendarStore();
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

  const weekDays = getWeekDays(selectedWeek, 1);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active || !delta.x) return;

    const assignment = active.data.current?.assignment;
    const type = active.data.current?.type;
    if (!assignment) return;

    const containerWidth = 700; // Approximate width for 1 week

    if (type === 'move') {
      // Calculate new start date based on drag
      const newStartDate = pixelToDate(delta.x, containerWidth, weekDays);

      // Calculate duration
      const durationMs = new Date(assignment.endDate).getTime() - new Date(assignment.startDate).getTime();
      const newEndDate = new Date(newStartDate.getTime() + durationMs);

      // Check for overlaps with other assignments for the same person
      const personAssignments = assignments.filter(a => a.personId === assignment.personId && a.id !== assignment.id);
      const hasOverlap = personAssignments.some(other =>
        assignmentsOverlap({ startDate: newStartDate, endDate: newEndDate }, other)
      );

      if (!hasOverlap) {
        updateAssignment(assignment.id, {
          startDate: newStartDate,
          endDate: newEndDate,
        });
      }
      // If overlap, do nothing (could add feedback)
    } else if (type === 'resize') {
      // Calculate new width
      const newDays = pixelWidthToDays(delta.x, containerWidth);
      const newEndDate = new Date(assignment.startDate);
      newEndDate.setDate(newEndDate.getDate() + newDays - 1); // -1 because start day counts

      // Check for overlaps
      const personAssignments = assignments.filter(a => a.personId === assignment.personId && a.id !== assignment.id);
      const hasOverlap = personAssignments.some(other =>
        assignmentsOverlap({ startDate: assignment.startDate, endDate: newEndDate }, other)
      );

      if (!hasOverlap && newDays >= 1) {
        updateAssignment(assignment.id, {
          endDate: newEndDate,
        });
      }
    }
  };

  const handlePercentageChange = (assignmentId: string, percentage: number) => {
    updateAssignment(assignmentId, { percentage });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Weekly Resource Calendar - MVP Iteration 3
        </h1>

        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={goToPreviousWeek}
            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            ‹ Anterior
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Hoy
          </button>
          <button
            onClick={goToNextWeek}
            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Siguiente ›
          </button>
          <span className="text-gray-700">
            Semana del {selectedWeek.toLocaleDateString('es-ES')} al {new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
          </span>
        </div>

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setPersonDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Person
          </button>
          <button
            onClick={() => setProjectDialogOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add Project
          </button>
          <button
            onClick={() => setAssignmentDialogOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Add Assignment
          </button>
        </div>

        <div className="flex space-x-6">
          <div className="flex-1">
            <WeeklyGrid onDragEnd={handleDragEnd} selectedWeek={selectedWeek} weeks={1}>
              {people.map((person) => {
                const personAssignments = assignments.filter(
                  (assignment) => assignment.personId === person.id
                );
                return (
                  <PersonRow
                    key={person.id}
                    person={person}
                    assignments={personAssignments}
                    weekDays={weekDays}
                    onPercentageChange={handlePercentageChange}
                  />
                );
              })}
            </WeeklyGrid>
          </div>
          <ProjectLegend />
        </div>

        <AddEditPersonDialog
          isOpen={personDialogOpen}
          onClose={() => setPersonDialogOpen(false)}
        />
        <AddEditProjectDialog
          isOpen={projectDialogOpen}
          onClose={() => setProjectDialogOpen(false)}
        />
        <AddEditAssignmentDialog
          isOpen={assignmentDialogOpen}
          onClose={() => setAssignmentDialogOpen(false)}
        />
      </div>
    </div>
  );
}
