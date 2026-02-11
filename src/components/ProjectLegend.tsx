'use client';

import React from 'react';
import { useCalendarStore } from '@/stores/calendarStore';

export const ProjectLegend: React.FC = () => {
  const { projects, updateProject } = useCalendarStore();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-64">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Legend</h3>
      <div className="space-y-2">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded flex-shrink-0"
              style={{ 
                backgroundColor: project.color,
                opacity: project.visible ? 1 : 0.5
              }}
            ></div>
            <span className={`text-sm flex-1 min-w-0 ${!project.visible ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {project.name}
            </span>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={project.visible}
                onChange={(e) => updateProject(project.id, { visible: e.target.checked })}
                disabled={!project.visible}
                className={`rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${!project.visible ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <span className={`text-xs ${!project.visible ? 'text-gray-400' : 'text-gray-600'}`}>Visible</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};