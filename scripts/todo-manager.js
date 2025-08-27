#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TODO_DIR = path.join(__dirname, '..', 'todos');
const ACTIVE_FILE = path.join(TODO_DIR, 'active-todos.json');
const ARCHIVE_FILE = path.join(TODO_DIR, 'archive-todos.json');
const RITUALS_FILE = path.join(TODO_DIR, 'rituals.json');
const BACKUP_DIR = path.join(TODO_DIR, 'backups');

// Ensure directories exist
function initStorage() {
    if (!fs.existsSync(TODO_DIR)) fs.mkdirSync(TODO_DIR);
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);
    
    // Initialize files if they don't exist
    if (!fs.existsSync(ACTIVE_FILE)) {
        fs.writeFileSync(ACTIVE_FILE, JSON.stringify({ todos: [], nextId: 1 }, null, 2));
    }
    if (!fs.existsSync(ARCHIVE_FILE)) {
        fs.writeFileSync(ARCHIVE_FILE, JSON.stringify({ archived: [] }, null, 2));
    }
    if (!fs.existsSync(RITUALS_FILE)) {
        fs.writeFileSync(RITUALS_FILE, JSON.stringify({ rituals: [] }, null, 2));
    }
}

// Load data
function loadTodos() {
    return JSON.parse(fs.readFileSync(ACTIVE_FILE, 'utf8'));
}

function loadArchive() {
    return JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
}

function loadRituals() {
    return JSON.parse(fs.readFileSync(RITUALS_FILE, 'utf8'));
}

// Save data with backup
function saveTodos(data) {
    // Create backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `todos-${timestamp}.json`);
    if (fs.existsSync(ACTIVE_FILE)) {
        fs.copyFileSync(ACTIVE_FILE, backupFile);
    }
    
    fs.writeFileSync(ACTIVE_FILE, JSON.stringify(data, null, 2));
}

function saveArchive(data) {
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(data, null, 2));
}

function saveRituals(data) {
    fs.writeFileSync(RITUALS_FILE, JSON.stringify(data, null, 2));
}

// Todo management functions
function addTodo(description, category = 'general', priority = 'medium', tags = []) {
    const data = loadTodos();
    const todo = {
        id: data.nextId++,
        description,
        category,
        priority,
        tags,
        status: 'pending',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        completed: null,
        notes: []
    };
    
    data.todos.push(todo);
    saveTodos(data);
    
    console.log(`✅ Added TODO #${todo.id}: ${description}`);
    return todo;
}

function updateTodo(id, updates) {
    const data = loadTodos();
    const todo = data.todos.find(t => t.id === parseInt(id));
    
    if (!todo) {
        console.log(`❌ TODO #${id} not found`);
        return null;
    }
    
    Object.assign(todo, updates, { updated: new Date().toISOString() });
    saveTodos(data);
    
    console.log(`✅ Updated TODO #${id}`);
    return todo;
}

function completeTodo(id) {
    const data = loadTodos();
    const todoIndex = data.todos.findIndex(t => t.id === parseInt(id));
    
    if (todoIndex === -1) {
        console.log(`❌ TODO #${id} not found`);
        return null;
    }
    
    const todo = data.todos[todoIndex];
    todo.status = 'completed';
    todo.completed = new Date().toISOString();
    
    // Move to archive
    const archive = loadArchive();
    archive.archived.push(todo);
    saveArchive(archive);
    
    // Remove from active
    data.todos.splice(todoIndex, 1);
    saveTodos(data);
    
    console.log(`✅ Completed TODO #${id}: ${todo.description}`);
    return todo;
}

function listTodos(filter = {}) {
    const data = loadTodos();
    let todos = data.todos;
    
    // Apply filters
    if (filter.status) {
        todos = todos.filter(t => t.status === filter.status);
    }
    if (filter.category) {
        todos = todos.filter(t => t.category === filter.category);
    }
    if (filter.priority) {
        todos = todos.filter(t => t.priority === filter.priority);
    }
    if (filter.tag) {
        todos = todos.filter(t => t.tags.includes(filter.tag));
    }
    
    // Sort by priority and creation date
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    todos.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.created) - new Date(a.created);
    });
    
    // Display
    if (todos.length === 0) {
        console.log('📭 No TODOs found');
        return;
    }
    
    console.log('\n📋 Active TODOs:\n');
    todos.forEach(todo => {
        const statusIcon = todo.status === 'in_progress' ? '🔄' : '⏳';
        const priorityIcon = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${statusIcon} #${todo.id} ${priorityIcon} [${todo.category}] ${todo.description}`);
        if (todo.tags.length > 0) {
            console.log(`   Tags: ${todo.tags.join(', ')}`);
        }
        if (todo.notes.length > 0) {
            console.log(`   Notes: ${todo.notes[todo.notes.length - 1]}`);
        }
    });
    
    return todos;
}

// Ritual management
function addRitual(name, frequency, time, description = '') {
    const data = loadRituals();
    const ritual = {
        id: Date.now(),
        name,
        frequency, // daily, weekly, monthly
        time, // preferred time (e.g., "09:00", "morning", "evening")
        description,
        created: new Date().toISOString(),
        lastCompleted: null,
        streak: 0,
        totalCompletions: 0,
        history: []
    };
    
    data.rituals.push(ritual);
    saveRituals(data);
    
    console.log(`✅ Added ritual: ${name} (${frequency} at ${time})`);
    return ritual;
}

function checkRitual(id) {
    const data = loadRituals();
    const ritual = data.rituals.find(r => r.id === parseInt(id) || r.name.toLowerCase() === id.toLowerCase());
    
    if (!ritual) {
        console.log(`❌ Ritual not found: ${id}`);
        return null;
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if already completed today
    const lastCompletion = ritual.history[ritual.history.length - 1];
    if (lastCompletion && lastCompletion.date === today) {
        console.log(`⚠️  Ritual "${ritual.name}" already completed today`);
        return ritual;
    }
    
    // Update ritual
    ritual.lastCompleted = now.toISOString();
    ritual.totalCompletions++;
    
    // Calculate streak
    if (lastCompletion) {
        const lastDate = new Date(lastCompletion.date);
        const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            ritual.streak++;
        } else {
            ritual.streak = 1;
        }
    } else {
        ritual.streak = 1;
    }
    
    ritual.history.push({
        date: today,
        time: now.toTimeString().split(' ')[0],
        completed: true
    });
    
    saveRituals(data);
    
    console.log(`✅ Completed ritual: ${ritual.name}`);
    console.log(`🔥 Current streak: ${ritual.streak} days`);
    console.log(`📊 Total completions: ${ritual.totalCompletions}`);
    
    return ritual;
}

function listRituals() {
    const data = loadRituals();
    const today = new Date().toISOString().split('T')[0];
    
    if (data.rituals.length === 0) {
        console.log('📭 No rituals set up');
        return;
    }
    
    console.log('\n🎯 Daily Rituals:\n');
    
    data.rituals.forEach(ritual => {
        const lastCompletion = ritual.history[ritual.history.length - 1];
        const completedToday = lastCompletion && lastCompletion.date === today;
        const icon = completedToday ? '✅' : '⏳';
        const streakIcon = ritual.streak > 0 ? `🔥${ritual.streak}` : '';
        
        console.log(`${icon} ${ritual.name} (${ritual.frequency} at ${ritual.time}) ${streakIcon}`);
        if (ritual.description) {
            console.log(`   ${ritual.description}`);
        }
        console.log(`   Total: ${ritual.totalCompletions} completions`);
    });
    
    return data.rituals;
}

// Stats and insights
function showStats() {
    const todos = loadTodos();
    const archive = loadArchive();
    const rituals = loadRituals();
    
    console.log('\n📊 TODO & Ritual Statistics:\n');
    console.log(`Active TODOs: ${todos.todos.length}`);
    console.log(`Completed TODOs: ${archive.archived.length}`);
    
    // Category breakdown
    const categories = {};
    todos.todos.forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + 1;
    });
    
    console.log('\nBy Category:');
    Object.entries(categories).forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
    });
    
    // Priority breakdown
    const priorities = { high: 0, medium: 0, low: 0 };
    todos.todos.forEach(t => {
        priorities[t.priority]++;
    });
    
    console.log('\nBy Priority:');
    console.log(`  🔴 High: ${priorities.high}`);
    console.log(`  🟡 Medium: ${priorities.medium}`);
    console.log(`  🟢 Low: ${priorities.low}`);
    
    // Ritual stats
    console.log('\n🎯 Ritual Performance:');
    rituals.rituals.forEach(ritual => {
        const completionRate = ritual.history.length > 0 
            ? ((ritual.totalCompletions / Math.ceil((Date.now() - new Date(ritual.created)) / (1000 * 60 * 60 * 24))) * 100).toFixed(1)
            : 0;
        console.log(`  ${ritual.name}: ${completionRate}% completion rate, ${ritual.streak} day streak`);
    });
    
    // Recent completions
    if (archive.archived.length > 0) {
        console.log('\n✅ Recently Completed:');
        archive.archived.slice(-5).reverse().forEach(todo => {
            const date = new Date(todo.completed).toLocaleDateString();
            console.log(`  ${date}: ${todo.description}`);
        });
    }
}

// Interactive mode
async function interactive() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const ask = (question) => new Promise(resolve => rl.question(question, resolve));
    
    console.log('\n🚀 TODO & Ritual Manager - Interactive Mode\n');
    
    while (true) {
        console.log('\nChoose an action:');
        console.log('  1. Add TODO');
        console.log('  2. List TODOs');
        console.log('  3. Complete TODO');
        console.log('  4. Update TODO status');
        console.log('  5. Add ritual');
        console.log('  6. Check off ritual');
        console.log('  7. List rituals');
        console.log('  8. Show stats');
        console.log('  9. Exit');
        
        const choice = await ask('\nYour choice: ');
        
        switch(choice) {
            case '1': {
                const desc = await ask('Description: ');
                const category = await ask('Category (general/work/personal/learning): ') || 'general';
                const priority = await ask('Priority (high/medium/low): ') || 'medium';
                const tags = (await ask('Tags (comma-separated): ')).split(',').filter(t => t.trim());
                addTodo(desc, category, priority, tags);
                break;
            }
            case '2':
                listTodos();
                break;
            case '3': {
                const id = await ask('TODO ID to complete: ');
                completeTodo(id);
                break;
            }
            case '4': {
                const id = await ask('TODO ID to update: ');
                const status = await ask('New status (pending/in_progress): ');
                updateTodo(id, { status });
                break;
            }
            case '5': {
                const name = await ask('Ritual name: ');
                const frequency = await ask('Frequency (daily/weekly/monthly): ');
                const time = await ask('Preferred time: ');
                const description = await ask('Description (optional): ');
                addRitual(name, frequency, time, description);
                break;
            }
            case '6': {
                const id = await ask('Ritual name or ID: ');
                checkRitual(id);
                break;
            }
            case '7':
                listRituals();
                break;
            case '8':
                showStats();
                break;
            case '9':
                rl.close();
                return;
            default:
                console.log('Invalid choice');
        }
    }
}

// CLI argument parsing
function main() {
    initStorage();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch(command) {
        case 'add':
            if (args.length < 2) {
                console.log('Usage: todo add "description" [category] [priority] [tags]');
                return;
            }
            addTodo(args[1], args[2], args[3], args[4]?.split(',') || []);
            break;
            
        case 'list':
            const filter = {};
            if (args[1]) filter.status = args[1];
            if (args[2]) filter.category = args[2];
            listTodos(filter);
            break;
            
        case 'complete':
            if (args.length < 2) {
                console.log('Usage: todo complete <id>');
                return;
            }
            completeTodo(args[1]);
            break;
            
        case 'update':
            if (args.length < 3) {
                console.log('Usage: todo update <id> <status>');
                return;
            }
            updateTodo(args[1], { status: args[2] });
            break;
            
        case 'ritual':
            if (args[1] === 'add') {
                if (args.length < 5) {
                    console.log('Usage: todo ritual add "name" frequency time ["description"]');
                    return;
                }
                addRitual(args[2], args[3], args[4], args[5]);
            } else if (args[1] === 'check') {
                if (args.length < 3) {
                    console.log('Usage: todo ritual check <name or id>');
                    return;
                }
                checkRitual(args[2]);
            } else if (args[1] === 'list') {
                listRituals();
            } else {
                console.log('Usage: todo ritual [add|check|list]');
            }
            break;
            
        case 'stats':
            showStats();
            break;
            
        case 'interactive':
        case undefined:
            interactive();
            break;
            
        case 'help':
        default:
            console.log(`
TODO & Ritual Manager
=====================

Commands:
  todo add "description" [category] [priority] [tags]  - Add a new TODO
  todo list [status] [category]                       - List TODOs with optional filters
  todo complete <id>                                  - Mark TODO as complete
  todo update <id> <status>                           - Update TODO status
  todo ritual add "name" frequency time ["desc"]      - Add a new ritual
  todo ritual check <name or id>                      - Check off a ritual
  todo ritual list                                    - List all rituals
  todo stats                                          - Show statistics
  todo interactive                                     - Enter interactive mode
  todo help                                           - Show this help

Categories: general, work, personal, learning
Priorities: high, medium, low
Status: pending, in_progress, completed
Frequency: daily, weekly, monthly

Examples:
  todo add "Review AI papers" learning high research,papers
  todo ritual add "Morning meditation" daily 09:00 "10 min mindfulness"
  todo ritual check meditation
  todo list pending work
`);
            break;
    }
}

// Export for use as module
export {
    addTodo,
    updateTodo,
    completeTodo,
    listTodos,
    addRitual,
    checkRitual,
    listRituals,
    showStats,
    loadTodos,
    loadArchive,
    loadRituals
};

// Run if called directly
main();