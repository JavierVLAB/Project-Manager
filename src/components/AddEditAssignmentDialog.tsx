'use client';

import React, { useState, useEffect } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [percentage, setPercentage] = useState(50);
  const [errors, setErrors] = useState<{
    personId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
    percentage?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) return;
    setPersonId('');
    setProjectId('');
    setStartDate('');
    setEndDate('');
    setPercentage(50);
    setErrors({});
  }, [isOpen]);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!personId) newErrors.personId = 'Person is required';
    if (!projectId) newErrors.projectId = 'Project is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (new Date(startDate) > new Date(endDate)) newErrors.endDate = 'End date must be after start date';
    if (percentage < 0 || percentage > 100) newErrors.percentage = 'Percentage must be between 0 and 100';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addAssignment({
      personId,
      projectId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      percentage,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Assignment</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Person
            </label>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a person</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} - {person.role}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.percentage && <p className="text-red-500 text-sm mt-1">{errors.percentage}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
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