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
  onDateRangeChange?: (assignmentId: string, startDate: Date, endDate: Date) => void;
  onDelete?: (assignmentId: string) => void;
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
  onDateRangeChange,
  onDelete,
  height,
  top,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(assignment.percentage.toString());
  const [startDateValue, setStartDateValue] = useState(assignment.startDate.toISOString().split('T')[0]);
  const [endDateValue, setEndDateValue] = useState(assignment.endDate.toISOString().split('T')[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Temporarily disable drag functionality to test delete button
  // const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
  //   id: `assignment-${assignment.id}`,
  //   data: { assignment, weekDays, type: 'move' },
  // });

  // const { attributes: resizeAttributes, listeners: resizeListeners, setNodeRef: setResizeRef, transform: resizeTransform } = useDraggable({
  //   id: `resize-${assignment.id}`,
  //   data: { assignment, weekDays, type: 'resize' },
  // });

  const attributes = {};
  const listeners = {};
  const setNodeRef = () => {};
  const transform = null;
  const isDragging = false;

  const resizeAttributes = {};
  const resizeListeners = {};
  const setResizeRef = () => {};
  const resizeTransform = null;

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
    transform: 'none',
    opacity: 1,
    height,
    top,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(assignment.percentage.toString());
    setStartDateValue(assignment.startDate.toISOString().split('T')[0]);
    setEndDateValue(assignment.endDate.toISOString().split('T')[0]);
  };

  const handleEditSubmit = () => {
    const newPercentage = parseInt(editValue, 10);
    const newStartDate = new Date(startDateValue);
    const newEndDate = new Date(endDateValue);

    if (!isNaN(newPercentage) && newPercentage >= 0 && newPercentage <= 100 &&
        !isNaN(newStartDate.getTime()) && !isNaN(newEndDate.getTime()) &&
        newStartDate <= newEndDate) {
      // Update percentage
      onPercentageChange?.(assignment.id, newPercentage);

      // Update dates if they changed
      if (newStartDate.getTime() !== assignment.startDate.getTime() ||
          newEndDate.getTime() !== assignment.endDate.getTime()) {
        onDateRangeChange?.(assignment.id, newStartDate, newEndDate);
      }
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Delete button clicked for assignment:', assignment.id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete?.(assignment.id);
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
       ref={setNodeRef}
       className="absolute rounded text-xs text-white flex items-center justify-center font-medium select-none relative group"
       style={style}
       onClick={handleClick}
       onMouseEnter={() => setIsHovered(true)}
       onMouseLeave={() => setIsHovered(false)}
       title={`${project?.name || 'Unknown Project'} - ${assignment.percentage}%`}
       {...attributes}
       {...listeners}
     >
       {assignment.percentage}%

       {/* Delete button - appears on hover */}
       {isHovered && (
         <div
           className="absolute -top-1 -right-1 w-4 h-4 z-20"
           onMouseDown={(e) => {
             e.stopPropagation();
             e.preventDefault();
             console.log('Delete button mouse down');
           }}
           onClick={handleDeleteClick}
         >
           <div className="w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-80 hover:opacity-100 transition-opacity cursor-pointer select-none">
             ×
           </div>
         </div>
       )}
     </div>

      {/* Resize handle - Temporarily hidden */}
      <div
        ref={setResizeRef}
        className="absolute right-0 w-2 bg-black bg-opacity-20 cursor-ew-resize rounded-r"
        style={{
          left: `calc(${position.left}% + ${position.width}% - 8px)`,
          transform: 'none',
          height,
          top,
          display: 'none',
        }}
        {...resizeAttributes}
        {...resizeListeners}
      />

      {/* Percentage and date range edit modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Edit Assignment</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="border p-2 rounded w-full text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDateValue}
                  onChange={(e) => setStartDateValue(e.target.value)}
                  className="border p-2 rounded w-full text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDateValue}
                  onChange={(e) => setEndDateValue(e.target.value)}
                  className="border p-2 rounded w-full text-gray-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleEditCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Delete Assignment</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to delete this assignment?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};