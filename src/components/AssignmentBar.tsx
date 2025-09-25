'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Assignment, WeekDay, Project } from '@/types';
import { calculateAssignmentPosition } from '@/utils/calendarUtils';

interface AssignmentBarProps {
  assignment: Assignment;
  weekDays: WeekDay[];
  projects: Project[];
  onPercentageChange?: (assignmentId: string, percentage: number) => void;
  height: string | undefined;
  top: string;
}

/**
 * AssignmentBar component displays a single assignment as a colored bar
 * Follows Single Responsibility Principle: only handles assignment visualization
 * Now supports drag and drop, resize, and percentage editing
 */
export const AssignmentBar: React.FC<AssignmentBarProps> = ({
  assignment,
  weekDays,
  projects,
  onPercentageChange,
  height,
  top,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(assignment.percentage.toString());

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `assignment-${assignment.id}`,
    data: { assignment, weekDays, type: 'move' },
  });

  const { attributes: resizeAttributes, listeners: resizeListeners, setNodeRef: setResizeRef, transform: resizeTransform } = useDraggable({
    id: `resize-${assignment.id}`,
    data: { assignment, weekDays, type: 'resize' },
  });

  const position = calculateAssignmentPosition(
    assignment.startDate,
    assignment.endDate,
    weekDays
  );

  if (!position) return null;

  const project = projects.find((p) => p.id === assignment.projectId);
  const actualWidth = position.width;

  const style = {
    left: `${position.left}%`,
    width: `${actualWidth}%`,
    backgroundColor: project?.color || '#ccc',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    height,
    top,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(assignment.percentage.toString());
  };

  const handleEditSubmit = () => {
    const newPercentage = parseInt(editValue, 10);
    if (!isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100) {
      onPercentageChange?.(assignment.id, newPercentage);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  return (
    <>
      <div
       ref={setNodeRef}
       className="absolute rounded text-xs text-white flex items-center justify-center font-medium select-none"
       style={style}
       onClick={handleClick}
       title={`${project?.name || 'Unknown Project'} - ${assignment.percentage}%`}
     >
       {assignment.percentage}%
     </div>

      {/* Resize handle - Temporarily hidden */}
      <div
        ref={setResizeRef}
        className="absolute right-0 w-2 bg-black bg-opacity-20 cursor-ew-resize rounded-r"
        style={{
          left: `calc(${position.left}% + ${position.width}% - 8px)`,
          transform: resizeTransform ? `translate3d(${resizeTransform.x}px, ${resizeTransform.y}px, 0)` : undefined,
          height,
          top,
          display: 'none',
        }}
        {...resizeAttributes}
        {...resizeListeners}
      />

      {/* Percentage edit modal/input */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Edit Percentage</h3>
            <input
              type="number"
              min="0"
              max="100"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="border p-2 rounded w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};