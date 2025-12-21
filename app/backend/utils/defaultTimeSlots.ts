/**
 * Generates default time slots for a doctor on a given date
 * Default hours: 9 AM - 6 PM
 * Slot duration: 30 minutes
 * Breaks:
 *  - Lunch: 1:00 PM - 2:00 PM
 *  - Snacks: 4:00 PM - 4:30 PM
 */

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isBooked: boolean;
}

export function generateDefaultTimeSlots(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];

  // Set to the beginning of the day
  const currentDate = new Date(date);
  currentDate.setHours(0, 0, 0, 0);

  // Start time: 9:00 AM
  const startHour = 9;
  // End time: 6:00 PM (18:00)
  const endHour = 18;
  // Slot duration in minutes
  const slotDuration = 30;

  // Lunch break: 1:00 PM - 2:00 PM (13:00 - 14:00)
  const lunchStart = 13 * 60; // 13:00 in minutes
  const lunchEnd = 14 * 60;   // 14:00 in minutes

  // Snacks break: 4:00 PM - 4:30 PM (16:00 - 16:30)
  const snacksStart = 16 * 60; // 16:00 in minutes
  const snacksEnd = 16 * 60 + 30; // 16:30 in minutes

  // Generate slots from start to end hour
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const totalMinutes = hour * 60 + minute;

      // Skip lunch break (1:00 PM - 2:00 PM)
      if (totalMinutes >= lunchStart && totalMinutes < lunchEnd) {
        continue;
      }

      // Skip snacks break (4:00 PM - 4:30 PM)
      if (totalMinutes >= snacksStart && totalMinutes < snacksEnd) {
        continue;
      }

      // Create start time
      const startTime = new Date(currentDate);
      startTime.setHours(hour, minute, 0, 0);

      // Create end time (30 minutes later)
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + slotDuration);

      // Don't add slots that go beyond 6 PM
      if (endTime.getHours() > endHour) {
        break;
      }

      slots.push({
        startTime,
        endTime,
        isBooked: false
      });
    }
  }

  return slots;
}

/**
 * Checks if a given time slot falls within break times
 */
export function isBreakTime(time: Date): boolean {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Lunch break: 1:00 PM - 2:00 PM
  const lunchStart = 13 * 60;
  const lunchEnd = 14 * 60;

  // Snacks break: 4:00 PM - 4:30 PM
  const snacksStart = 16 * 60;
  const snacksEnd = 16 * 60 + 30;

  return (
    (totalMinutes >= lunchStart && totalMinutes < lunchEnd) ||
    (totalMinutes >= snacksStart && totalMinutes < snacksEnd)
  );
}

/**
 * Checks if a given time slot is within working hours (9 AM - 6 PM)
 */
export function isWithinWorkingHours(time: Date): boolean {
  const hours = time.getHours();
  return hours >= 9 && hours < 18;
}
