'use client';

import React from 'react';
import { useCalendarStore } from '@/stores/calendarStore';

export const ProjectLegend: React.FC = () => {
  const { projects } = useCalendarStore();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-64">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Legend</h3>
      <div className="space-y-2">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: project.color }}
            ></div>
            <span className="text-sm text-gray-700">{project.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};