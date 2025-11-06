'use client';

import { useState, useEffect } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { WeeklyGrid } from '@/components/WeeklyGrid';
import { PersonRow } from '@/components/PersonRow';
import { ProjectLegend } from '@/components/ProjectLegend';
import { AddEditPersonDialog } from '@/components/AddEditPersonDialog';
import { AddEditProjectDialog } from '@/components/AddEditProjectDialog';
import { AddEditAssignmentDialog } from '@/components/AddEditAssignmentDialog';
import { useCalendarStore } from '@/stores/calendarStore';
import { pixelToDate, assignmentsOverlap, pixelWidthToDays, getWeekDays, getFirstMondayOfMonth, getLastSundayOfMonth } from '@/utils/calendarUtils';

export default function Home() {
  const { people, projects, assignments, updateAssignment, selectedWeek, goToPreviousWeek, goToNextWeek, goToToday, loadData, saveAllData, deleteAssignment, updatePerson, updateProject, updateProjectColor, deletePerson, deleteProject, setSelectedWeek } = useCalendarStore();
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'edit-persons' | 'edit-projects'>('home' as 'home' | 'edit-persons' | 'edit-projects');
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedProjectForColor, setSelectedProjectForColor] = useState<string | null>(null);
  const [showDeletePersonDialog, setShowDeletePersonDialog] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weekDays = getWeekDays(selectedWeek, viewMode === 'month' ? 4 : 1);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active || !delta.x) return;

    const assignment = active.data.current?.assignment;
    const type = active.data.current?.type;
    if (!assignment) return;

    const containerWidth = weekDays.length * 100; // Width based on number of days (100px per day)

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

  const handleDateRangeChange = (assignmentId: string, startDate: Date, endDate: Date) => {
    updateAssignment(assignmentId, { startDate, endDate });
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(selectedWeek);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedWeek(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(selectedWeek);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedWeek(newDate);
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setSelectedWeek(today);
  };

  const colorPalette = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#14B8A6', // Teal
    '#6366F1', // Indigo
    '#22C55E', // Emerald
    '#FACC15', // Amber
    '#FB7185', // Rose
    '#A78BFA', // Violet
    '#34D399', // Light Green
    '#60A5FA', // Light Blue
    '#A3A3A3', // Light Gray
    '#94A3B8', // Slate
  ];

  const handleColorSelect = (color: string) => {
    if (selectedProjectForColor) {
      updateProjectColor(selectedProjectForColor, color);
      setShowColorPicker(false);
      setSelectedProjectForColor(null);
    }
  };

  const handleDeletePersonClick = (personId: string) => {
    console.log('handleDeletePersonClick called with personId:', personId);
    setPersonToDelete(personId);
    setShowDeletePersonDialog(true);
  };

  const handleDeletePersonConfirm = () => {
    console.log('handleDeletePersonConfirm called with personToDelete:', personToDelete);
    if (personToDelete) {
      deletePerson(personToDelete);
      setShowDeletePersonDialog(false);
      setPersonToDelete(null);
    }
  };

  const handleDeletePersonCancel = () => {
    setShowDeletePersonDialog(false);
    setPersonToDelete(null);
  };


  const renderHomeView = () => (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {viewMode === 'month' ? 'Monthly' : 'Weekly'} Resource Calendar - MVP Iteration 3
        </h1>

        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={viewMode === 'month' ? goToPreviousMonth : goToPreviousWeek}
            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            ‹ {viewMode === 'month' ? 'Mes Anterior' : 'Anterior'}
          </button>
          <button
            onClick={viewMode === 'month' ? goToCurrentMonth : goToToday}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {viewMode === 'month' ? 'Mes Actual' : 'Hoy'}
          </button>
          <button
            onClick={viewMode === 'month' ? goToNextMonth : goToNextWeek}
            className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            {viewMode === 'month' ? 'Mes Siguiente' : 'Siguiente'} ›
          </button>
          <span className="text-gray-700">
            {viewMode === 'month'
              ? `Mes de ${selectedWeek.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
              : `Semana del ${selectedWeek.toLocaleDateString('es-ES')} al ${new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}`
            }
          </span>
        </div>

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setAssignmentDialogOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Add Assignment
          </button>
          <button
            onClick={() => setCurrentView('edit-persons')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Persons
          </button>
          <button
            onClick={() => setCurrentView('edit-projects')}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Edit Projects
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            {viewMode === 'week' ? 'Month View' : 'Week View'}
          </button>
          <button
            onClick={saveAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Save All Data
          </button>
        </div>

        <div className="flex">
          {/* Scrollable calendar area */}
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max">
              {/* Header with days */}
              <div className="mb-4 flex">
                <div className="w-48 p-2 font-semibold text-gray-700 bg-gray-100 border rounded">Person</div>
                {weekDays.map((day, index) => (
                  <div
                    key={day.date.toISOString()}
                    className={`w-24 p-2 text-center font-semibold text-gray-700 bg-gray-100 border rounded ${index < weekDays.length - 1 ? 'mr-1' : ''}`}
                  >
                    <div className="text-sm">{day.dayName}</div>
                    <div className="text-lg">{day.dayNumber}</div>
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
                      weekDays={weekDays}
                      onPercentageChange={handlePercentageChange}
                      onDateRangeChange={handleDateRangeChange}
                      onDeleteAssignment={deleteAssignment}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Fixed Project Legend */}
          <div className="ml-6 flex-shrink-0 w-64">
            <div className="sticky top-8">
              <ProjectLegend />
            </div>
          </div>
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

  const renderEditPersonsView = () => {

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Persons</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('Add Person button clicked');
                  setPersonDialogOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Person
              </button>
              <button
                onClick={saveAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Save All Data
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Persons List</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {people.map((person) => (
                <div key={person.id} className="p-6 hover:bg-gray-50 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => updatePerson(person.id, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input
                          type="text"
                          value={person.role}
                          onChange={(e) => updatePerson(person.id, { role: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delete button - appears on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete button clicked for person:', person.id);
                      handleDeletePersonClick(person.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                    title="Delete person"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEditProjectsView = () => {

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Projects</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('Add Project button clicked');
                  setProjectDialogOpen(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Project
              </button>
              <button
                onClick={saveAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Save All Data
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Projects List</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="block text-sm font-medium text-gray-700">Color</label>
                      <button
                        onClick={() => {
                          setSelectedProjectForColor(project.id);
                          setShowColorPicker(true);
                        }}
                        className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer flex items-center justify-center"
                      >
                        <div
                          className="w-8 h-8 rounded border border-gray-200"
                          style={{ backgroundColor: project.color }}
                        ></div>
                      </button>
                    </div>
                  </div>

                  {/* Delete button - appears on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete project button clicked for project:', project.id);
                      deleteProject(project.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                    title="Delete project"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'edit-persons') {
    return (
      <>
        {renderEditPersonsView()}

        {/* Add Person Dialog */}
        <AddEditPersonDialog
          isOpen={personDialogOpen}
          onClose={() => setPersonDialogOpen(false)}
        />

        {/* Delete Person Confirmation Dialog */}
        {showDeletePersonDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Delete Person</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this person? This will also delete all their assignments and cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeletePersonCancel}
                  className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Delete button clicked in dialog');
                    handleDeletePersonConfirm();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Choose Color</h3>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setSelectedProjectForColor(null);
                  }}
                  className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentView === 'edit-projects') {
    return (
      <>
        {renderEditProjectsView()}

        {/* Add Project Dialog */}
        <AddEditProjectDialog
          isOpen={projectDialogOpen}
          onClose={() => setProjectDialogOpen(false)}
        />

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Choose Color</h3>
              <div className="grid grid-cols-5 gap-3 mb-4">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowColorPicker(false);
                    setSelectedProjectForColor(null);
                  }}
                  className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return renderHomeView();
}
