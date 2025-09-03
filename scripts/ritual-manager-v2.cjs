#!/usr/bin/env node

/**
 * Advanced Ritual Management System V2
 * Purpose: UUID-based ritual management with complex scheduling and selective calendar sync
 * Usage: node scripts/ritual-manager-v2.js [command] [args]
 * Dependencies: fs, path, crypto (for UUIDs)
 * 
 * Features:
 * - UUID-based architecture for cross-system deduplication
 * - Complex frequency patterns (daily, interval, weekly, monthly, quarterly)
 * - Selective calendar sync based on planning periods
 * - Rich CLI interface with natural language parsing
 * - Performance optimization with caching
 * - Integration with TaskWarrior and planning systems
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Custom Exception Classes for Ritual Management
class RitualConflictError extends Error {
    constructor(message, conflicts = []) {
        super(message);
        this.name = 'RitualConflictError';
        this.conflicts = conflicts;
    }
}

class RitualValidationError extends Error {
    constructor(message, validationIssues = []) {
        super(message);
        this.name = 'RitualValidationError';
        this.validationIssues = validationIssues;
    }
}

// Configuration
const RITUALS_V2_DIR = path.join(__dirname, '..', 'rituals-v2');
const RITUAL_DEFINITIONS_FILE = path.join(RITUALS_V2_DIR, 'ritual-definitions.json');
const RITUAL_INSTANCES_FILE = path.join(RITUALS_V2_DIR, 'ritual-instances.json');
const COMPLETION_TRACKING_FILE = path.join(RITUALS_V2_DIR, 'completion-tracking.json');
const SYNC_HISTORY_FILE = path.join(RITUALS_V2_DIR, 'sync-history.json');
const AVAILABILITY_CACHE_DIR = path.join(RITUALS_V2_DIR, 'availability-cache');

// Ensure directories exist
[RITUALS_V2_DIR, AVAILABILITY_CACHE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Enhanced Time Utilities
class TimeUtils {
    static parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    static formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
    
    static addMinutes(timeStr, minutes) {
        const totalMinutes = this.parseTime(timeStr) + minutes;
        return this.formatTime(totalMinutes);
    }
    
    static isTimeInRange(time, start, end) {
        const timeMinutes = this.parseTime(time);
        const startMinutes = this.parseTime(start);
        const endMinutes = this.parseTime(end);
        return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    }
    
    static getDateString(date = new Date()) {
        return date.toISOString().split('T')[0];
    }
    
    static getDayOfWeek(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }
    
    static getWeekNumber(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const startDate = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
        return Math.ceil((date.getDay() + 1 + days) / 7);
    }
    
    static getQuarter(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        return Math.ceil((date.getMonth() + 1) / 3);
    }
    
    static getMonthInfo(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            isFirstDay: date.getDate() === 1,
            isLastDay: date.getDate() === lastDay.getDate(),
            dayOfWeek: this.getDayOfWeek(dateStr),
            weekInMonth: Math.ceil(date.getDate() / 7)
        };
    }
    
    static getQuarterInfo(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const quarter = this.getQuarter(dateStr);
        const quarterStartMonth = (quarter - 1) * 3;
        const quarterStart = new Date(date.getFullYear(), quarterStartMonth, 1);
        const quarterEnd = new Date(date.getFullYear(), quarterStartMonth + 3, 0);
        
        return {
            year: date.getFullYear(),
            quarter,
            monthInQuarter: date.getMonth() - quarterStartMonth + 1,
            isFirstMonth: date.getMonth() === quarterStartMonth,
            isLastMonth: date.getMonth() === quarterStartMonth + 2,
            weekInQuarter: Math.ceil((date - quarterStart) / (7 * 24 * 60 * 60 * 1000)) + 1
        };
    }
    
    static addDays(dateStr, days) {
        const date = new Date(dateStr + 'T12:00:00');
        date.setDate(date.getDate() + days);
        return this.getDateString(date);
    }
    
    static isWeekend(dateStr) {
        const dayOfWeek = this.getDayOfWeek(dateStr);
        return dayOfWeek === 'saturday' || dayOfWeek === 'sunday';
    }
    
    static isWeekday(dateStr) {
        return !this.isWeekend(dateStr);
    }
}

// UUID Generator
class UUIDGenerator {
    static generate() {
        return crypto.randomUUID();
    }
    
    static isValid(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
}

// Frequency Engine for Complex Scheduling Patterns
class FrequencyEngine {
    static createPattern(patternConfig) {
        switch (patternConfig.type) {
            case 'daily':
                return new DailyPattern(patternConfig);
            case 'interval':
                return new IntervalPattern(patternConfig);
            case 'weekly':
                return new WeeklyPattern(patternConfig);
            case 'monthly':
                return new MonthlyPattern(patternConfig);
            case 'quarterly':
                return new QuarterlyPattern(patternConfig);
            default:
                throw new Error(`Unsupported pattern type: ${patternConfig.type}`);
        }
    }
    
    static parseNaturalLanguage(input) {
        // Parse natural language frequency descriptions
        const patterns = {
            daily: /\b(daily|every day)\b/i,
            everyOtherDay: /\b(every other day|every-other-day|alternate days?)\b/i,
            interval: /\bevery (\d+) days?\b/i,
            weekly: /\b(weekly|every week)\b/i,
            weekdays: /\b(weekdays?|monday-friday|mon-fri)\b/i,
            weekends: /\b(weekends?|saturday-sunday|sat-sun)\b/i,
            monthly: /\b(monthly|every month)\b/i,
            quarterly: /\b(quarterly|every quarter)\b/i,
            specificDays: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi
        };
        
        // Extract pattern type and parameters
        if (patterns.daily.test(input)) {
            return { type: 'daily' };
        }
        
        if (patterns.everyOtherDay.test(input)) {
            return { type: 'interval', interval: 2 };
        }
        
        const intervalMatch = input.match(patterns.interval);
        if (intervalMatch) {
            return { type: 'interval', interval: parseInt(intervalMatch[1]) };
        }
        
        if (patterns.weekdays.test(input)) {
            return { 
                type: 'weekly', 
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
            };
        }
        
        if (patterns.weekends.test(input)) {
            return { 
                type: 'weekly', 
                days: ['saturday', 'sunday'] 
            };
        }
        
        const specificDays = input.match(patterns.specificDays);
        if (specificDays && specificDays.length > 0) {
            return { 
                type: 'weekly', 
                days: specificDays.map(day => day.toLowerCase()) 
            };
        }
        
        if (patterns.monthly.test(input)) {
            return { type: 'monthly', days: [1] }; // Default to first of month
        }
        
        if (patterns.quarterly.test(input)) {
            return { type: 'quarterly', months: [1], days: [1] }; // Default to first day of first month
        }
        
        // Default to daily if can't parse
        return { type: 'daily' };
    }
}

// Base Pattern Class
class BasePattern {
    constructor(config) {
        this.config = config;
        this.startDate = config.startDate || null;
        this.endDate = config.endDate || null;
    }
    
    isActive(dateStr) {
        if (this.startDate && dateStr < this.startDate) return false;
        if (this.endDate && dateStr > this.endDate) return false;
        return true;
    }
    
    matches(dateStr) {
        if (!this.isActive(dateStr)) return false;
        return this.matchesPattern(dateStr);
    }
    
    matchesPattern(dateStr) {
        throw new Error('matchesPattern must be implemented by subclass');
    }
}

// Daily Pattern
class DailyPattern extends BasePattern {
    matchesPattern(dateStr) {
        return true; // Every day within the active period
    }
}

// Interval Pattern (every N days)
class IntervalPattern extends BasePattern {
    constructor(config) {
        super(config);
        this.interval = config.interval || 1;
        this.anchorDate = config.anchorDate || config.startDate || TimeUtils.getDateString();
    }
    
    matchesPattern(dateStr) {
        const anchorMs = new Date(this.anchorDate + 'T12:00:00').getTime();
        const dateMs = new Date(dateStr + 'T12:00:00').getTime();
        const daysDiff = Math.floor((dateMs - anchorMs) / (24 * 60 * 60 * 1000));
        
        return daysDiff >= 0 && daysDiff % this.interval === 0;
    }
}

// Weekly Pattern
class WeeklyPattern extends BasePattern {
    constructor(config) {
        super(config);
        this.days = config.days || ['monday']; // Default to Monday
    }
    
    matchesPattern(dateStr) {
        const dayOfWeek = TimeUtils.getDayOfWeek(dateStr);
        return this.days.includes(dayOfWeek);
    }
}

// Monthly Pattern
class MonthlyPattern extends BasePattern {
    constructor(config) {
        super(config);
        this.days = config.days || [1]; // Specific days of month
        this.weekDay = config.weekDay || null; // e.g., 'first-monday', 'last-friday'
    }
    
    matchesPattern(dateStr) {
        const monthInfo = TimeUtils.getMonthInfo(dateStr);
        
        if (this.days.includes('last') && monthInfo.isLastDay) {
            return true;
        }
        
        if (this.days.includes(monthInfo.day)) {
            return true;
        }
        
        if (this.weekDay) {
            return this.matchesWeekDay(dateStr, monthInfo);
        }
        
        return false;
    }
    
    matchesWeekDay(dateStr, monthInfo) {
        const [position, day] = this.weekDay.split('-');
        const dayOfWeek = monthInfo.dayOfWeek;
        
        if (dayOfWeek !== day) return false;
        
        const weekInMonth = monthInfo.weekInMonth;
        
        switch (position) {
            case 'first':
                return weekInMonth === 1;
            case 'second':
                return weekInMonth === 2;
            case 'third':
                return weekInMonth === 3;
            case 'fourth':
                return weekInMonth === 4;
            case 'last':
                // Check if this is the last occurrence of this day in the month
                const nextWeek = TimeUtils.addDays(dateStr, 7);
                const nextMonthInfo = TimeUtils.getMonthInfo(nextWeek);
                return nextMonthInfo.month !== monthInfo.month;
            default:
                return false;
        }
    }
}

// Quarterly Pattern
class QuarterlyPattern extends BasePattern {
    constructor(config) {
        super(config);
        this.months = config.months || [1]; // Which months in quarter (1, 2, or 3)
        this.days = config.days || [1]; // Which days in those months
        this.week = config.week || null; // Which week in quarter
        this.weekDay = config.weekDay || null; // e.g., 'second-wednesday'
    }
    
    matchesPattern(dateStr) {
        const quarterInfo = TimeUtils.getQuarterInfo(dateStr);
        const monthInfo = TimeUtils.getMonthInfo(dateStr);
        
        // Check if we're in the right month of the quarter
        if (!this.months.includes(quarterInfo.monthInQuarter)) {
            return false;
        }
        
        // Handle specific days
        if (this.days.includes('last') && monthInfo.isLastDay) {
            return true;
        }
        
        if (this.days.includes(monthInfo.day)) {
            return true;
        }
        
        // Handle week-based patterns
        if (this.week && this.weekDay) {
            return this.matchesQuarterWeekDay(dateStr, quarterInfo);
        }
        
        return false;
    }
    
    matchesQuarterWeekDay(dateStr, quarterInfo) {
        const [position, day] = this.weekDay.split('-');
        const dayOfWeek = TimeUtils.getDayOfWeek(dateStr);
        
        if (dayOfWeek !== day) return false;
        
        // This would need more complex logic to determine position within quarter
        // For now, simplified implementation
        return quarterInfo.weekInQuarter === parseInt(this.week);
    }
}

// Ritual Definition with UUID-based architecture
class RitualDefinition {
    constructor(config) {
        this.uuid = config.uuid || UUIDGenerator.generate();
        this.name = config.name;
        this.type = config.type; // foundational|work|life|maintenance
        this.description = config.description || '';
        this.priority = config.priority || 'medium'; // high|medium|low
        this.frequencyPattern = FrequencyEngine.createPattern(config.frequency);
        this.timeBlocks = config.timeBlocks || [];
        this.metadata = config.metadata || {};
        this.created = config.created || new Date().toISOString();
        this.updated = config.updated || new Date().toISOString();
        this.active = config.active !== false;
        this.tags = config.tags || [];
        this.integrations = config.integrations || {
            taskwarrior: null,
            calendar: null,
            planning: null
        };
    }
    
    updateMetadata(newMetadata) {
        this.metadata = { ...this.metadata, ...newMetadata };
        this.updated = new Date().toISOString();
    }
    
    addTimeBlock(timeBlock) {
        this.timeBlocks.push({
            uuid: UUIDGenerator.generate(),
            ...timeBlock
        });
        this.updated = new Date().toISOString();
    }
    
    removeTimeBlock(blockUuid) {
        this.timeBlocks = this.timeBlocks.filter(block => block.uuid !== blockUuid);
        this.updated = new Date().toISOString();
    }
    
    isActiveOnDate(dateStr) {
        return this.active && this.frequencyPattern.matches(dateStr);
    }
    
    getTimeBlocksForDate(dateStr) {
        if (!this.isActiveOnDate(dateStr)) return [];
        
        return this.timeBlocks.map(block => ({
            ...block,
            ritualUuid: this.uuid,
            ritualName: this.name,
            ritualType: this.type,
            date: dateStr
        }));
    }
    
    toJSON() {
        return {
            uuid: this.uuid,
            name: this.name,
            type: this.type,
            description: this.description,
            priority: this.priority,
            frequency: this.frequencyPattern.config,
            timeBlocks: this.timeBlocks,
            metadata: this.metadata,
            created: this.created,
            updated: this.updated,
            active: this.active,
            tags: this.tags,
            integrations: this.integrations
        };
    }
    
    static fromJSON(data) {
        return new RitualDefinition(data);
    }
}

// Main Ritual Manager V2 Class
class RitualManagerV2 {
    constructor() {
        this.rituals = new Map();
        this.instances = new Map();
        this.completions = new Map();
        this.syncHistory = [];
        this.availabilityCache = new Map();
        
        this.loadData();
    }
    
    loadData() {
        // Load ritual definitions
        if (fs.existsSync(RITUAL_DEFINITIONS_FILE)) {
            const data = JSON.parse(fs.readFileSync(RITUAL_DEFINITIONS_FILE, 'utf8'));
            data.rituals.forEach(ritualData => {
                const ritual = RitualDefinition.fromJSON(ritualData);
                this.rituals.set(ritual.uuid, ritual);
            });
        }
        
        // Load instances, completions, and sync history
        this.loadInstances();
        this.loadCompletions();
        this.loadSyncHistory();
    }
    
    loadInstances() {
        if (fs.existsSync(RITUAL_INSTANCES_FILE)) {
            const data = JSON.parse(fs.readFileSync(RITUAL_INSTANCES_FILE, 'utf8'));
            data.instances.forEach(instance => {
                this.instances.set(instance.uuid, instance);
            });
        }
    }
    
    loadCompletions() {
        if (fs.existsSync(COMPLETION_TRACKING_FILE)) {
            const data = JSON.parse(fs.readFileSync(COMPLETION_TRACKING_FILE, 'utf8'));
            Object.entries(data.completions).forEach(([ritualUuid, completionData]) => {
                this.completions.set(ritualUuid, completionData);
            });
        }
    }
    
    loadSyncHistory() {
        if (fs.existsSync(SYNC_HISTORY_FILE)) {
            const data = JSON.parse(fs.readFileSync(SYNC_HISTORY_FILE, 'utf8'));
            this.syncHistory = data.history || [];
        }
    }
    
    saveData() {
        this.saveRitualDefinitions();
        this.saveInstances();
        this.saveCompletions();
        this.saveSyncHistory();
    }
    
    saveRitualDefinitions() {
        const data = {
            version: '2.0.0',
            lastUpdated: new Date().toISOString(),
            rituals: Array.from(this.rituals.values()).map(ritual => ritual.toJSON())
        };
        fs.writeFileSync(RITUAL_DEFINITIONS_FILE, JSON.stringify(data, null, 2));
    }
    
    saveInstances() {
        const data = {
            version: '2.0.0',
            lastUpdated: new Date().toISOString(),
            instances: Array.from(this.instances.values())
        };
        fs.writeFileSync(RITUAL_INSTANCES_FILE, JSON.stringify(data, null, 2));
    }
    
    saveCompletions() {
        const data = {
            version: '2.0.0',
            lastUpdated: new Date().toISOString(),
            completions: Object.fromEntries(this.completions)
        };
        fs.writeFileSync(COMPLETION_TRACKING_FILE, JSON.stringify(data, null, 2));
    }
    
    saveSyncHistory() {
        const data = {
            version: '2.0.0',
            lastUpdated: new Date().toISOString(),
            history: this.syncHistory
        };
        fs.writeFileSync(SYNC_HISTORY_FILE, JSON.stringify(data, null, 2));
    }
    
    // Core ritual management methods
    addRitual(config) {
        // Check for existing ritual with same name and type
        const existingRitual = this.findRitualByNameAndType(config.name, config.type);
        if (existingRitual) {
            console.log(`⚠️ Ritual with same name and type already exists: ${config.name} (${config.type})`);
            console.log(`   Existing UUID: ${existingRitual.uuid}`);
            console.log(`   Use updateRitual() or provide a different name to avoid duplicates`);
            return existingRitual;
        }
        
        // Create ritual instance to check for conflicts
        const newRitual = new RitualDefinition(config);
        
        // Check for time conflicts before adding
        const conflicts = this.detectTimeConflicts(newRitual);
        if (conflicts.length > 0) {
            throw new RitualConflictError(
                `Time conflicts detected for ritual "${newRitual.name}". Cannot create ritual with overlapping time blocks.`,
                conflicts
            );
        }
        
        this.rituals.set(newRitual.uuid, newRitual);
        this.saveRitualDefinitions();
        this.clearAvailabilityCache();
        
        console.log(`✅ Added ritual: ${newRitual.name} (UUID: ${newRitual.uuid})`);
        return newRitual;
    }
    
    findRitualByNameAndType(name, type) {
        for (const ritual of this.rituals.values()) {
            if (ritual.active && ritual.name === name && ritual.type === type) {
                return ritual;
            }
        }
        return null;
    }
    
    detectTimeConflicts(newRitual) {
        const conflicts = [];
        const sampleDates = this.generateSampleDates(30); // Check next 30 days
        
        for (const dateStr of sampleDates) {
            // Get new ritual's time blocks for this date
            const newRitualBlocks = newRitual.getTimeBlocksForDate(dateStr);
            if (newRitualBlocks.length === 0) continue;
            
            // Get existing rituals for this date
            const existingRituals = this.getRitualsForDate(dateStr);
            
            for (const newBlock of newRitualBlocks) {
                const newStart = TimeUtils.parseTime(newBlock.startTime);
                const newEnd = TimeUtils.parseTime(TimeUtils.addMinutes(newBlock.startTime, newBlock.duration));
                
                for (const { ritual: existingRitual, timeBlocks: existingBlocks } of existingRituals) {
                    // Skip if same ritual (for updates)
                    if (existingRitual.uuid === newRitual.uuid) continue;
                    
                    for (const existingBlock of existingBlocks) {
                        const existingStart = TimeUtils.parseTime(existingBlock.startTime);
                        const existingEnd = TimeUtils.parseTime(TimeUtils.addMinutes(existingBlock.startTime, existingBlock.duration));
                        
                        // Check for overlap
                        if (this.timeBlocksOverlap(newStart, newEnd, existingStart, existingEnd)) {
                            conflicts.push({
                                date: dateStr,
                                newRitual: {
                                    name: newRitual.name,
                                    type: newRitual.type,
                                    timeBlock: {
                                        startTime: newBlock.startTime,
                                        endTime: TimeUtils.addMinutes(newBlock.startTime, newBlock.duration),
                                        duration: newBlock.duration
                                    }
                                },
                                conflictingRitual: {
                                    name: existingRitual.name,
                                    type: existingRitual.type,
                                    uuid: existingRitual.uuid,
                                    timeBlock: {
                                        startTime: existingBlock.startTime,
                                        endTime: TimeUtils.addMinutes(existingBlock.startTime, existingBlock.duration),
                                        duration: existingBlock.duration
                                    }
                                },
                                overlapPeriod: {
                                    startTime: TimeUtils.formatTime(Math.max(newStart, existingStart)),
                                    endTime: TimeUtils.formatTime(Math.min(newEnd, existingEnd)),
                                    duration: Math.min(newEnd, existingEnd) - Math.max(newStart, existingStart)
                                }
                            });
                        }
                    }
                }
            }
        }
        
        return conflicts;
    }
    
    timeBlocksOverlap(start1, end1, start2, end2) {
        // Two time blocks overlap if one starts before the other ends
        // and the other starts before the first one ends
        return start1 < end2 && start2 < end1;
    }
    
    generateSampleDates(days = 30) {
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(TimeUtils.getDateString(date));
        }
        
        return dates;
    }
    
    updateRitual(uuid, updates) {
        const ritual = this.rituals.get(uuid);
        if (!ritual) {
            throw new Error(`Ritual not found: ${uuid}`);
        }
        
        Object.assign(ritual, updates);
        ritual.updated = new Date().toISOString();
        
        this.saveRitualDefinitions();
        this.clearAvailabilityCache();
        
        console.log(`✅ Updated ritual: ${ritual.name}`);
        return ritual;
    }
    
    removeRitual(uuid, deleteFromCalendar = false) {
        const ritual = this.rituals.get(uuid);
        if (!ritual) {
            throw new Error(`Ritual not found: ${uuid}`);
        }
        
        // Mark as inactive instead of deleting (for audit trail)
        ritual.active = false;
        ritual.updated = new Date().toISOString();
        
        this.saveRitualDefinitions();
        this.clearAvailabilityCache();
        
        console.log(`🗑️ Deactivated ritual: ${ritual.name}`);
        
        if (deleteFromCalendar) {
            // This would trigger calendar cleanup
            console.log(`📅 Calendar cleanup requested for ritual: ${ritual.name}`);
        }
        
        return ritual;
    }
    
    getRitualsForDate(dateStr) {
        const ritualsForDate = [];
        
        for (const ritual of this.rituals.values()) {
            if (ritual.isActiveOnDate(dateStr)) {
                ritualsForDate.push({
                    ritual,
                    timeBlocks: ritual.getTimeBlocksForDate(dateStr)
                });
            }
        }
        
        return ritualsForDate;
    }
    
    calculateAvailability(dateStr, options = {}) {
        const cacheKey = `${dateStr}-${JSON.stringify(options)}`;
        
        if (this.availabilityCache.has(cacheKey) && !options.bypassCache) {
            return this.availabilityCache.get(cacheKey);
        }
        
        const ritualsForDate = this.getRitualsForDate(dateStr);
        const blockedPeriods = [];
        
        // Collect all time blocks from active rituals
        ritualsForDate.forEach(({ ritual, timeBlocks }) => {
            timeBlocks.forEach(block => {
                blockedPeriods.push({
                    uuid: UUIDGenerator.generate(),
                    startTime: block.startTime,
                    endTime: TimeUtils.addMinutes(block.startTime, block.duration),
                    duration: block.duration,
                    type: 'ritual',
                    source: 'ritual',
                    ritualUuid: ritual.uuid,
                    ritualName: ritual.name,
                    ritualType: ritual.type,
                    priority: ritual.priority,
                    flexible: block.flexible || false,
                    blockUuid: block.uuid
                });
            });
        });
        
        // Sort by start time
        blockedPeriods.sort((a, b) => 
            TimeUtils.parseTime(a.startTime) - TimeUtils.parseTime(b.startTime)
        );
        
        // Calculate available windows
        const availableWindows = this.calculateAvailableWindows(blockedPeriods, options);
        
        const availability = {
            date: dateStr,
            dayOfWeek: TimeUtils.getDayOfWeek(dateStr),
            isWeekend: TimeUtils.isWeekend(dateStr),
            availableWindows,
            blockedPeriods,
            totalAvailableMinutes: availableWindows.reduce((sum, window) => sum + window.duration, 0),
            totalBlockedMinutes: blockedPeriods.reduce((sum, block) => sum + block.duration, 0),
            activeRitualCount: ritualsForDate.length,
            generated: new Date().toISOString()
        };
        
        // Cache the result
        this.availabilityCache.set(cacheKey, availability);
        
        return availability;
    }
    
    calculateAvailableWindows(blockedPeriods, options = {}) {
        const windows = [];
        const dayStart = (options.dayStart || 7) * 60; // Default 7:00 AM
        const dayEnd = (options.dayEnd || 23) * 60;    // Default 11:00 PM
        const minWindow = options.minWindow || 30;     // Minimum 30-minute windows
        
        let currentTime = dayStart;
        
        for (const block of blockedPeriods) {
            const blockStart = TimeUtils.parseTime(block.startTime);
            const blockEnd = TimeUtils.parseTime(block.endTime);
            
            // Add window before this block
            if (currentTime < blockStart) {
                const duration = blockStart - currentTime;
                if (duration >= minWindow) {
                    windows.push({
                        uuid: UUIDGenerator.generate(),
                        startTime: TimeUtils.formatTime(currentTime),
                        endTime: TimeUtils.formatTime(blockStart),
                        duration,
                        context: this.getTimeContext(currentTime),
                        availableFor: this.getAvailabilityContext(currentTime, duration)
                    });
                }
            }
            
            currentTime = Math.max(currentTime, blockEnd);
        }
        
        // Add final window
        if (currentTime < dayEnd) {
            const duration = dayEnd - currentTime;
            if (duration >= minWindow) {
                windows.push({
                    uuid: UUIDGenerator.generate(),
                    startTime: TimeUtils.formatTime(currentTime),
                    endTime: TimeUtils.formatTime(dayEnd),
                    duration,
                    context: this.getTimeContext(currentTime),
                    availableFor: this.getAvailabilityContext(currentTime, duration)
                });
            }
        }
        
        return windows;
    }
    
    getTimeContext(timeInMinutes) {
        const hour = Math.floor(timeInMinutes / 60);
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }
    
    getAvailabilityContext(timeInMinutes, duration) {
        const context = this.getTimeContext(timeInMinutes);
        const hours = Math.floor(duration / 60);
        
        if (duration >= 180) return `${context}-deep-work`;
        if (duration >= 90) return `${context}-focused`;
        if (duration >= 60) return `${context}-standard`;
        return `${context}-quick`;
    }
    
    clearAvailabilityCache(dateStr = null) {
        if (dateStr) {
            // Clear cache entries for specific date
            const keysToDelete = [];
            for (const key of this.availabilityCache.keys()) {
                if (key.startsWith(dateStr)) {
                    keysToDelete.push(key);
                }
            }
            keysToDelete.forEach(key => this.availabilityCache.delete(key));
        } else {
            // Clear all cache
            this.availabilityCache.clear();
        }
    }
    
    // Status and reporting
    getStatus(dateStr = null) {
        dateStr = dateStr || TimeUtils.getDateString();
        
        const availability = this.calculateAvailability(dateStr);
        const totalRituals = Array.from(this.rituals.values()).filter(r => r.active).length;
        
        return {
            date: dateStr,
            dayOfWeek: availability.dayOfWeek,
            isWeekend: availability.isWeekend,
            totalRituals,
            activeRitualsToday: availability.activeRitualCount,
            availableWindows: availability.availableWindows.length,
            totalAvailableTime: {
                minutes: availability.totalAvailableMinutes,
                hours: Math.floor(availability.totalAvailableMinutes / 60),
                display: `${Math.floor(availability.totalAvailableMinutes / 60)}h ${availability.totalAvailableMinutes % 60}m`
            },
            totalBlockedTime: {
                minutes: availability.totalBlockedMinutes,
                hours: Math.floor(availability.totalBlockedMinutes / 60),
                display: `${Math.floor(availability.totalBlockedMinutes / 60)}h ${availability.totalBlockedMinutes % 60}m`
            },
            rituals: availability.blockedPeriods.map(block => ({
                uuid: block.ritualUuid,
                name: block.ritualName,
                type: block.ritualType,
                startTime: block.startTime,
                endTime: block.endTime,
                duration: block.duration,
                priority: block.priority,
                flexible: block.flexible
            })),
            availability
        };
    }
    
    listRituals(filters = {}) {
        let rituals = Array.from(this.rituals.values());
        
        // Apply filters
        if (filters.type) {
            rituals = rituals.filter(r => r.type === filters.type);
        }
        
        if (filters.priority) {
            rituals = rituals.filter(r => r.priority === filters.priority);
        }
        
        if (filters.active !== undefined) {
            rituals = rituals.filter(r => r.active === filters.active);
        }
        
        if (filters.tags && filters.tags.length > 0) {
            rituals = rituals.filter(r => 
                filters.tags.some(tag => r.tags.includes(tag))
            );
        }
        
        return rituals.map(r => ({
            uuid: r.uuid,
            name: r.name,
            type: r.type,
            priority: r.priority,
            active: r.active,
            timeBlocks: r.timeBlocks.length,
            created: r.created,
            updated: r.updated,
            tags: r.tags
        }));
    }
}

module.exports = {
    RitualManagerV2,
    RitualDefinition,
    FrequencyEngine,
    TimeUtils,
    UUIDGenerator
};

// CLI interface will be added in a separate file for modularity
if (require.main === module) {
    console.log('Ritual Manager V2 Core Module');
    console.log('Use ritual-cli-v2.js for command line interface');
}