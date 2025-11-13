/**
 * Calculate cycle start and end based on main income
 * @param {Object} mainIncome - Main income document with payCycle and nextPayDate
 * @returns {Object} - { cycleStart: Date, cycleEnd: Date }
 */
export const calculateCycle = (mainIncome) => {
  if (!mainIncome || !mainIncome.payCycle || !mainIncome.nextPayDate) {
    throw new Error("Invalid main income: missing payCycle or nextPayDate");
  }

  const cycleStart = new Date(mainIncome.nextPayDate);
  cycleStart.setHours(0, 0, 0, 0);

  const cycleEnd = new Date(cycleStart);

  switch (mainIncome.payCycle) {
    case "weekly":
      cycleEnd.setDate(cycleEnd.getDate() + 7);
      break;
    case "biweekly":
      cycleEnd.setDate(cycleEnd.getDate() + 14);
      break;
    case "monthly":
      cycleEnd.setMonth(cycleEnd.getMonth() + 1);
      break;
    case "one-time":
      // One-time income doesn't define a cycle
      // This should not be used as main income, but handle gracefully
      cycleEnd.setDate(cycleEnd.getDate() + 1);
      break;
    default:
      throw new Error(`Invalid payCycle: ${mainIncome.payCycle}`);
  }

  cycleEnd.setHours(23, 59, 59, 999);

  return {
    cycleStart,
    cycleEnd,
  };
};

/**
 * Calculate remaining days until cycle end
 * @param {Date} cycleEnd - End date of the cycle
 * @returns {number} - Remaining days (can be negative if cycle has passed)
 */
export const calculateRemainingDays = (cycleEnd) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(cycleEnd);
  end.setHours(0, 0, 0, 0);

  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Check if a date falls within a cycle
 * @param {Date} date - Date to check
 * @param {Date} cycleStart - Cycle start date
 * @param {Date} cycleEnd - Cycle end date
 * @returns {boolean} - True if date is within cycle
 */
export const isDateInCycle = (date, cycleStart, cycleEnd) => {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  const start = new Date(cycleStart);
  start.setHours(0, 0, 0, 0);

  const end = new Date(cycleEnd);
  end.setHours(23, 59, 59, 999);

  return checkDate >= start && checkDate < end;
};

