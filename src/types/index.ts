export interface Person {
  id: string;
  name: string;
  enabled: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Assignment {
  id: string;
  personId: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  percentage: number; // Percentage of person's time (0-100)
  layer?: number; // Stack layer for manual adjustment (0-based)
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
}