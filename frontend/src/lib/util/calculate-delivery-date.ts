/**
 * Utility functions for calculating delivery dates
 * Excludes weekends (Saturday, Sunday) and international holidays
 */

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
}

/**
 * Calculate Easter Sunday date using the Computus algorithm
 * This is a simplified version that works for years 1900-2099
 */
function calculateEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

/**
 * Get international holidays for a given year
 * This includes major fixed-date holidays observed in many countries
 */
function getInternationalHolidays(year: number): Date[] {
  const holidays: Date[] = []

  // New Year's Day - January 1
  holidays.push(new Date(year, 0, 1))

  // Easter and related holidays (observed in many countries)
  try {
    const easter = calculateEaster(year)
    holidays.push(new Date(easter))

    // Good Friday (Easter - 2 days)
    const goodFriday = new Date(easter)
    goodFriday.setDate(easter.getDate() - 2)
    holidays.push(goodFriday)

    // Easter Monday (Easter + 1 day)
    const easterMonday = new Date(easter)
    easterMonday.setDate(easter.getDate() + 1)
    holidays.push(easterMonday)
  } catch (error) {
    // If Easter calculation fails, skip it
    console.warn(`Failed to calculate Easter for year ${year}:`, error)
  }

  // Labor Day / May Day - May 1
  holidays.push(new Date(year, 4, 1))

  // Christmas - December 25
  holidays.push(new Date(year, 11, 25))

  // Boxing Day - December 26 (observed in many Commonwealth countries)
  holidays.push(new Date(year, 11, 26))

  // New Year's Eve - December 31
  holidays.push(new Date(year, 11, 31))

  return holidays
}

/**
 * Normalize a date to midnight for comparison (ignoring time)
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

/**
 * Check if a date is a holiday
 */
function isHoliday(date: Date): boolean {
  const normalizedDate = normalizeDate(date)
  const year = normalizedDate.getFullYear()
  const holidays = getInternationalHolidays(year)
  
  // Also check holidays from previous and next year in case we're near year boundary
  const prevYearHolidays = getInternationalHolidays(year - 1)
  const nextYearHolidays = getInternationalHolidays(year + 1)
  const allHolidays = [...holidays, ...prevYearHolidays, ...nextYearHolidays]

  return allHolidays.some((holiday) => {
    const normalizedHoliday = normalizeDate(holiday)
    return normalizedHoliday.getTime() === normalizedDate.getTime()
  })
}

/**
 * Check if a date is a business day (not weekend and not holiday)
 */
function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date)
}

/**
 * Add business days to a date, excluding weekends and holidays
 * @param startDate - The starting date
 * @param businessDays - Number of business days to add
 * @returns The date after adding the specified business days
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  if (businessDays <= 0) {
    return new Date(startDate)
  }

  // Normalize start date to midnight
  let currentDate = normalizeDate(new Date(startDate))
  let daysAdded = 0

  while (daysAdded < businessDays) {
    currentDate.setDate(currentDate.getDate() + 1)
    if (isBusinessDay(currentDate)) {
      daysAdded++
    }
  }

  return currentDate
}

/**
 * Parse ETA string in format "min-max" or single number
 * @param eta - ETA string like "1-5 days" or "3 days"
 * @returns Object with min and max days, or null if invalid
 */
export function parseETA(eta: string | null): { min: number; max: number } | null {
  if (!eta) return null

  // Remove "days" or "day" from the string
  const cleaned = eta.replace(/\s*(days?)\s*/gi, "").trim()

  // Check for range format "min-max"
  const rangeMatch = cleaned.match(/^(\d+)-(\d+)$/)
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10)
    const max = parseInt(rangeMatch[2], 10)
    if (!isNaN(min) && !isNaN(max) && min > 0 && max >= min) {
      return { min, max }
    }
  }

  // Check for single number format
  const singleMatch = cleaned.match(/^(\d+)$/)
  if (singleMatch) {
    const days = parseInt(singleMatch[1], 10)
    if (!isNaN(days) && days > 0) {
      return { min: days, max: days }
    }
  }

  // Check for "Up to X days" format
  const upToMatch = cleaned.match(/^up\s+to\s+(\d+)$/i)
  if (upToMatch) {
    const max = parseInt(upToMatch[1], 10)
    if (!isNaN(max) && max > 0) {
      return { min: 1, max }
    }
  }

  return null
}

/**
 * Calculate expected delivery date range from ETA
 * @param eta - ETA string like "1-5 days" or "3 days"
 * @param startDate - Optional start date (defaults to today)
 * @returns Object with min and max delivery dates, or null if ETA is invalid
 */
export function calculateDeliveryDateRange(
  eta: string | null,
  startDate: Date = new Date()
): { minDate: Date; maxDate: Date } | null {
  const etaRange = parseETA(eta)
  if (!etaRange) {
    return null
  }

  const minDate = addBusinessDays(startDate, etaRange.min)
  const maxDate = addBusinessDays(startDate, etaRange.max)

  return { minDate, maxDate }
}

/**
 * Format date to "Weekday, Month Day" format
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDeliveryDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  }
  return date.toLocaleDateString("en-US", options)
}
