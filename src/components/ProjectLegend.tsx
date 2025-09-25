'use client';

import React from 'react';
import { useCalendarStore } from '@/stores/calendarStore';

export const ProjectLegend: React.FC = () => {
  const { projects, updateProjectColor } = useCalendarStore();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-64">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Legend</h3>
      <div className="space-y-2">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded cursor-pointer"
              style={{ backgroundColor: project.color }}
              onClick={() => {
                const input = document.getElementById(`color-input-${project.id}`) as HTMLInputElement;
                input?.click();
              }}
            ></div>
            <input
              id={`color-input-${project.id}`}
              type="color"
              value={project.color}
              onChange={(e) => updateProjectColor(project.id, e.target.value)}
              style={{ display: 'none' }}
            />
            <span className="text-sm text-gray-700">{project.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};