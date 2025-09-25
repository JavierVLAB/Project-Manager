export interface Person {
  id: string;
  name: string;
  role: string;
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
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
}