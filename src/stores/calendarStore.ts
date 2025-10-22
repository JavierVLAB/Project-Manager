import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Person, Project, Assignment } from '@/types';
import { snapToWeek } from '@/utils/calendarUtils';
import Papa from 'papaparse';

// Custom reviver to convert date strings back to Date objects
const dateReviver = (key: string, value: unknown) => {
  if (key === 'startDate' || key === 'endDate' || key === 'selectedWeek') {
    return typeof value === 'string' ? new Date(value) : value;
  }
  return value;
};

interface CalendarState {
  people: Person[];
  projects: Project[];
  assignments: Assignment[];
  selectedWeek: Date;
}

interface CalendarActions {
  addPerson: (person: Omit<Person, 'id'>) => Promise<void>;
  updatePerson: (id: string, updates: Partial<Omit<Person, 'id'>>) => void;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  updateProjectColor: (id: string, color: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id'>>) => void;
  deleteAssignment: (id: string) => void;
  deletePerson: (id: string) => void;
  deleteProject: (id: string) => void;
  getPersonCapacity: (personId: string) => number;
  validateCapacity: (personId: string, additionalPercentage?: number) => boolean;
  setSelectedWeek: (week: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  loadData: () => Promise<void>;
  saveAllData: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState & CalendarActions>()(
  persist(
    (set, get) => ({
  selectedWeek: snapToWeek(new Date()),
  people: [],
  projects: [],
  assignments: [],
  addPerson: async (person) => {
    const newPerson = { ...person, id: Date.now().toString() };
    set((state) => ({
      people: [...state.people, newPerson],
    }));

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: person.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add person to CSV');
      }
    } catch (error) {
      console.error('Error adding person to CSV:', error);
      // Revert the addition
      set((state) => ({
        people: state.people.filter(p => p.id !== newPerson.id),
      }));
    }
  },
  updatePerson: (id, updates) => set((state) => ({
    people: state.people.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  addProject: async (project) => {
    const newProject = { ...project, id: Date.now().toString() };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: project.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add project to CSV');
      }
    } catch (error) {
      console.error('Error adding project to CSV:', error);
      // Revert the addition
      set((state) => ({
        projects: state.projects.filter(p => p.id !== newProject.id),
      }));
    }
  },
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  updateProjectColor: (id, color) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, color } : p),
  })),
  addAssignment: async (assignment) => {
    console.log('addAssignment called with:', assignment);
    if (!get().validateCapacity(assignment.personId, assignment.percentage)) {
      console.warn('Capacity limit exceeded, assignment not added');
      return;
    }
    const newAssignment = { ...assignment, id: Date.now().toString() };
    console.log('New assignment to add:', newAssignment);
    set((state) => ({
      assignments: [...state.assignments, newAssignment],
    }));

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: assignment.personId,
          projectId: assignment.projectId,
          startDate: assignment.startDate.toISOString(),
          endDate: assignment.endDate.toISOString(),
          percentage: assignment.percentage,
        }),
      });
      console.log('API response:', response.status);

      if (!response.ok) {
        throw new Error('Failed to add assignment to CSV');
      }
    } catch (error) {
      console.error('Error adding assignment to CSV:', error);
      // Revert the addition
      set((state) => ({
        assignments: state.assignments.filter(a => a.id !== newAssignment.id),
      }));
    }
  },
  updateAssignment: async (id, updates) => {
    const state = get();
    const updatedAssignments = state.assignments.map(a => a.id === id ? { ...a, ...updates } : a);
    const updatedAssignment = updatedAssignments.find(a => a.id === id);
    if (updatedAssignment && !state.validateCapacity(updatedAssignment.personId)) {
      console.warn('Capacity limit exceeded, assignment not updated');
      return;
    }

    set({
      assignments: updatedAssignments,
    });

    // Save all assignments to CSV after update
    try {
      const assignmentsResponse = await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: updatedAssignments.map(a => ({
            personId: a.personId,
            projectId: a.projectId,
            startDate: a.startDate instanceof Date && !isNaN(a.startDate.getTime()) ? a.startDate.toISOString() : a.startDate,
            endDate: a.endDate instanceof Date && !isNaN(a.endDate.getTime()) ? a.endDate.toISOString() : a.endDate,
            percentage: a.percentage,
          }))
        }),
      });

      if (!assignmentsResponse.ok) {
        throw new Error('Failed to save assignments');
      }
    } catch (error) {
      console.error('Error saving assignments after update:', error);
    }
  },
  getPersonCapacity: (personId) => {
    const state = get();
    const weekStart = state.selectedWeek;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 1 week - 1 day

    // Normalize dates to start of day for consistent comparison
    const normalizeToStartOfDay = (date: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const normalizedWeekStart = normalizeToStartOfDay(weekStart);
    const normalizedWeekEnd = normalizeToStartOfDay(weekEnd);

    const relevantAssignments = state.assignments
      .filter((assignment: Assignment) => assignment.personId === personId)
      .filter((assignment: Assignment) => {
        const normalizedStart = normalizeToStartOfDay(assignment.startDate);
        const normalizedEnd = normalizeToStartOfDay(assignment.endDate);
        const overlaps = normalizedStart <= normalizedWeekEnd && normalizedEnd >= normalizedWeekStart;
        return overlaps;
      });

    return relevantAssignments.reduce((sum: number, assignment: Assignment) => sum + assignment.percentage, 0);
  },
  validateCapacity: (personId, additionalPercentage = 0) => {
    const currentCapacity = get().getPersonCapacity(personId);
    return currentCapacity + additionalPercentage <= 150;
  },
  setSelectedWeek: (week) => set({ selectedWeek: snapToWeek(week) }),
  goToPreviousWeek: () => set((state) => {
    const prevWeek = new Date(state.selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    return { selectedWeek: prevWeek };
  }),
  goToNextWeek: () => set((state) => {
    const nextWeek = new Date(state.selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return { selectedWeek: nextWeek };
  }),
  goToToday: () => set({ selectedWeek: snapToWeek(new Date()) }),
  loadData: async () => {
    try {
      // Load projects
      const projectsResponse = await fetch('/local_permanent/projects.csv');
      const projectsText = await projectsResponse.text();
      const projectsParsed = Papa.parse(projectsText, { header: false, skipEmptyLines: true });
      const projects: Project[] = projectsParsed.data.map((row, index: number) => {
        const r = row as unknown[];
        return {
          id: (index + 1).toString(),
          name: (r[1] as string) || '',
          color: (r[2] as string) || '#000000',
        };
      });

      // Load users
      const usersResponse = await fetch('/local_permanent/users.csv');
      const usersText = await usersResponse.text();
      const usersParsed = Papa.parse(usersText, { header: false, skipEmptyLines: true });
      const users: Person[] = usersParsed.data.filter((row) => {
        const r = row as unknown[];
        return (r[0] as string) && (r[0] as string) !== 'Total de horas trabajadas';
      }).map((row, index: number) => {
        const r = row as unknown[];
        return {
          id: (r[1] as string) || (index + 1).toString(),
          name: r[0] as string,
          role: 'Employee',
        };
      });

      // Load assignments
      const assignmentsResponse = await fetch('/local_permanent/assignments.csv');
      const assignmentsText = await assignmentsResponse.text();
      console.log('Assignments CSV text:', assignmentsText);
      const assignmentsParsed = Papa.parse(assignmentsText, { header: false, skipEmptyLines: true });
      console.log('Assignments parsed data:', assignmentsParsed.data);
      const assignments: Assignment[] = assignmentsParsed.data.map((row, index: number) => {
        const r = row as unknown[];
        return {
          id: (index + 1).toString(),
          personId: r[0] as string,
          projectId: r[1] as string,
          startDate: new Date(r[2] as string),
          endDate: new Date(r[3] as string),
          percentage: parseInt(r[4] as string, 10),
        };
      });
      console.log('Loaded assignments:', assignments);

      set({ people: users, projects: projects, assignments: assignments });
    } catch (error) {
      console.error('Error loading data from CSV:', error);
    }
  },
  deleteAssignment: (id) => {
    console.log('deleteAssignment called with id:', id);
    const state = get();
    const assignmentToDelete = state.assignments.find(a => a.id === id);
    if (!assignmentToDelete) {
      console.log('Assignment not found:', id);
      return;
    }

    console.log('Deleting assignment:', assignmentToDelete);
    set((state) => ({
      assignments: state.assignments.filter(a => a.id !== id),
    }));
  },
  deletePerson: (id) => {
    console.log('deletePerson called with id:', id);
    const state = get();
    const personToDelete = state.people.find(p => p.id === id);
    if (!personToDelete) {
      console.log('Person not found:', id);
      return;
    }

    console.log('Deleting person:', personToDelete);
    // Remove all assignments for this person
    const updatedAssignments = state.assignments.filter(a => a.personId !== id);

    set((state) => ({
      people: state.people.filter(p => p.id !== id),
      assignments: updatedAssignments,
    }));
  },
  deleteProject: (id) => {
    console.log('deleteProject called with id:', id);
    const state = get();
    const projectToDelete = state.projects.find(p => p.id === id);
    if (!projectToDelete) {
      console.log('Project not found:', id);
      return;
    }

    console.log('Deleting project:', projectToDelete);
    // Remove all assignments for this project
    const updatedAssignments = state.assignments.filter(a => a.projectId !== id);

    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      assignments: updatedAssignments,
    }));
  },
  saveAllData: async () => {
    const state = get();
    try {
      // Save users
      const usersResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: state.people }),
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to save users');
      }

      // Save projects
      const projectsResponse = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: state.projects.map(p => ({
            id: p.id,
            name: p.name,
            color: p.color,
          }))
        }),
      });

      if (!projectsResponse.ok) {
        throw new Error('Failed to save projects');
      }

      // Save assignments
      const assignmentsResponse = await fetch('/api/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments: state.assignments.map(a => ({
            personId: a.personId,
            projectId: a.projectId,
            startDate: a.startDate instanceof Date && !isNaN(a.startDate.getTime()) ? a.startDate.toISOString() : a.startDate,
            endDate: a.endDate instanceof Date && !isNaN(a.endDate.getTime()) ? a.endDate.toISOString() : a.endDate,
            percentage: a.percentage,
          }))
        }),
      });

      if (!assignmentsResponse.ok) {
        throw new Error('Failed to save assignments');
      }

      console.log('All data saved successfully');
    } catch (error) {
      console.error('Error saving all data:', error);
    }
  },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: dateReviver,
      }),
      partialize: (state) => ({
        selectedWeek: state.selectedWeek,
      }),
    }
  )
);