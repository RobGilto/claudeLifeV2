#!/usr/bin/env node
/**
 * TaskWarrior Project Management System
 * 
 * Purpose: Hierarchical project management with UUID linking for fractal planning integration
 * Usage: node taskwarrior-project-manager.js <command> [args]
 * Dependencies: taskwarrior, node.js
 * 
 * Commands:
 * - create-project: Create hierarchical project with subtasks
 * - break-down: Break large task into smaller subtasks
 * - project-view: Show project hierarchy and dependencies
 * - link-calendar: Link tasks to calendar events via UUID
 * - milestone-track: Track project milestones and dependencies
 * - progress-rollup: Calculate project completion from subtasks
 * 
 * Author: Claude Code Assistant
 * Created: 2025-09-02
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class TaskWarriorProjectManager {
    constructor() {
        this.logFile = path.join(__dirname, '../logs', `taskwarrior-pm-${new Date().toISOString().split('T')[0]}.log`);
        this.ensureLogDirectory();
        this.validateTaskWarrior();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    validateTaskWarrior() {
        try {
            execSync('task --version', { stdio: 'pipe' });
            this.log('TaskWarrior validation successful');
        } catch (error) {
            throw new Error('TaskWarrior not installed or not accessible');
        }
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp}: ${message}\n`;
        fs.appendFileSync(this.logFile, logEntry);
        console.log(message);
    }

    /**
     * Execute TaskWarrior command and return parsed output
     */
    executeTaskCommand(command, returnJson = false) {
        try {
            const fullCommand = `task ${command}`;
            this.log(`Executing: ${fullCommand}`);
            
            const result = execSync(fullCommand, { 
                encoding: 'utf8',
                stdio: 'pipe'
            });

            if (returnJson && result.trim()) {
                return JSON.parse(result);
            }
            
            return result;
        } catch (error) {
            this.log(`TaskWarrior command failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Create a hierarchical project with parent-child structure
     */
    async createProject(projectData) {
        const {
            name,
            description,
            project = 'portfolio',
            priority = 'M',
            subtasks = [],
            milestones = [],
            dependencies = []
        } = projectData;

        this.log(`Creating hierarchical project: ${name}`);

        // Generate unique project UUID for fractal linking
        const projectUuid = crypto.randomUUID();
        const fractalUuid = crypto.randomUUID();
        const trackingUuid = crypto.randomUUID();

        // Create parent task with project structure
        const parentTaskData = {
            description: `${name} - ${description}`,
            project: project,
            priority: priority,
            'uda.fractal_uuid': fractalUuid,
            'uda.project_uuid': projectUuid,
            'uda.tracking_uuid': trackingUuid,
            'uda.is_parent': 'true',
            'uda.milestone': milestones.length > 0 ? 'true' : 'false'
        };

        // Create the parent task
        const parentTask = this.createTask(parentTaskData);
        const parentUuid = this.extractTaskUuid(parentTask);

        this.log(`Created parent task with UUID: ${parentUuid}`);

        // Create subtasks with dependencies
        const subtaskUuids = [];
        for (let i = 0; i < subtasks.length; i++) {
            const subtask = subtasks[i];
            const subtaskUuid = await this.createSubtask({
                ...subtask,
                parentUuid: parentUuid,
                project: `${project}.${this.sanitizeProjectName(name)}`,
                dependencies: i > 0 ? [subtaskUuids[i-1]] : dependencies
            });
            subtaskUuids.push(subtaskUuid);
        }

        // Create milestone tasks if specified
        for (const milestone of milestones) {
            await this.createMilestone({
                ...milestone,
                parentUuid: parentUuid,
                project: `${project}.${this.sanitizeProjectName(name)}`,
                dependencies: subtaskUuids
            });
        }

        // Save project metadata for future reference
        await this.saveProjectMetadata({
            projectUuid,
            parentUuid,
            fractalUuid,
            trackingUuid,
            name,
            description,
            project,
            subtaskUuids,
            created: new Date().toISOString()
        });

        return {
            projectUuid,
            parentUuid,
            fractalUuid,
            trackingUuid,
            subtaskUuids,
            success: true
        };
    }

    /**
     * Create a subtask with parent linking
     */
    async createSubtask(subtaskData) {
        const {
            description,
            project,
            priority = 'M',
            parentUuid,
            dependencies = [],
            estimatedHours = 2
        } = subtaskData;

        const subtaskUuid = crypto.randomUUID();
        const fractalUuid = crypto.randomUUID();

        const taskData = {
            description: description,
            project: project,
            priority: priority,
            'uda.parent_uuid': parentUuid,
            'uda.fractal_uuid': fractalUuid,
            'uda.estimated_hours': estimatedHours.toString(),
            'uda.is_parent': 'false'
        };

        // Add dependencies if specified
        if (dependencies.length > 0) {
            taskData.depends = dependencies.join(',');
        }

        const task = this.createTask(taskData);
        const createdUuid = this.extractTaskUuid(task);

        this.log(`Created subtask: ${description} (UUID: ${createdUuid})`);
        return createdUuid;
    }

    /**
     * Create milestone task
     */
    async createMilestone(milestoneData) {
        const {
            name,
            description,
            project,
            parentUuid,
            dependencies = [],
            dueDate = null
        } = milestoneData;

        const milestoneUuid = crypto.randomUUID();
        
        const taskData = {
            description: `🎯 MILESTONE: ${name} - ${description}`,
            project: project,
            priority: 'H',
            'uda.parent_uuid': parentUuid,
            'uda.milestone': 'true',
            'uda.milestone_uuid': milestoneUuid
        };

        if (dependencies.length > 0) {
            taskData.depends = dependencies.join(',');
        }

        if (dueDate) {
            taskData.due = dueDate;
        }

        const task = this.createTask(taskData);
        const createdUuid = this.extractTaskUuid(task);

        this.log(`Created milestone: ${name} (UUID: ${createdUuid})`);
        return createdUuid;
    }

    /**
     * Create individual task with proper formatting
     */
    createTask(taskData) {
        let taskCommand = 'add';
        
        // Build command with all task attributes
        Object.entries(taskData).forEach(([key, value]) => {
            if (key === 'description') {
                taskCommand += ` "${value}"`;
            } else {
                taskCommand += ` ${key}:"${value}"`;
            }
        });

        return this.executeTaskCommand(taskCommand);
    }

    /**
     * Extract UUID from task creation output
     */
    extractTaskUuid(taskOutput) {
        const uuidMatch = taskOutput.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
        return uuidMatch ? uuidMatch[1] : null;
    }

    /**
     * Break down existing task into subtasks
     */
    async breakDownTask(taskUuid, subtasks) {
        this.log(`Breaking down task ${taskUuid} into ${subtasks.length} subtasks`);

        // Get original task details
        const originalTask = this.executeTaskCommand(`${taskUuid} export`, true)[0];
        
        if (!originalTask) {
            throw new Error(`Task ${taskUuid} not found`);
        }

        // Mark original as parent
        this.executeTaskCommand(`${taskUuid} modify uda.is_parent:true`);

        // Create subtasks
        const subtaskUuids = [];
        for (let i = 0; i < subtasks.length; i++) {
            const subtask = subtasks[i];
            const subtaskUuid = await this.createSubtask({
                ...subtask,
                parentUuid: taskUuid,
                project: originalTask.project || 'default',
                dependencies: i > 0 ? [subtaskUuids[i-1]] : []
            });
            subtaskUuids.push(subtaskUuid);
        }

        return subtaskUuids;
    }

    /**
     * Generate project hierarchy view
     */
    async generateProjectView(projectIdentifier) {
        this.log(`Generating project view for: ${projectIdentifier}`);

        // Get all tasks for the project
        let tasks;
        
        try {
            // Try as UUID first, then as project name
            if (projectIdentifier.includes('-')) {
                tasks = this.executeTaskCommand(`uuid:${projectIdentifier} export`, true);
            } else {
                tasks = this.executeTaskCommand(`project:${projectIdentifier} export`, true);
            }
        } catch (error) {
            tasks = [];
        }

        if (!tasks || tasks.length === 0) {
            return { error: `No tasks found for project: ${projectIdentifier}` };
        }

        // Build hierarchy
        const hierarchy = this.buildTaskHierarchy(tasks);
        
        // Generate visual representation
        const visualization = this.visualizeProjectHierarchy(hierarchy);
        
        return {
            projectIdentifier,
            totalTasks: tasks.length,
            hierarchy,
            visualization,
            completionRate: this.calculateCompletionRate(tasks)
        };
    }

    /**
     * Build task hierarchy from flat task list
     */
    buildTaskHierarchy(tasks) {
        const taskMap = new Map();
        const rootTasks = [];

        // Create map of all tasks
        tasks.forEach(task => {
            taskMap.set(task.uuid, {
                ...task,
                children: []
            });
        });

        // Build parent-child relationships
        tasks.forEach(task => {
            const parentUuid = task.uda_parent_uuid;
            if (parentUuid && taskMap.has(parentUuid)) {
                taskMap.get(parentUuid).children.push(taskMap.get(task.uuid));
            } else {
                rootTasks.push(taskMap.get(task.uuid));
            }
        });

        return rootTasks;
    }

    /**
     * Create visual representation of project hierarchy
     */
    visualizeProjectHierarchy(hierarchy, prefix = '', isLast = true) {
        let output = '';

        hierarchy.forEach((task, index) => {
            const isLastItem = index === hierarchy.length - 1;
            const connector = isLastItem ? '└── ' : '├── ';
            const status = task.status === 'completed' ? '✅' : '⏳';
            const milestone = task.uda_milestone === 'true' ? '🎯 ' : '';
            
            output += `${prefix}${connector}${status} ${milestone}${task.description}\n`;
            
            if (task.children && task.children.length > 0) {
                const childPrefix = prefix + (isLastItem ? '    ' : '│   ');
                output += this.visualizeProjectHierarchy(task.children, childPrefix, false);
            }
        });

        return output;
    }

    /**
     * Calculate project completion rate
     */
    calculateCompletionRate(tasks) {
        const completed = tasks.filter(task => task.status === 'completed').length;
        const total = tasks.length;
        
        return {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }

    /**
     * Link TaskWarrior task to Google Calendar event via UUID
     */
    async linkToCalendar(taskUuid, calendarEventData) {
        const {
            eventUuid,
            fractalUuid,
            trackingUuid,
            eventDate,
            startTime,
            endTime
        } = calendarEventData;

        // Update task with calendar linking UUIDs
        this.executeTaskCommand(`${taskUuid} modify uda.event_uuid:"${eventUuid}"`);
        this.executeTaskCommand(`${taskUuid} modify uda.fractal_uuid:"${fractalUuid}"`);
        this.executeTaskCommand(`${taskUuid} modify uda.tracking_uuid:"${trackingUuid}"`);
        this.executeTaskCommand(`${taskUuid} modify uda.calendar_date:"${eventDate}"`);
        this.executeTaskCommand(`${taskUuid} modify uda.scheduled_start:"${startTime}"`);
        this.executeTaskCommand(`${taskUuid} modify uda.scheduled_end:"${endTime}"`);

        this.log(`Linked task ${taskUuid} to calendar event ${eventUuid}`);

        return {
            taskUuid,
            eventUuid,
            fractalUuid,
            trackingUuid,
            linked: true
        };
    }

    /**
     * Save project metadata for tracking
     */
    async saveProjectMetadata(projectData) {
        const metadataDir = path.join(__dirname, '../planning/projects');
        if (!fs.existsSync(metadataDir)) {
            fs.mkdirSync(metadataDir, { recursive: true });
        }

        const filename = `project-${projectData.projectUuid}.json`;
        const filepath = path.join(metadataDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(projectData, null, 2));
        this.log(`Saved project metadata: ${filepath}`);
    }

    /**
     * Utility: Sanitize project name for TaskWarrior
     */
    sanitizeProjectName(name) {
        return name.toLowerCase()
                  .replace(/[^a-z0-9]/g, '_')
                  .replace(/_+/g, '_')
                  .replace(/^_|_$/g, '');
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const pm = new TaskWarriorProjectManager();

    try {
        switch (command) {
            case 'create-project':
                const projectData = JSON.parse(args[1] || '{}');
                const result = await pm.createProject(projectData);
                console.log(JSON.stringify(result, null, 2));
                break;

            case 'break-down':
                const taskUuid = args[1];
                const subtasks = JSON.parse(args[2] || '[]');
                const breakdown = await pm.breakDownTask(taskUuid, subtasks);
                console.log(JSON.stringify(breakdown, null, 2));
                break;

            case 'project-view':
                const projectId = args[1];
                const view = await pm.generateProjectView(projectId);
                console.log(view.visualization || JSON.stringify(view, null, 2));
                break;

            case 'link-calendar':
                const linkTaskUuid = args[1];
                const calendarData = JSON.parse(args[2] || '{}');
                const linkResult = await pm.linkToCalendar(linkTaskUuid, calendarData);
                console.log(JSON.stringify(linkResult, null, 2));
                break;

            case 'test':
                // Test with sample project
                const sampleProject = {
                    name: 'RuneQuest Character Tracker',
                    description: 'Web application for managing RuneQuest RPG characters',
                    project: 'portfolio',
                    priority: 'H',
                    subtasks: [
                        { 
                            description: 'Set up GitHub repository with proper structure',
                            estimatedHours: 1
                        },
                        { 
                            description: 'Create basic project structure and dependencies',
                            estimatedHours: 2
                        },
                        { 
                            description: 'Implement character creation form',
                            estimatedHours: 4
                        },
                        { 
                            description: 'Add skill calculation engine',
                            estimatedHours: 6
                        }
                    ],
                    milestones: [
                        {
                            name: 'MVP Release',
                            description: 'Minimum viable product with basic character creation',
                            dueDate: '2025-10-01'
                        }
                    ]
                };
                const testResult = await pm.createProject(sampleProject);
                console.log('Test project created:', JSON.stringify(testResult, null, 2));
                break;

            default:
                console.log(`
TaskWarrior Project Management System

Usage: node taskwarrior-project-manager.js <command> [args]

Commands:
  create-project <json>     Create hierarchical project with subtasks
  break-down <uuid> <json>  Break existing task into subtasks  
  project-view <id>         Show project hierarchy and progress
  link-calendar <uuid> <json> Link task to calendar event via UUID
  test                      Run test with sample project

Examples:
  node taskwarrior-project-manager.js test
  node taskwarrior-project-manager.js project-view portfolio
  node taskwarrior-project-manager.js project-view abc123-def456-...
                `);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = TaskWarriorProjectManager;