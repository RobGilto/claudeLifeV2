#!/usr/bin/env node

/**
 * Sydney Time Helper
 * 
 * Provides consistent Sydney timezone handling for all checkin commands
 * Eliminates timezone bugs by centralizing time logic
 * 
 * Usage:
 *   node scripts/sydney-time-helper.js [format]
 *   
 * Formats:
 *   - full: "2025-09-01T17:30:54+10:00"
 *   - time: "17:30" 
 *   - date: "2025-09-01"
 *   - datetime: "September 1, 2025 - 17:30"
 *   - checkin: "September 1, 2025 - 17:30" (same as datetime)
 */

function getSydneyTime(format = 'checkin') {
    const now = new Date();
    
    // Create Sydney time using Intl.DateTimeFormat
    const sydneyTime = new Intl.DateTimeFormat('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(now);

    // Extract components
    const year = sydneyTime.find(part => part.type === 'year').value;
    const month = sydneyTime.find(part => part.type === 'month').value;
    const day = sydneyTime.find(part => part.type === 'day').value;
    const hour = sydneyTime.find(part => part.type === 'hour').value;
    const minute = sydneyTime.find(part => part.type === 'minute').value;
    const second = sydneyTime.find(part => part.type === 'second').value;

    const isoDate = `${year}-${month}-${day}`;
    const timeOnly = `${hour}:${minute}`;
    const fullDateTime = `${isoDate}T${hour}:${minute}:${second}+10:00`;
    
    // Format month name for human-readable output
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[parseInt(month) - 1];
    const humanDate = `${monthName} ${parseInt(day)}, ${year}`;
    
    switch (format) {
        case 'full':
            return fullDateTime;
        case 'time':
            return timeOnly;
        case 'date':
            return isoDate;
        case 'datetime':
        case 'checkin':
            return `${humanDate} - ${timeOnly}`;
        default:
            return `${humanDate} - ${timeOnly}`;
    }
}

// If called directly from command line
if (require.main === module) {
    const format = process.argv[2] || 'checkin';
    console.log(getSydneyTime(format));
}

module.exports = { getSydneyTime };