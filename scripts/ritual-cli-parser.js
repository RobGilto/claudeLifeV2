#!/usr/bin/env node

/**
 * Rich CLI Parser for Natural Language Ritual Commands
 * Purpose: Parse complex natural language ritual management commands
 * Usage: Integrated with ritual-cli-v2.js for advanced command parsing
 * Dependencies: ritual-manager-v2.js, calendar-sync-manager.js
 * 
 * Features:
 * - Natural language frequency pattern parsing
 * - Complex command structure interpretation
 * - LLM-friendly command syntax
 * - Validation and error handling
 * - Command suggestion and auto-completion
 * - Batch operation parsing
 */

const { FrequencyEngine } = require('./ritual-manager-v2.js');

class RitualCLIParser {
    constructor() {
        this.commandPatterns = this.initializeCommandPatterns();
        this.frequencyPatterns = this.initializeFrequencyPatterns();
        this.timePatterns = this.initializeTimePatterns();
        this.validationRules = this.initializeValidationRules();
    }
    
    initializeCommandPatterns() {
        return {
            // Add ritual commands
            add: {
                patterns: [
                    /^ritual\s+add\s+"([^"]+)"/i,
                    /^add\s+ritual\s+"([^"]+)"/i,
                    /^create\s+ritual\s+"([^"]+)"/i,
                    /^new\s+ritual\s+"([^"]+)"/i
                ],
                requiredArgs: ['name'],
                optionalArgs: ['frequency', 'time', 'duration', 'type', 'priority', 'description']
            },
            
            // List/status commands
            list: {
                patterns: [
                    /^ritual\s+list/i,
                    /^list\s+rituals?/i,
                    /^show\s+rituals?/i,
                    /^rituals?\s+list/i
                ],
                requiredArgs: [],
                optionalArgs: ['filter', 'type', 'active', 'priority']
            },
            
            status: {
                patterns: [
                    /^ritual\s+status/i,
                    /^status/i,
                    /^availability/i,
                    /^show\s+status/i
                ],
                requiredArgs: [],
                optionalArgs: ['date']
            },
            
            // Edit/update commands
            edit: {
                patterns: [
                    /^ritual\s+edit\s+([a-f0-9-]{36})/i,
                    /^edit\s+ritual\s+([a-f0-9-]{36})/i,
                    /^update\s+ritual\s+([a-f0-9-]{36})/i,
                    /^modify\s+ritual\s+([a-f0-9-]{36})/i
                ],
                requiredArgs: ['uuid'],
                optionalArgs: ['name', 'frequency', 'time', 'duration', 'type', 'priority', 'description']
            },
            
            // Remove/delete commands
            remove: {
                patterns: [
                    /^ritual\s+remove\s+([a-f0-9-]{36})/i,
                    /^remove\s+ritual\s+([a-f0-9-]{36})/i,
                    /^delete\s+ritual\s+([a-f0-9-]{36})/i,
                    /^ritual\s+delete\s+([a-f0-9-]{36})/i
                ],
                requiredArgs: ['uuid'],
                optionalArgs: ['deleteFromCalendar']
            },
            
            // Calendar sync commands
            sync: {
                patterns: [
                    /^ritual\s+sync/i,
                    /^sync\s+rituals?/i,
                    /^calendar\s+sync/i,
                    /^sync\s+calendar/i
                ],
                requiredArgs: ['period'],
                optionalArgs: ['date', 'types', 'exclude', 'resolveConflicts']
            },
            
            // Completion tracking
            complete: {
                patterns: [
                    /^ritual\s+complete\s+([a-f0-9-]{36})/i,
                    /^complete\s+ritual\s+([a-f0-9-]{36})/i,
                    /^mark\s+complete\s+([a-f0-9-]{36})/i,
                    /^done\s+([a-f0-9-]{36})/i
                ],
                requiredArgs: ['uuid'],
                optionalArgs: ['date', 'time']
            },
            
            // Cleanup operations
            cleanup: {
                patterns: [
                    /^ritual\s+cleanup/i,
                    /^cleanup\s+rituals?/i,
                    /^clean\s+up/i
                ],
                requiredArgs: [],
                optionalArgs: ['olderThan', 'period', 'expired']
            }
        };
    }
    
    initializeFrequencyPatterns() {
        return {
            // Daily patterns
            daily: {
                patterns: [
                    /\b(daily|every\s+day)\b/i,
                    /--daily\b/i
                ],
                config: { type: 'daily' }
            },
            
            // Interval patterns
            interval: {
                patterns: [
                    /\bevery\s+(\d+)\s+days?\b/i,
                    /--interval[=:](\d+)\b/i,
                    /\bevery[_-]other[_-]day\b/i,
                    /--every-other-day\b/i
                ],
                parser: (match) => {
                    if (match[0].includes('other')) {
                        return { type: 'interval', interval: 2 };
                    }
                    return { type: 'interval', interval: parseInt(match[1]) };
                }
            },
            
            // Weekly patterns
            weekly: {
                patterns: [
                    /--weekly[=:]([\w,]+)/i,
                    /\bweekly\s+on\s+([\w,\s]+)\b/i,
                    /\bevery\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:,\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday))*/i,
                    /--weekly[=:]weekdays?\b/i,
                    /--weekly[=:]weekends?\b/i
                ],
                parser: (match) => {
                    const input = match[1] || match[0];
                    
                    if (/weekdays?/i.test(input)) {
                        return { 
                            type: 'weekly', 
                            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
                        };
                    }
                    
                    if (/weekends?/i.test(input)) {
                        return { 
                            type: 'weekly', 
                            days: ['saturday', 'sunday'] 
                        };
                    }
                    
                    const dayPattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/gi;
                    const days = input.match(dayPattern) || [];
                    
                    return { 
                        type: 'weekly', 
                        days: days.map(day => day.toLowerCase()) 
                    };
                }
            },
            
            // Monthly patterns
            monthly: {
                patterns: [
                    /--monthly\s+--days[=:]([0-9,last]+)/i,
                    /\bmonthly\s+on\s+([\w,\s-]+)\b/i,
                    /--monthly\s+--week-day[=:]([\w-]+)/i,
                    /\bfirst\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+of\s+month\b/i,
                    /\blast\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+of\s+month\b/i
                ],
                parser: (match) => {
                    const input = match[1] || match[0];
                    
                    // Handle specific days
                    if (/^\d+(,\d+)*$/.test(input) || input.includes('last')) {
                        const days = input.split(',').map(d => 
                            d.trim() === 'last' ? 'last' : parseInt(d.trim())
                        );
                        return { type: 'monthly', days };
                    }
                    
                    // Handle week-day patterns
                    const weekDayMatch = input.match(/(first|second|third|fourth|last)[_-]?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
                    if (weekDayMatch) {
                        return { 
                            type: 'monthly', 
                            weekDay: `${weekDayMatch[1]}-${weekDayMatch[2]}`.toLowerCase() 
                        };
                    }
                    
                    // Default to first of month
                    return { type: 'monthly', days: [1] };
                }
            },
            
            // Quarterly patterns
            quarterly: {
                patterns: [
                    /--quarterly\s+--months[=:]([1-3,]+)\s+--days[=:]([0-9,last]+)/i,
                    /\bquarterly\s+in\s+([\w,\s]+)\b/i,
                    /--quarterly\s+--week[=:](\w+)\s+--day[=:](\w+)/i
                ],
                parser: (match) => {
                    const input = match[0];
                    
                    // Parse months and days pattern
                    const monthsMatch = input.match(/--months[=:]([1-3,]+)/i);
                    const daysMatch = input.match(/--days[=:]([0-9,last]+)/i);
                    
                    if (monthsMatch && daysMatch) {
                        const months = monthsMatch[1].split(',').map(m => parseInt(m.trim()));
                        const days = daysMatch[1].split(',').map(d => 
                            d.trim() === 'last' ? 'last' : parseInt(d.trim())
                        );
                        return { type: 'quarterly', months, days };
                    }
                    
                    // Parse week-day pattern
                    const weekMatch = input.match(/--week[=:](\w+)/i);
                    const dayMatch = input.match(/--day[=:](\w+)/i);
                    
                    if (weekMatch && dayMatch) {
                        return { 
                            type: 'quarterly', 
                            week: weekMatch[1], 
                            weekDay: `${weekMatch[1]}-${dayMatch[1]}` 
                        };
                    }
                    
                    // Default to first day of first month
                    return { type: 'quarterly', months: [1], days: [1] };
                }
            }
        };
    }
    
    initializeTimePatterns() {
        return {
            time: {
                patterns: [
                    /--time[=:](\d{1,2}):(\d{2})/i,
                    /\bat\s+(\d{1,2}):(\d{2})/i,
                    /\b(\d{1,2}):(\d{2})\b/
                ],
                parser: (match) => `${match[1].padStart(2, '0')}:${match[2]}`
            },
            
            duration: {
                patterns: [
                    /--duration[=:](\d+)/i,
                    /\bfor\s+(\d+)\s+min(utes?)?\b/i,
                    /\b(\d+)\s+min(utes?)?\b/i,
                    /\bfor\s+(\d+)h?\b/i
                ],
                parser: (match) => {
                    const value = parseInt(match[1]);
                    // If it looks like hours, convert to minutes
                    if (match[0].includes('h') && value <= 12) {
                        return value * 60;
                    }
                    return value;
                }
            },
            
            startDate: {
                patterns: [
                    /--start[=:](\d{4}-\d{2}-\d{2})/i,
                    /\bstarting\s+(\d{4}-\d{2}-\d{2})/i,
                    /\bfrom\s+(\d{4}-\d{2}-\d{2})/i
                ],
                parser: (match) => match[1]
            },
            
            endDate: {
                patterns: [
                    /--end[=:](\d{4}-\d{2}-\d{2})/i,
                    /\bending\s+(\d{4}-\d{2}-\d{2})/i,
                    /\buntil\s+(\d{4}-\d{2}-\d{2})/i
                ],
                parser: (match) => match[1]
            }
        };
    }
    
    initializeValidationRules() {
        return {
            name: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-Z0-9\s\-_.,!?]+$/
            },
            
            type: {
                required: true,
                validValues: ['foundational', 'work', 'life', 'maintenance'],
                default: 'foundational'
            },
            
            priority: {
                required: false,
                validValues: ['high', 'medium', 'low'],
                default: 'medium'
            },
            
            time: {
                required: false,
                pattern: /^\d{2}:\d{2}$/,
                validator: (value) => {
                    const [hours, minutes] = value.split(':').map(Number);
                    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
                }
            },
            
            duration: {
                required: false,
                min: 5,
                max: 480, // 8 hours max
                default: 60
            },
            
            uuid: {
                required: true,
                pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
            }
        };
    }
    
    // Main parsing method
    parseCommand(commandString) {
        const normalizedCommand = commandString.trim();
        
        // Detect command type
        const commandType = this.detectCommandType(normalizedCommand);
        if (!commandType) {
            throw new Error(`Unrecognized command: ${normalizedCommand}`);
        }
        
        console.log(`🔍 Detected command type: ${commandType}`);
        
        // Parse arguments based on command type
        const args = this.parseCommandArguments(normalizedCommand, commandType);
        
        // Validate parsed arguments
        const validatedArgs = this.validateArguments(args, commandType);
        
        // Return parsed command structure
        return {
            type: commandType,
            originalCommand: commandString,
            parsedArgs: validatedArgs,
            timestamp: new Date().toISOString()
        };
    }
    
    detectCommandType(command) {
        for (const [type, config] of Object.entries(this.commandPatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(command)) {
                    return type;
                }
            }
        }
        return null;
    }
    
    parseCommandArguments(command, commandType) {
        const config = this.commandPatterns[commandType];
        const args = {};
        
        // Extract primary arguments from command pattern match
        for (const pattern of config.patterns) {
            const match = command.match(pattern);
            if (match) {
                // Map captured groups to argument names
                if (commandType === 'add' && match[1]) {
                    args.name = match[1];
                } else if ((commandType === 'edit' || commandType === 'remove' || commandType === 'complete') && match[1]) {
                    args.uuid = match[1];
                }
                break;
            }
        }
        
        // Parse frequency patterns
        const frequency = this.parseFrequencyFromCommand(command);
        if (frequency) {
            args.frequency = frequency;
        }
        
        // Parse time-related patterns
        for (const [timeType, timeConfig] of Object.entries(this.timePatterns)) {
            for (const pattern of timeConfig.patterns) {
                const match = command.match(pattern);
                if (match) {
                    args[timeType] = timeConfig.parser(match);
                    break;
                }
            }
        }
        
        // Parse other flags and options
        this.parseAdditionalFlags(command, args);
        
        return args;
    }
    
    parseFrequencyFromCommand(command) {
        for (const [freqType, freqConfig] of Object.entries(this.frequencyPatterns)) {
            for (const pattern of freqConfig.patterns) {
                const match = command.match(pattern);
                if (match) {
                    if (freqConfig.parser) {
                        return freqConfig.parser(match);
                    } else {
                        return freqConfig.config;
                    }
                }
            }
        }
        
        // Try natural language parsing as fallback
        try {
            return FrequencyEngine.parseNaturalLanguage(command);
        } catch (error) {
            return null;
        }
    }
    
    parseAdditionalFlags(command, args) {
        // Type flag
        const typeMatch = command.match(/--type[=:](\w+)/i);
        if (typeMatch) {
            args.type = typeMatch[1].toLowerCase();
        }
        
        // Priority flag
        const priorityMatch = command.match(/--priority[=:](\w+)/i);
        if (priorityMatch) {
            args.priority = priorityMatch[1].toLowerCase();
        }
        
        // Description flag
        const descMatch = command.match(/--description[=:]"([^"]+)"/i);
        if (descMatch) {
            args.description = descMatch[1];
        }
        
        // Flexible flag
        if (/--flexible\b/i.test(command)) {
            args.flexible = true;
        }
        
        // Calendar sync flags
        const periodMatch = command.match(/--period[=:](\w+)/i);
        if (periodMatch) {
            args.period = periodMatch[1].toLowerCase();
        }
        
        const dateMatch = command.match(/--date[=:](\d{4}-\d{2}-\d{2})/i);
        if (dateMatch) {
            args.date = dateMatch[1];
        }
        
        // Include/exclude types for sync
        const includeMatch = command.match(/--types[=:]([\w,]+)/i);
        if (includeMatch) {
            args.includeTypes = includeMatch[1].split(',').map(t => t.trim());
        }
        
        const excludeMatch = command.match(/--exclude[=:]([\w,]+)/i);
        if (excludeMatch) {
            args.excludeTypes = excludeMatch[1].split(',').map(t => t.trim());
        }
        
        // Delete from calendar flag
        if (/--delete-from-calendar\b/i.test(command)) {
            args.deleteFromCalendar = true;
        }
    }
    
    validateArguments(args, commandType) {
        const config = this.commandPatterns[commandType];
        const validated = { ...args };
        const errors = [];
        
        // Check required arguments
        for (const requiredArg of config.requiredArgs) {
            if (!validated[requiredArg]) {
                // Set defaults where possible
                if (requiredArg === 'period' && commandType === 'sync') {
                    validated[requiredArg] = 'day'; // Default to day sync
                } else if (this.validationRules[requiredArg]?.default) {
                    validated[requiredArg] = this.validationRules[requiredArg].default;
                } else {
                    errors.push(`Missing required argument: ${requiredArg}`);
                }
            }
        }
        
        // Validate argument values
        for (const [argName, value] of Object.entries(validated)) {
            const rule = this.validationRules[argName];
            if (rule) {
                const validation = this.validateSingleArgument(argName, value, rule);
                if (!validation.valid) {
                    errors.push(validation.error);
                } else if (validation.normalized) {
                    validated[argName] = validation.normalized;
                }
            }
        }
        
        // Command-specific validation
        if (commandType === 'add') {
            if (!validated.frequency) {
                validated.frequency = { type: 'daily' }; // Default frequency
            }
            if (!validated.type) {
                validated.type = 'foundational'; // Default type
            }
        }
        
        if (errors.length > 0) {
            throw new Error(`Validation errors: ${errors.join(', ')}`);
        }
        
        return validated;
    }
    
    validateSingleArgument(name, value, rule) {
        // Check pattern
        if (rule.pattern && !rule.pattern.test(value)) {
            return { 
                valid: false, 
                error: `Invalid format for ${name}: ${value}` 
            };
        }
        
        // Check valid values
        if (rule.validValues && !rule.validValues.includes(value)) {
            return { 
                valid: false, 
                error: `Invalid value for ${name}. Valid values: ${rule.validValues.join(', ')}` 
            };
        }
        
        // Check string length
        if (rule.minLength && value.length < rule.minLength) {
            return { 
                valid: false, 
                error: `${name} must be at least ${rule.minLength} characters` 
            };
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
            return { 
                valid: false, 
                error: `${name} must be no more than ${rule.maxLength} characters` 
            };
        }
        
        // Check numeric range
        if (typeof value === 'number') {
            if (rule.min && value < rule.min) {
                return { 
                    valid: false, 
                    error: `${name} must be at least ${rule.min}` 
                };
            }
            
            if (rule.max && value > rule.max) {
                return { 
                    valid: false, 
                    error: `${name} must be no more than ${rule.max}` 
                };
            }
        }
        
        // Custom validator
        if (rule.validator && !rule.validator(value)) {
            return { 
                valid: false, 
                error: `Invalid value for ${name}: ${value}` 
            };
        }
        
        return { valid: true };
    }
    
    // Command suggestions and help
    suggestCommand(partialCommand) {
        const suggestions = [];
        const normalized = partialCommand.toLowerCase().trim();
        
        // Find matching command patterns
        for (const [type, config] of Object.entries(this.commandPatterns)) {
            for (const pattern of config.patterns) {
                const patternStr = pattern.source.toLowerCase();
                if (patternStr.includes(normalized) || normalized.includes(type)) {
                    suggestions.push({
                        type,
                        example: this.generateExampleCommand(type),
                        description: this.getCommandDescription(type)
                    });
                }
            }
        }
        
        return suggestions;
    }
    
    generateExampleCommand(commandType) {
        const examples = {
            add: 'ritual add "Morning Exercise" --daily --time=07:00 --duration=30 --type=foundational',
            list: 'ritual list --active --type=foundational',
            status: 'ritual status',
            edit: 'ritual edit <uuid> --time=19:00',
            remove: 'ritual remove <uuid> --delete-from-calendar',
            sync: 'ritual sync --period=week --types=foundational,work',
            complete: 'ritual complete <uuid>',
            cleanup: 'ritual cleanup --older-than=2-weeks'
        };
        
        return examples[commandType] || `ritual ${commandType}`;
    }
    
    getCommandDescription(commandType) {
        const descriptions = {
            add: 'Create a new ritual with complex frequency patterns',
            list: 'List and filter existing rituals',
            status: 'Show ritual status and time availability',
            edit: 'Update an existing ritual',
            remove: 'Remove or deactivate a ritual',
            sync: 'Selectively sync rituals to Google Calendar',
            complete: 'Mark a ritual as completed',
            cleanup: 'Clean up expired calendar events'
        };
        
        return descriptions[commandType] || `Execute ${commandType} command`;
    }
    
    getCommandHelp(commandType = null) {
        if (commandType) {
            const config = this.commandPatterns[commandType];
            if (!config) {
                return `Unknown command: ${commandType}`;
            }
            
            return {
                type: commandType,
                description: this.getCommandDescription(commandType),
                example: this.generateExampleCommand(commandType),
                requiredArgs: config.requiredArgs,
                optionalArgs: config.optionalArgs,
                patterns: config.patterns.map(p => p.source)
            };
        }
        
        // Return overview of all commands
        return Object.keys(this.commandPatterns).map(type => ({
            type,
            description: this.getCommandDescription(type),
            example: this.generateExampleCommand(type)
        }));
    }
}

module.exports = { RitualCLIParser };

// CLI interface
if (require.main === module) {
    console.log('Ritual CLI Parser');
    console.log('Use ritual-cli-v2.js for full command line interface');
}