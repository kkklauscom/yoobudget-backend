/**
 * Get cycle interval based on frequency
 * @param {string} frequency - 'weekly', 'fortnightly', 'monthly', 'yearly'
 * @returns {Object} - { type: 'days'|'months'|'years', value: number }
 */
export const getCycleInterval = (frequency) => {
  switch (frequency) {
    case "weekly":
      return { type: "days", value: 7 };
    case "fortnightly":
      return { type: "days", value: 14 };
    case "monthly":
      return { type: "months", value: 1 };
    case "yearly":
      return { type: "years", value: 1 };
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }
};

/**
 * Add interval to a date based on frequency
 * @param {Date} date - Base date
 * @param {string} frequency - 'weekly', 'fortnightly', 'monthly', 'yearly'
 * @returns {Date} - New date with interval added
 */
export const addInterval = (date, frequency) => {
  const interval = getCycleInterval(frequency);
  const newDate = new Date(date);

  switch (interval.type) {
    case "days":
      newDate.setDate(newDate.getDate() + interval.value);
      break;
    case "months":
      newDate.setMonth(newDate.getMonth() + interval.value);
      break;
    case "years":
      newDate.setFullYear(newDate.getFullYear() + interval.value);
      break;
  }

  return newDate;
};

/**
 * Subtract interval from a date based on frequency
 * @param {Date} date - Base date
 * @param {string} frequency - 'weekly', 'fortnightly', 'monthly', 'yearly'
 * @returns {Date} - New date with interval subtracted
 */
const subtractInterval = (date, frequency) => {
  const interval = getCycleInterval(frequency);
  const newDate = new Date(date);

  switch (interval.type) {
    case "days":
      newDate.setDate(newDate.getDate() - interval.value);
      break;
    case "months":
      newDate.setMonth(newDate.getMonth() - interval.value);
      break;
    case "years":
      newDate.setFullYear(newDate.getFullYear() - interval.value);
      break;
  }

  return newDate;
};

/**
 * Generate pay dates in a given range for an income
 * @param {Object} income - Income document
 * @param {Date} rangeStart - Start of date range
 * @param {Date} rangeEnd - End of date range
 * @returns {Date[]} - Array of pay dates within the range
 */
export const generatePayDatesInRange = (income, rangeStart, rangeEnd) => {
  // CASE A: one-time income
  if (income.type === "one-time") {
    const oneTimeDate = new Date(income.oneTimeDate);
    oneTimeDate.setHours(0, 0, 0, 0);

    const start = new Date(rangeStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd);
    end.setHours(23, 59, 59, 999);

    if (oneTimeDate >= start && oneTimeDate <= end) {
      return [oneTimeDate];
    }
    return [];
  }

  // CASE B: recurring income
  if (income.type === "recurring") {
    // CASE B1: isFirstPayDay = true
    if (income.isFirstPayDay) {
      // lastPayDate MUST be null for first pay day
      if (income.lastPayDate !== null) {
        throw new Error(
          "lastPayDate must be null when isFirstPayDay is true"
        );
      }

      const nextPayDate = new Date(income.nextPayDate);
      nextPayDate.setHours(0, 0, 0, 0);

      const start = new Date(rangeStart);
      start.setHours(0, 0, 0, 0);
      const end = new Date(rangeEnd);
      end.setHours(23, 59, 59, 999);

      // Only count nextPayDate, do NOT infer any past dates
      if (nextPayDate >= start && nextPayDate <= end) {
        return [nextPayDate];
      }
      return [];
    }

    // CASE B2: normal recurring income (isFirstPayDay = false)
    if (!income.lastPayDate) {
      throw new Error(
        "lastPayDate is required when isFirstPayDay is false"
      );
    }

    const payDates = [];
    const lastPayDate = new Date(income.lastPayDate);
    lastPayDate.setHours(0, 0, 0, 0);

    const start = new Date(rangeStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(rangeEnd);
    end.setHours(23, 59, 59, 999);

    // Move backward from lastPayDate until < rangeStart
    let currentDate = new Date(lastPayDate);
    while (currentDate >= start) {
      payDates.push(new Date(currentDate));
      currentDate = subtractInterval(currentDate, income.frequency);
    }

    // Move forward from lastPayDate until > rangeEnd
    currentDate = addInterval(new Date(lastPayDate), income.frequency);
    while (currentDate <= end) {
      payDates.push(new Date(currentDate));
      currentDate = addInterval(currentDate, income.frequency);
    }

    // Sort and filter to ensure dates are within range
    payDates.sort((a, b) => a - b);
    return payDates.filter((date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d >= start && d <= end;
    });
  }

  return [];
};

