'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types';
import { useCalendarStore } from '@/stores/calendarStore';

interface AddEditProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

/**
 * AddEditProjectDialog component for adding or editing a project
 * Follows Single Responsibility Principle: handles project CRUD operations
 */
export const AddEditProjectDialog: React.FC<AddEditProjectDialogProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { addProject, updateProject } = useCalendarStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#000000');
  const [visible, setVisible] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; color?: string }>({});

  useEffect(() => {
    if (project) {
      setName(project.name);
      setColor(project.color);
      setVisible(project.visible !== undefined ? project.visible : true);
    } else {
      setName('');
      setColor('#000000');
      setVisible(true);
    }
    setErrors({});
  }, [project, isOpen]);

  const validate = () => {
    const newErrors: { name?: string; color?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!color) newErrors.color = 'Color is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (project) {
      updateProject(project.id, { name: name.trim(), color, visible });
    } else {
      addProject({ name: name.trim(), color, visible });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {project ? 'Edit Project' : 'Add Project'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-md"
            />
            {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
          </div>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span className="text-sm font-medium text-gray-700">Visible</span>
            </label>
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
              {project ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};