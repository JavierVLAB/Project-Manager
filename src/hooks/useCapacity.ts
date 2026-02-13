import { useCalendarStore } from '@/stores/calendarStore';

/**
 * Custom hook for capacity calculations
 * Follows Single Responsibility Principle: handles capacity logic
 */
export const useCapacity = () => {
  const { getPersonCapacity, validateCapacity } = useCalendarStore();

  const getCapacityColor = (capacity: number): string => {
    if (capacity > 100) return 'red-600';
    if (capacity < 50) return 'red-100';
    if (capacity < 75) return 'yellow-100';
    return 'green-100';
  };

  const getCapacityStatus = (capacity: number): string => {
    if (capacity > 100) return 'overloaded';
    if (capacity < 50) return 'low';
    if (capacity < 75) return 'medium';
    return 'high';
  };

  return {
    getPersonCapacity,
    validateCapacity,
    getCapacityColor,
    getCapacityStatus,
  };
};