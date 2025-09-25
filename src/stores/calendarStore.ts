import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Person, Project, Assignment } from '@/types';
import { snapToWeek } from '@/utils/calendarUtils';

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
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, updates: Partial<Omit<Person, 'id'>>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Omit<Assignment, 'id'>>) => void;
  getPersonCapacity: (personId: string) => number;
  validateCapacity: (personId: string, additionalPercentage?: number) => boolean;
  setSelectedWeek: (week: Date) => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState & CalendarActions>()(
  persist(
    (set, get) => ({
  selectedWeek: snapToWeek(new Date()),
  people: [
    { id: '1', name: 'Alice Johnson', role: 'Developer' },
    { id: '2', name: 'Bob Smith', role: 'Designer' },
    { id: '3', name: 'Charlie Brown', role: 'Manager' },
    { id: '4', name: 'Diana Prince', role: 'QA' },
    { id: '5', name: 'Eve Wilson', role: 'Developer' },
  ],
  projects: [
    { id: '1', name: 'Project Alpha', color: '#FF6B6B' },
    { id: '2', name: 'Project Beta', color: '#4ECDC4' },
    { id: '3', name: 'Project Gamma', color: '#45B7D1' },
    { id: '4', name: 'Project Delta', color: '#96CEB4' },
  ],
  assignments: [
    {
      id: '1',
      personId: '1',
      projectId: '1',
      startDate: new Date(2023, 9, 2), // Oct 2
      endDate: new Date(2023, 9, 6), // Oct 6
      percentage: 50,
    },
    {
      id: '2',
      personId: '2',
      projectId: '2',
      startDate: new Date(2023, 9, 3),
      endDate: new Date(2023, 9, 5),
      percentage: 40,
    },
    {
      id: '3',
      personId: '3',
      projectId: '3',
      startDate: new Date(2023, 9, 4),
      endDate: new Date(2023, 9, 8),
      percentage: 60,
    },
    {
      id: '4',
      personId: '4',
      projectId: '1',
      startDate: new Date(2023, 9, 2),
      endDate: new Date(2023, 9, 4),
      percentage: 30,
    },
    {
      id: '5',
      personId: '5',
      projectId: '4',
      startDate: new Date(2023, 9, 5),
      endDate: new Date(2023, 9, 7),
      percentage: 45,
    },
  ],
  addPerson: (person) => set((state) => ({
    people: [...state.people, { ...person, id: Date.now().toString() }],
  })),
  updatePerson: (id, updates) => set((state) => ({
    people: state.people.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now().toString() }],
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  addAssignment: (assignment) => set((state) => {
    if (!state.validateCapacity(assignment.personId, assignment.percentage)) {
      console.warn('Capacity limit exceeded, assignment not added');
      return state;
    }
    return {
      assignments: [...state.assignments, { ...assignment, id: Date.now().toString() }],
    };
  }),
  updateAssignment: (id, updates) => set((state) => {
    const updatedAssignments = state.assignments.map(a => a.id === id ? { ...a, ...updates } : a);
    const updatedAssignment = updatedAssignments.find(a => a.id === id);
    if (updatedAssignment && !state.validateCapacity(updatedAssignment.personId)) {
      console.warn('Capacity limit exceeded, assignment not updated');
      return state;
    }
    return {
      assignments: updatedAssignments,
    };
  }),
  getPersonCapacity: (personId) => {
    const state = get();
    const weekStart = state.selectedWeek;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 1 week - 1 day

    return state.assignments
      .filter((assignment: Assignment) => assignment.personId === personId)
      .filter((assignment: Assignment) => assignment.startDate <= weekEnd && assignment.endDate >= weekStart)
      .reduce((total: number, assignment: Assignment) => total + assignment.percentage, 0);
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
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => localStorage, {
        reviver: dateReviver,
      }),
    }
  )
);