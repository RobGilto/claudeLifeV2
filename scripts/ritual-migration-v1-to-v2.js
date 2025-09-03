#!/usr/bin/env node

/**
 * Ritual System Migration: V1 to V2
 * Purpose: Migrate data from timestamp-based ritual-manager.js to UUID-based ritual-manager-v2.js
 * Usage: node scripts/ritual-migration-v1-to-v2.js [--dry-run] [--backup]
 * Dependencies: ritual-manager.js, ritual-manager-v2.js
 * 
 * Features:
 * - Safe migration with backup creation
 * - Data validation and conflict detection
 * - Mapping of V1 patterns to V2 frequency engines
 * - UUID generation for cross-system tracking
 * - Completion history preservation
 * - Dry-run mode for testing
 */

const fs = require('fs');
const path = require('path');
const { RitualManagerV2, FrequencyEngine, UUIDGenerator } = require('./ritual-manager-v2.js');

// Configuration
const V1_RITUALS_DIR = path.join(__dirname, '..', 'rituals');
const V1_DEFINITIONS_FILE = path.join(V1_RITUALS_DIR, 'ritual-definitions.json');
const V1_COMPLETIONS_FILE = path.join(V1_RITUALS_DIR, 'ritual-completions.json');
const V1_BLOCKED_TIMES_FILE = path.join(V1_RITUALS_DIR, 'blocked-times.json');

const BACKUP_DIR = path.join(__dirname, '..', 'migration-backup');
const MIGRATION_LOG_FILE = path.join(__dirname, '..', 'logs', 'ritual-migration.log');

class RitualMigrationV1toV2 {
    constructor() {
        this.v2Manager = new RitualManagerV2();
        this.migrationResults = {
            totalV1Rituals: 0,
            successfulMigrations: 0,
            failedMigrations: 0,
            skippedMigrations: 0,
            migrationErrors: [],
            uuidMappings: {},
            completionsMigrated: 0,
            blockedTimesMigrated: 0
        };
        this.isDryRun = false;
        this.createBackup = true;
    }
    
    async migrate(options = {}) {
        this.isDryRun = options.dryRun || false;
        this.createBackup = options.backup !== false;
        
        console.log('🔄 Starting Ritual System Migration: V1 → V2');
        console.log('===============================================');
        
        if (this.isDryRun) {
            console.log('🧪 DRY RUN MODE - No changes will be made');
        }
        
        try {
            // Step 1: Validate V1 data exists
            await this.validateV1Data();
            
            // Step 2: Create backup if requested
            if (this.createBackup && !this.isDryRun) {
                await this.createDataBackup();
            }
            
            // Step 3: Load V1 data
            const v1Data = await this.loadV1Data();
            
            // Step 4: Migrate ritual definitions
            await this.migrateRitualDefinitions(v1Data.rituals);
            
            // Step 5: Migrate completion history
            await this.migrateCompletionHistory(v1Data.completions);
            
            // Step 6: Migrate blocked times (as one-time exceptions)
            await this.migrateBlockedTimes(v1Data.blockedTimes);
            
            // Step 7: Save V2 data (if not dry run)
            if (!this.isDryRun) {
                this.v2Manager.saveData();
                await this.saveMigrationReport();
            }
            
            // Step 8: Display results
            this.displayMigrationResults();
            
            return this.migrationResults;
            
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            this.logError('Migration failed', error);
            throw error;
        }
    }
    
    async validateV1Data() {
        console.log('\n📋 Validating V1 Data...');
        
        const files = [
            { path: V1_DEFINITIONS_FILE, name: 'ritual definitions' },
            { path: V1_COMPLETIONS_FILE, name: 'completions' },
            { path: V1_BLOCKED_TIMES_FILE, name: 'blocked times' }
        ];
        
        let foundData = false;
        
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                const stats = fs.statSync(file.path);
                console.log(`✅ Found ${file.name}: ${stats.size} bytes`);
                foundData = true;
            } else {
                console.log(`⚠️  Missing ${file.name}: ${file.path}`);
            }
        });
        
        if (!foundData) {
            throw new Error('No V1 data found to migrate. Check that ritual system V1 files exist.');
        }
        
        console.log('✅ V1 data validation complete');
    }
    
    async createDataBackup() {
        console.log('\n💾 Creating data backup...');
        
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupSubDir = path.join(BACKUP_DIR, `v1-backup-${timestamp}`);
        fs.mkdirSync(backupSubDir, { recursive: true });
        
        const filesToBackup = [
            V1_DEFINITIONS_FILE,
            V1_COMPLETIONS_FILE,
            V1_BLOCKED_TIMES_FILE
        ];
        
        filesToBackup.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                const fileName = path.basename(filePath);
                const backupPath = path.join(backupSubDir, fileName);
                fs.copyFileSync(filePath, backupPath);
                console.log(`📁 Backed up: ${fileName}`);
            }
        });
        
        // Create backup manifest
        const manifest = {
            backupDate: new Date().toISOString(),
            sourceSystem: 'ritual-manager-v1',
            targetSystem: 'ritual-manager-v2',
            files: filesToBackup.filter(f => fs.existsSync(f)).map(f => path.basename(f))
        };
        
        fs.writeFileSync(
            path.join(backupSubDir, 'backup-manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
        
        console.log(`✅ Backup created: ${backupSubDir}`);
    }
    
    async loadV1Data() {
        console.log('\n📥 Loading V1 data...');
        
        const data = {
            rituals: { rituals: [] },
            completions: { completions: {} },
            blockedTimes: { blocks: [] }
        };
        
        // Load ritual definitions
        if (fs.existsSync(V1_DEFINITIONS_FILE)) {
            data.rituals = JSON.parse(fs.readFileSync(V1_DEFINITIONS_FILE, 'utf8'));
            console.log(`📋 Loaded ${data.rituals.rituals.length} ritual definitions`);
        }
        
        // Load completions
        if (fs.existsSync(V1_COMPLETIONS_FILE)) {
            data.completions = JSON.parse(fs.readFileSync(V1_COMPLETIONS_FILE, 'utf8'));
            const completionCount = Object.keys(data.completions.completions || {}).length;
            console.log(`📊 Loaded ${completionCount} completion records`);
        }
        
        // Load blocked times
        if (fs.existsSync(V1_BLOCKED_TIMES_FILE)) {
            data.blockedTimes = JSON.parse(fs.readFileSync(V1_BLOCKED_TIMES_FILE, 'utf8'));
            console.log(`🚫 Loaded ${data.blockedTimes.blocks.length} blocked time records`);
        }
        
        this.migrationResults.totalV1Rituals = data.rituals.rituals.length;
        
        return data;
    }
    
    async migrateRitualDefinitions(ritualsData) {
        console.log('\n🔄 Migrating ritual definitions...');
        
        for (const v1Ritual of ritualsData.rituals) {
            try {
                console.log(`\n📋 Migrating: ${v1Ritual.name}`);
                
                // Generate new UUID for V2 system
                const newUuid = UUIDGenerator.generate();
                this.migrationResults.uuidMappings[v1Ritual.id] = newUuid;
                
                // Map V1 frequency to V2 pattern
                const frequencyPattern = this.mapV1FrequencyToV2(v1Ritual);
                
                // Map V1 time blocks to V2 format
                const timeBlocks = this.mapV1TimeBlocksToV2(v1Ritual.timeBlocks);
                
                // Create V2 ritual configuration
                const v2Config = {
                    uuid: newUuid,
                    name: v1Ritual.name,
                    type: v1Ritual.type,
                    description: v1Ritual.description || '',
                    priority: v1Ritual.priority || 'medium',
                    frequency: frequencyPattern,
                    timeBlocks: timeBlocks,
                    created: v1Ritual.created,
                    updated: new Date().toISOString(),
                    active: v1Ritual.active,
                    tags: [],
                    metadata: {
                        migratedFrom: 'v1',
                        originalId: v1Ritual.id,
                        migrationDate: new Date().toISOString()
                    },
                    integrations: {
                        taskwarrior: null,
                        calendar: null,
                        planning: null
                    }
                };
                
                // Validate V2 configuration
                this.validateV2Config(v2Config);
                
                // Add to V2 system (if not dry run)
                if (!this.isDryRun) {
                    const v2Ritual = this.v2Manager.addRitual(v2Config);
                    console.log(`✅ Migrated: ${v1Ritual.name} → ${newUuid}`);
                } else {
                    console.log(`🧪 Would migrate: ${v1Ritual.name} → ${newUuid}`);
                }
                
                this.migrationResults.successfulMigrations++;
                
            } catch (error) {
                console.error(`❌ Failed to migrate ${v1Ritual.name}:`, error.message);
                this.migrationResults.failedMigrations++;
                this.migrationResults.migrationErrors.push({
                    ritualName: v1Ritual.name,
                    ritualId: v1Ritual.id,
                    error: error.message
                });
            }
        }
    }
    
    mapV1FrequencyToV2(v1Ritual) {
        switch (v1Ritual.frequency) {
            case 'daily':
                return { type: 'daily' };
                
            case 'weekly':
                // Extract days from time blocks
                const weeklyDays = v1Ritual.timeBlocks
                    .filter(block => block.day !== 'daily')
                    .map(block => block.day)
                    .filter(day => ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day));
                
                return {
                    type: 'weekly',
                    days: weeklyDays.length > 0 ? weeklyDays : ['monday']
                };
                
            case 'custom':
                // Default to daily for custom patterns (V1 didn't implement complex custom patterns)
                console.log(`⚠️  V1 custom frequency converted to daily for ${v1Ritual.name}`);
                return { type: 'daily' };
                
            default:
                console.log(`⚠️  Unknown V1 frequency '${v1Ritual.frequency}' converted to daily for ${v1Ritual.name}`);
                return { type: 'daily' };
        }
    }
    
    mapV1TimeBlocksToV2(v1TimeBlocks) {
        return v1TimeBlocks.map(v1Block => ({
            uuid: UUIDGenerator.generate(),
            startTime: v1Block.startTime,
            duration: v1Block.duration,
            flexible: v1Block.flexible || false,
            context: this.getTimeContext(v1Block.startTime),
            metadata: {
                migratedFrom: 'v1',
                originalDay: v1Block.day
            }
        }));
    }
    
    getTimeContext(timeStr) {
        const hour = parseInt(timeStr.split(':')[0]);
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }
    
    validateV2Config(config) {
        const required = ['uuid', 'name', 'type', 'frequency', 'timeBlocks'];
        
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        if (!UUIDGenerator.isValid(config.uuid)) {
            throw new Error(`Invalid UUID: ${config.uuid}`);
        }
        
        if (!['foundational', 'work', 'life', 'maintenance'].includes(config.type)) {
            throw new Error(`Invalid ritual type: ${config.type}`);
        }
        
        if (!config.timeBlocks || config.timeBlocks.length === 0) {
            throw new Error('At least one time block is required');
        }
    }
    
    async migrateCompletionHistory(completionsData) {
        console.log('\n📊 Migrating completion history...');
        
        for (const [v1RitualId, v1CompletionData] of Object.entries(completionsData.completions || {})) {
            const v2Uuid = this.migrationResults.uuidMappings[v1RitualId];
            
            if (!v2Uuid) {
                console.log(`⚠️  Skipping completions for unmigrated ritual: ${v1RitualId}`);
                continue;
            }
            
            try {
                const v2CompletionData = {
                    ritualUuid: v2Uuid,
                    ritualName: v1CompletionData.ritualName,
                    history: v1CompletionData.history || [],
                    currentStreak: v1CompletionData.currentStreak || 0,
                    longestStreak: v1CompletionData.longestStreak || 0,
                    totalCompletions: v1CompletionData.totalCompletions || 0,
                    migratedFrom: 'v1',
                    migrationDate: new Date().toISOString()
                };
                
                if (!this.isDryRun) {
                    this.v2Manager.completions.set(v2Uuid, v2CompletionData);
                    console.log(`✅ Migrated completions: ${v1CompletionData.ritualName} (${v2CompletionData.totalCompletions} total)`);
                } else {
                    console.log(`🧪 Would migrate completions: ${v1CompletionData.ritualName} (${v2CompletionData.totalCompletions} total)`);
                }
                
                this.migrationResults.completionsMigrated++;
                
            } catch (error) {
                console.error(`❌ Failed to migrate completions for ${v1RitualId}:`, error.message);
                this.migrationResults.migrationErrors.push({
                    type: 'completion',
                    ritualId: v1RitualId,
                    error: error.message
                });
            }
        }
    }
    
    async migrateBlockedTimes(blockedTimesData) {
        console.log('\n🚫 Migrating blocked times...');
        
        // Note: V2 system doesn't have a separate blocked times file
        // Instead, we could create one-time ritual instances or log for manual review
        
        const activeBlocks = (blockedTimesData.blocks || []).filter(block => block.active);
        
        if (activeBlocks.length > 0) {
            console.log(`⚠️  Found ${activeBlocks.length} active blocked times from V1`);
            console.log('📝 V2 system handles time blocking differently.');
            console.log('📋 Consider manually creating temporary rituals or using calendar blocking.');
            
            // Log blocked times for manual review
            const blockedTimesLog = {
                migrationDate: new Date().toISOString(),
                note: 'These blocked times from V1 need manual review and migration',
                blocks: activeBlocks
            };
            
            if (!this.isDryRun) {
                const logPath = path.join(__dirname, '..', 'logs', 'v1-blocked-times-for-review.json');
                fs.writeFileSync(logPath, JSON.stringify(blockedTimesLog, null, 2));
                console.log(`📁 Blocked times logged for review: ${logPath}`);
            }
            
            this.migrationResults.blockedTimesMigrated = activeBlocks.length;
        } else {
            console.log('✅ No active blocked times to migrate');
        }
    }
    
    async saveMigrationReport() {
        const report = {
            migrationDate: new Date().toISOString(),
            sourceSystem: 'ritual-manager-v1',
            targetSystem: 'ritual-manager-v2',
            results: this.migrationResults,
            summary: {
                totalRituals: this.migrationResults.totalV1Rituals,
                successful: this.migrationResults.successfulMigrations,
                failed: this.migrationResults.failedMigrations,
                successRate: this.migrationResults.totalV1Rituals > 0 ? 
                    (this.migrationResults.successfulMigrations / this.migrationResults.totalV1Rituals * 100).toFixed(1) + '%' : '0%'
            },
            nextSteps: [
                'Review migrated rituals in V2 system',
                'Test ritual scheduling and availability calculation', 
                'Set up calendar sync if needed',
                'Review blocked times log for manual migration',
                'Update planning commands to use V2 system'
            ]
        };
        
        const reportPath = path.join(__dirname, '..', 'logs', 'ritual-migration-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 Migration report saved: ${reportPath}`);
    }
    
    displayMigrationResults() {
        console.log('\n🎯 Migration Results');
        console.log('===================');
        console.log(`📊 Total V1 rituals: ${this.migrationResults.totalV1Rituals}`);
        console.log(`✅ Successfully migrated: ${this.migrationResults.successfulMigrations}`);
        console.log(`❌ Failed migrations: ${this.migrationResults.failedMigrations}`);
        console.log(`⏭️  Skipped: ${this.migrationResults.skippedMigrations}`);
        console.log(`📈 Completions migrated: ${this.migrationResults.completionsMigrated}`);
        console.log(`🚫 Blocked times logged: ${this.migrationResults.blockedTimesMigrated}`);
        
        if (this.migrationResults.migrationErrors.length > 0) {
            console.log('\n❌ Migration Errors:');
            this.migrationResults.migrationErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.ritualName || error.type}: ${error.error}`);
            });
        }
        
        const successRate = this.migrationResults.totalV1Rituals > 0 ? 
            (this.migrationResults.successfulMigrations / this.migrationResults.totalV1Rituals * 100).toFixed(1) : 0;
        
        console.log(`\n📈 Success Rate: ${successRate}%`);
        
        if (!this.isDryRun && this.migrationResults.successfulMigrations > 0) {
            console.log('\n🎯 Next Steps:');
            console.log('1. Test V2 system: node scripts/ritual-cli-v2.js status');
            console.log('2. Review migrated rituals: node scripts/ritual-cli-v2.js list');
            console.log('3. Set up calendar sync: /ritual-sync day');
            console.log('4. Update planning workflow to use V2 commands');
        }
    }
    
    logError(message, error) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            message,
            error: error.message,
            stack: error.stack
        };
        
        const logDir = path.dirname(MIGRATION_LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        fs.appendFileSync(MIGRATION_LOG_FILE, JSON.stringify(logEntry) + '\n');
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        dryRun: args.includes('--dry-run'),
        backup: !args.includes('--no-backup')
    };
    
    const migration = new RitualMigrationV1toV2();
    
    migration.migrate(options).catch(error => {
        console.error('Migration failed:', error.message);
        process.exit(1);
    });
}

module.exports = { RitualMigrationV1toV2 };