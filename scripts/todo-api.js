#!/usr/bin/env node

// API for Claude to interact with TODO system
import * as todoManager from './todo-manager.js';

function getTodos(format = 'json') {
    const todos = todoManager.loadTodos();
    
    if (format === 'markdown') {
        let md = '# Active TODOs\n\n';
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        
        todos.todos.sort((a, b) => {
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(b.created) - new Date(a.created);
        });
        
        todos.todos.forEach(todo => {
            const status = todo.status === 'in_progress' ? '🔄' : '⏳';
            const priority = todo.priority === 'high' ? '🔴' : todo.priority === 'medium' ? '🟡' : '🟢';
            md += `- ${status} **#${todo.id}** ${priority} [${todo.category}] ${todo.description}\n`;
            if (todo.tags.length > 0) {
                md += `  - Tags: ${todo.tags.join(', ')}\n`;
            }
            if (todo.notes.length > 0) {
                md += `  - Latest note: ${todo.notes[todo.notes.length - 1]}\n`;
            }
        });
        
        return md;
    }
    
    return JSON.stringify(todos, null, 2);
}

function getRituals(format = 'json') {
    const rituals = todoManager.loadRituals();
    const today = new Date().toISOString().split('T')[0];
    
    if (format === 'markdown') {
        let md = '# Daily Rituals\n\n';
        
        rituals.rituals.forEach(ritual => {
            const lastCompletion = ritual.history[ritual.history.length - 1];
            const completedToday = lastCompletion && lastCompletion.date === today;
            const status = completedToday ? '✅' : '⏳';
            
            md += `- ${status} **${ritual.name}** (${ritual.frequency} at ${ritual.time})\n`;
            if (ritual.description) {
                md += `  - ${ritual.description}\n`;
            }
            md += `  - Streak: ${ritual.streak} days\n`;
            md += `  - Total completions: ${ritual.totalCompletions}\n`;
        });
        
        return md;
    }
    
    return JSON.stringify(rituals, null, 2);
}

function getSummary() {
    const todos = todoManager.loadTodos();
    const archive = todoManager.loadArchive();
    const rituals = todoManager.loadRituals();
    const today = new Date().toISOString().split('T')[0];
    
    const summary = {
        todos: {
            active: todos.todos.length,
            byStatus: {},
            byPriority: { high: 0, medium: 0, low: 0 },
            byCategory: {}
        },
        completed: archive.archived.length,
        rituals: {
            total: rituals.rituals.length,
            completedToday: 0,
            pending: 0
        }
    };
    
    // Count todos by status, priority, category
    todos.todos.forEach(todo => {
        summary.todos.byStatus[todo.status] = (summary.todos.byStatus[todo.status] || 0) + 1;
        summary.todos.byPriority[todo.priority]++;
        summary.todos.byCategory[todo.category] = (summary.todos.byCategory[todo.category] || 0) + 1;
    });
    
    // Count ritual completions
    rituals.rituals.forEach(ritual => {
        const lastCompletion = ritual.history[ritual.history.length - 1];
        if (lastCompletion && lastCompletion.date === today) {
            summary.rituals.completedToday++;
        } else {
            summary.rituals.pending++;
        }
    });
    
    return JSON.stringify(summary, null, 2);
}

// CLI interface for API
const args = process.argv.slice(2);
const command = args[0];

switch(command) {
    case 'get-todos':
        console.log(getTodos(args[1]));
        break;
    case 'get-rituals':
        console.log(getRituals(args[1]));
        break;
    case 'summary':
        console.log(getSummary());
        break;
    case 'add':
        todoManager.addTodo(args[1], args[2], args[3], args[4]?.split(','));
        break;
    case 'complete':
        todoManager.completeTodo(args[1]);
        break;
    case 'ritual-check':
        todoManager.checkRitual(args[1]);
        break;
    default:
        console.log('API Commands: get-todos [json|markdown], get-rituals [json|markdown], summary, add, complete, ritual-check');
}

export { getTodos, getRituals, getSummary };