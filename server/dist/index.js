#!/usr/bin/env node
"use strict";
/**
 * Stoa API Server
 *
 * Local API server that runs on Mac mini to provide access to:
 * - ~/clawd workspace files
 * - OpenClaw config (~/.openclaw/config.json)
 * - Gateway control (restart, etc.)
 * - Memory files and search
 * - Skills directory
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const STOA_API_TOKEN = process.env.STOA_API_TOKEN || 'your-secret-token-here';
const CLAWD_DIR = path_1.default.join(process.env.HOME, 'clawd');
const OPENCLAW_CONFIG = path_1.default.join(process.env.HOME, '.openclaw', 'openclaw.json');
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
// Authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const token = authHeader.substring(7);
    if (token !== STOA_API_TOKEN) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    next();
};
// Apply auth to all routes except health
app.use((req, res, next) => {
    if (req.path === '/health') {
        return next();
    }
    authenticate(req, res, next);
});
// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});
// Read file from ~/clawd
app.post('/api/file/read', async (req, res) => {
    try {
        const { filePath } = req.body;
        if (!filePath) {
            return res.status(400).json({ error: 'filePath is required' });
        }
        const fullPath = path_1.default.join(CLAWD_DIR, filePath);
        // Security: ensure path is within CLAWD_DIR
        if (!fullPath.startsWith(CLAWD_DIR)) {
            return res.status(403).json({ error: 'Access denied: path outside workspace' });
        }
        const content = await promises_1.default.readFile(fullPath, 'utf-8');
        res.json({
            success: true,
            content,
            filePath
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Write file to ~/clawd
app.post('/api/file/write', async (req, res) => {
    try {
        const { filePath, content } = req.body;
        if (!filePath || content === undefined) {
            return res.status(400).json({ error: 'filePath and content are required' });
        }
        const fullPath = path_1.default.join(CLAWD_DIR, filePath);
        // Security: ensure path is within CLAWD_DIR
        if (!fullPath.startsWith(CLAWD_DIR)) {
            return res.status(403).json({ error: 'Access denied: path outside workspace' });
        }
        // Ensure directory exists
        await promises_1.default.mkdir(path_1.default.dirname(fullPath), { recursive: true });
        await promises_1.default.writeFile(fullPath, content, 'utf-8');
        const stats = await promises_1.default.stat(fullPath);
        res.json({
            success: true,
            filePath,
            size: stats.size
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// List files in ~/clawd
app.get('/api/files/list', async (req, res) => {
    try {
        const { dir = '' } = req.query;
        const targetDir = path_1.default.join(CLAWD_DIR, dir);
        // Security check
        if (!targetDir.startsWith(CLAWD_DIR)) {
            return res.status(403).json({ error: 'Access denied: path outside workspace' });
        }
        const entries = await promises_1.default.readdir(targetDir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (entry) => {
            const fullPath = path_1.default.join(targetDir, entry.name);
            const stats = await promises_1.default.stat(fullPath);
            const relativePath = path_1.default.relative(CLAWD_DIR, fullPath);
            return {
                name: entry.name,
                path: relativePath,
                isDirectory: entry.isDirectory(),
                size: stats.size,
                modified: stats.mtime.toISOString()
            };
        }));
        res.json({
            success: true,
            files: files.sort((a, b) => {
                // Directories first, then alphabetical
                if (a.isDirectory && !b.isDirectory)
                    return -1;
                if (!a.isDirectory && b.isDirectory)
                    return 1;
                return a.name.localeCompare(b.name);
            })
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// List memory files
app.get('/api/memory/list', async (req, res) => {
    try {
        const memoryDir = path_1.default.join(CLAWD_DIR, 'memory');
        const entries = await promises_1.default.readdir(memoryDir, { withFileTypes: true });
        const files = await Promise.all(entries
            .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
            .map(async (entry) => {
            const fullPath = path_1.default.join(memoryDir, entry.name);
            const stats = await promises_1.default.stat(fullPath);
            return {
                name: entry.name,
                path: `memory/${entry.name}`,
                size: stats.size,
                modified: stats.mtime.toISOString()
            };
        }));
        res.json({
            success: true,
            files: files.sort((a, b) => b.modified.localeCompare(a.modified))
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Search memory files
app.get('/api/memory/search', async (req, res) => {
    try {
        const { q: query, limit = '50' } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'query parameter required' });
        }
        const memoryDir = path_1.default.join(CLAWD_DIR, 'memory');
        const entries = await promises_1.default.readdir(memoryDir, { withFileTypes: true });
        const results = [];
        for (const entry of entries) {
            if (!entry.isFile() || !entry.name.endsWith('.md'))
                continue;
            const fullPath = path_1.default.join(memoryDir, entry.name);
            const content = await promises_1.default.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.toLowerCase().includes(query.toLowerCase())) {
                    const contextStart = Math.max(0, index - 2);
                    const contextEnd = Math.min(lines.length, index + 3);
                    const context = lines.slice(contextStart, contextEnd).join('\n');
                    results.push({
                        file: entry.name,
                        path: `memory/${entry.name}`,
                        line: index + 1,
                        content: line.trim(),
                        context
                    });
                }
            });
        }
        res.json({
            success: true,
            query,
            results: results.slice(0, parseInt(limit))
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// List skills
app.get('/api/skills/list', async (req, res) => {
    try {
        // Find OpenClaw installation
        const { stdout } = await execAsync('which openclaw');
        const openclawPath = stdout.trim();
        // Derive skills directory (assuming installed via npm globally)
        const skillsDir = path_1.default.join(path_1.default.dirname(path_1.default.dirname(openclawPath)), 'lib', 'node_modules', 'openclaw', 'skills');
        const entries = await promises_1.default.readdir(skillsDir, { withFileTypes: true });
        const skills = await Promise.all(entries
            .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
            .map(async (entry) => {
            const skillPath = path_1.default.join(skillsDir, entry.name, 'SKILL.md');
            try {
                const content = await promises_1.default.readFile(skillPath, 'utf-8');
                // Extract title and description from SKILL.md
                const lines = content.split('\n');
                const title = lines.find(l => l.startsWith('# '))?.substring(2).trim() || entry.name;
                const description = lines.find(l => l.trim() && !l.startsWith('#'))?.trim() || '';
                return {
                    name: entry.name,
                    title,
                    path: path_1.default.join('skills', entry.name),
                    description
                };
            }
            catch {
                return {
                    name: entry.name,
                    title: entry.name,
                    path: path_1.default.join('skills', entry.name),
                    description: 'No SKILL.md found'
                };
            }
        }));
        res.json({
            success: true,
            skills: skills.sort((a, b) => a.name.localeCompare(b.name))
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Get OpenClaw config
app.get('/api/config', async (req, res) => {
    try {
        const content = await promises_1.default.readFile(OPENCLAW_CONFIG, 'utf-8');
        const config = JSON.parse(content);
        res.json({
            success: true,
            config
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Write OpenClaw config
app.post('/api/config', async (req, res) => {
    try {
        const { config } = req.body;
        if (!config) {
            return res.status(400).json({ error: 'config is required' });
        }
        // Backup current config
        const backupPath = `${OPENCLAW_CONFIG}.backup.${Date.now()}`;
        await promises_1.default.copyFile(OPENCLAW_CONFIG, backupPath);
        // Write new config (pretty-printed)
        await promises_1.default.writeFile(OPENCLAW_CONFIG, JSON.stringify(config, null, 2), 'utf-8');
        res.json({
            success: true,
            config,
            backupPath
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Get heartbeat config
app.get('/api/heartbeat/config', async (req, res) => {
    try {
        const content = await promises_1.default.readFile(OPENCLAW_CONFIG, 'utf-8');
        const config = JSON.parse(content);
        const heartbeatConfig = {
            enabled: config.heartbeat?.enabled !== false,
            intervalMinutes: config.heartbeat?.intervalMinutes || 30,
            prompt: config.heartbeat?.prompt || 'Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.'
        };
        res.json({
            success: true,
            config: heartbeatConfig
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Update heartbeat config
app.post('/api/heartbeat/config', async (req, res) => {
    try {
        const { intervalMinutes } = req.body;
        if (!intervalMinutes || intervalMinutes < 1 || intervalMinutes > 1440) {
            return res.status(400).json({ error: 'intervalMinutes must be between 1 and 1440' });
        }
        // Read current config
        const content = await promises_1.default.readFile(OPENCLAW_CONFIG, 'utf-8');
        const config = JSON.parse(content);
        // Backup
        const backupPath = `${OPENCLAW_CONFIG}.backup.${Date.now()}`;
        await promises_1.default.copyFile(OPENCLAW_CONFIG, backupPath);
        // Update heartbeat config
        config.heartbeat = config.heartbeat || {};
        config.heartbeat.intervalMinutes = intervalMinutes;
        // Write updated config
        await promises_1.default.writeFile(OPENCLAW_CONFIG, JSON.stringify(config, null, 2), 'utf-8');
        res.json({
            success: true,
            config: {
                enabled: config.heartbeat.enabled !== false,
                intervalMinutes: config.heartbeat.intervalMinutes,
                prompt: config.heartbeat.prompt
            },
            backupPath
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Restart OpenClaw Gateway
app.post('/api/gateway/restart', async (req, res) => {
    try {
        const { reason } = req.body;
        // Use openclaw gateway restart command
        const { stdout, stderr } = await execAsync('openclaw gateway restart');
        res.json({
            success: true,
            message: 'Gateway restart initiated',
            reason,
            output: stdout,
            error: stderr
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// Get gateway status
app.get('/api/gateway/status', async (req, res) => {
    try {
        const { stdout } = await execAsync('openclaw gateway status');
        // Parse status output
        const isRunning = stdout.includes('running') || stdout.includes('active');
        res.json({
            success: true,
            running: isRunning,
            output: stdout
        });
    }
    catch (error) {
        res.json({
            success: true,
            running: false,
            error: error.message
        });
    }
});
// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});
// Start server
app.listen(PORT, () => {
    console.log(`🏛️  Stoa API Server running on http://localhost:${PORT}`);
    console.log(`📁 Workspace: ${CLAWD_DIR}`);
    console.log(`⚙️  Config: ${OPENCLAW_CONFIG}`);
    console.log(`🔐 Auth: ${STOA_API_TOKEN ? 'Enabled' : 'WARNING: No token set!'}`);
});
