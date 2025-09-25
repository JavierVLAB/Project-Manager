import { useCalendarStore } from '@/stores/calendarStore';

/**
 * Custom hook for capacity calculations
 * Follows Single Responsibility Principle: handles capacity logic
 */
export const useCapacity = () => {
  const { getPersonCapacity, validateCapacity } = useCalendarStore();

  const getCapacityColor = (capacity: number): string => {
    if (capacity <= 100) return 'green';
    if (capacity <= 120) return 'yellow';
    return 'red';
  };

  const getCapacityStatus = (capacity: number): string => {
    if (capacity <= 100) return 'normal';
    if (capacity <= 120) return 'warning';
    return 'overloaded';
  };

  return {
    getPersonCapacity,
    validateCapacity,
    getCapacityColor,
    getCapacityStatus,
  };
};