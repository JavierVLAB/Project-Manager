'use client';

import React, { useState, useEffect } from 'react';
import { Person } from '@/types';
import { useCalendarStore } from '@/stores/calendarStore';

interface AddEditPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  person?: Person;
}

/**
 * AddEditPersonDialog component for adding or editing a person
 * Follows Single Responsibility Principle: handles person CRUD operations
 */
export const AddEditPersonDialog: React.FC<AddEditPersonDialogProps> = ({
  isOpen,
  onClose,
  person,
}) => {
  const { updatePerson } = useCalendarStore();
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (person) {
      setName(person.name);
    } else {
      setName('');
    }
    setErrors({});
  }, [person, isOpen]);

  const validate = () => {
    const newErrors: { name?: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (person) {
      updatePerson(person.id, { name: name.trim() });
    }
    onClose();
  };

  if (!isOpen) return null;

  // Since we don't allow adding people directly, we can hide this dialog if no person is provided
  if (!person) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Edit Person
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
              {person ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};