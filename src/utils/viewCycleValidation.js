/**
 * Validate viewCycle and corresponding cycle fields
 * @param {string} viewCycle - 'weekly', 'fortnightly', or 'monthly'
 * @param {number|null} weekDay - 0-6 for weekly
 * @param {number|null} fortnightStartDay - 0-6 for fortnightly
 * @param {number|null} monthDate - 1-28 for monthly
 * @returns {Object} - { isValid: boolean, error: string|null, cleanedData: Object }
 */
export const validateViewCycle = (viewCycle, weekDay, fortnightStartDay, monthDate) => {
  if (!viewCycle) {
    return {
      isValid: false,
      error: "viewCycle is required",
      cleanedData: null,
    };
  }

  if (!["weekly", "fortnightly", "monthly"].includes(viewCycle)) {
    return {
      isValid: false,
      error: "viewCycle must be: weekly, fortnightly, or monthly",
      cleanedData: null,
    };
  }

  const cleanedData = {
    weekDay: null,
    fortnightStartDay: null,
    monthDate: null,
  };

  if (viewCycle === "weekly") {
    if (weekDay === null || weekDay === undefined) {
      return {
        isValid: false,
        error: "weekDay is required when viewCycle is 'weekly'",
        cleanedData: null,
      };
    }
    if (typeof weekDay !== "number" || weekDay < 0 || weekDay > 6) {
      return {
        isValid: false,
        error: "weekDay must be a number between 0 and 6 (0=Sunday, 6=Saturday)",
        cleanedData: null,
      };
    }
    cleanedData.weekDay = weekDay;
    cleanedData.fortnightStartDay = null;
    cleanedData.monthDate = null;
  } else if (viewCycle === "fortnightly") {
    if (fortnightStartDay === null || fortnightStartDay === undefined) {
      return {
        isValid: false,
        error: "fortnightStartDay is required when viewCycle is 'fortnightly'",
        cleanedData: null,
      };
    }
    if (typeof fortnightStartDay !== "number" || fortnightStartDay < 0 || fortnightStartDay > 6) {
      return {
        isValid: false,
        error: "fortnightStartDay must be a number between 0 and 6 (0=Sunday, 6=Saturday)",
        cleanedData: null,
      };
    }
    cleanedData.fortnightStartDay = fortnightStartDay;
    cleanedData.weekDay = null;
    cleanedData.monthDate = null;
  } else if (viewCycle === "monthly") {
    if (monthDate === null || monthDate === undefined) {
      return {
        isValid: false,
        error: "monthDate is required when viewCycle is 'monthly'",
        cleanedData: null,
      };
    }
    if (typeof monthDate !== "number" || monthDate < 1 || monthDate > 28) {
      return {
        isValid: false,
        error: "monthDate must be a number between 1 and 28",
        cleanedData: null,
      };
    }
    cleanedData.monthDate = monthDate;
    cleanedData.weekDay = null;
    cleanedData.fortnightStartDay = null;
  }

  return {
    isValid: true,
    error: null,
    cleanedData,
  };
};

