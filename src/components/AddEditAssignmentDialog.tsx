'use client';

import React, { useState, useEffect } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { getWeekInfo, getISOWeekNumber } from '@/utils/calendarUtils';

interface WeekOption {
  value: string;
  label: string;
  startDate: Date;
  endDate: Date;
}

interface AddEditAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AddEditAssignmentDialog component for creating assignments manually
 * Follows Single Responsibility Principle: handles assignment creation
 */
export const AddEditAssignmentDialog: React.FC<AddEditAssignmentDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { people, projects, addAssignment } = useCalendarStore();
  const [personId, setPersonId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [startWeek, setStartWeek] = useState('');
  const [endWeek, setEndWeek] = useState('');
  const [percentage, setPercentage] = useState(50);
  const [errors, setErrors] = useState<{
    personId?: string;
    projectId?: string;
    startWeek?: string;
    endWeek?: string;
    percentage?: string;
  }>({});
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);

  // Generate week options for the next 52 weeks
  useEffect(() => {
    const options: WeekOption[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();

    // Generate weeks using the same week numbering as the weekly grid
    // First, find week 1 Monday using the same logic as the weekly grid
    
    // Find week 1 by checking dates around Jan 1
    let week1Monday = new Date(currentYear, 0, 1); // Default to Jan 1
    const jan1 = new Date(currentYear, 0, 1);
    
    // Try dates from Dec 28 of previous year to Jan 4 of current year to find week 1 Monday
    let testDate = new Date(currentYear - 1, 11, 28); // Dec 28 of previous year
    for (let i = 0; i < 14; i++) {
      const weekNumber = getISOWeekNumber(testDate);
      const dayOfWeek = testDate.getDay();
      
      if (weekNumber === 1 && dayOfWeek === 1) { // Week 1 and Monday
        week1Monday = new Date(testDate);
        week1Monday.setHours(0, 0, 0, 0);
        break;
      }
      
      testDate.setDate(testDate.getDate() + 1);
    }

    console.log('Week 1 Monday found:', week1Monday.toISOString().split('T')[0]);

    for (let weekNumber = 1; weekNumber <= 52; weekNumber++) {
      // Calculate start and end dates for each week (starting on Monday)
      const startDate = new Date(week1Monday);
      startDate.setDate(week1Monday.getDate() + (weekNumber - 1) * 7);
      startDate.setHours(0, 0, 0, 0); // Set time to 00:00:00

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
      
      // Verify the week number matches what the weekly grid uses
      const actualWeekNumber = getISOWeekNumber(startDate);
      console.log(`Week ${weekNumber} calculated as ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}, actual week number: ${actualWeekNumber}`);

      // Format date string for display
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      };

      options.push({
        value: weekNumber.toString(),
        label: `Week ${weekNumber} (${formatDate(startDate)} - ${formatDate(endDate)})`,
        startDate,
        endDate,
      });
    }

    console.log('Generated week options:', options.slice(0, 12));
    setWeekOptions(options);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setPersonId('');
    setProjectId('');
    setStartWeek('');
    setEndWeek('');
    setPercentage(50);
    setErrors({});
  }, [isOpen]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!personId) newErrors.personId = 'Person is required';
    if (!projectId) newErrors.projectId = 'Project is required';
    if (!startWeek) newErrors.startWeek = 'Start week is required';
    if (!endWeek) newErrors.endWeek = 'End week is required';
    if (parseInt(startWeek) > parseInt(endWeek)) newErrors.endWeek = 'End week must be after start week';
    if (percentage < 0 || percentage > 100) newErrors.percentage = 'Percentage must be between 0 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Find the selected start and end week dates
    const startWeekData = weekOptions.find(week => week.value === startWeek);
    const endWeekData = weekOptions.find(week => week.value === endWeek);

    if (startWeekData && endWeekData) {
      addAssignment({
        personId,
        projectId,
        startDate: startWeekData.startDate,
        endDate: endWeekData.endDate,
        percentage,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Add Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Person
            </label>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select a person</option>
               {people.filter(person => person.enabled !== false).map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            {errors.personId && <p className="text-red-500 text-sm mt-1">{errors.personId}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select a project</option>
              {projects.filter(project => project.visible).map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Week
            </label>
            <select
              value={startWeek}
              onChange={(e) => setStartWeek(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select a week</option>
              {weekOptions.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
            {errors.startWeek && <p className="text-red-500 text-sm mt-1">{errors.startWeek}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Week
            </label>
            <select
              value={endWeek}
              onChange={(e) => setEndWeek(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select a week</option>
              {weekOptions.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
            {errors.endWeek && <p className="text-red-500 text-sm mt-1">{errors.endWeek}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Percentage (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {errors.percentage && <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};