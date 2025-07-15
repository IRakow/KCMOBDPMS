// ConversationLogService.js - Centralized Conversation Logging and Archival
class ConversationLogService {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('conversationLogs') || '[]');
        this.aiTranscripts = JSON.parse(localStorage.getItem('aiTranscripts') || '[]');
        this.searchIndex = this.buildSearchIndex();
    }

    // Log any conversation (text, voice, AI)
    logConversation(conversationData) {
        const logEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            type: conversationData.type || 'text', // text, voice, ai, broadcast
            participantId: conversationData.participantId,
            participantName: conversationData.participantName,
            participantType: conversationData.participantType, // tenant, owner, vendor, admin
            propertyId: conversationData.propertyId,
            propertyName: conversationData.propertyName,
            unitNumber: conversationData.unitNumber,
            subject: conversationData.subject,
            content: conversationData.content,
            metadata: {
                channel: conversationData.channel || 'messaging_hub', // messaging_hub, maintenance_chat, voice_assistant
                priority: conversationData.priority || 'normal',
                tags: conversationData.tags || [],
                linkedTickets: conversationData.linkedTickets || [],
                attachments: conversationData.attachments || [],
                sentiment: conversationData.sentiment || 'neutral',
                aiAssisted: conversationData.aiAssisted || false,
                isInbound: conversationData.isInbound || true,
                responseTime: conversationData.responseTime || null,
                resolved: conversationData.resolved || false,
                urgency: conversationData.urgency || 'normal'
            },
            searchableText: this.createSearchableText(conversationData)
        };

        this.logs.unshift(logEntry); // Add to beginning for recent-first order
        this.persistLogs();
        this.updateSearchIndex(logEntry);
        
        return logEntry;
    }

    // Log AI conversation specifically
    logAIConversation(aiData) {
        const transcript = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            conversationType: aiData.conversationType || 'chat', // chat, voice, analysis
            userId: aiData.userId,
            userName: aiData.userName,
            userType: aiData.userType,
            propertyContext: aiData.propertyContext,
            aiModel: aiData.aiModel || 'claude',
            prompt: aiData.prompt,
            response: aiData.response,
            metadata: {
                tokens: aiData.tokens || null,
                confidence: aiData.confidence || null,
                sentiment: aiData.sentiment || 'neutral',
                intent: aiData.intent || 'unknown',
                entities: aiData.entities || [],
                followUpNeeded: aiData.followUpNeeded || false,
                escalated: aiData.escalated || false,
                satisfaction: aiData.satisfaction || null
            },
            conversationContext: aiData.conversationContext || null,
            relatedTickets: aiData.relatedTickets || [],
            searchableText: `${aiData.prompt} ${aiData.response}`.toLowerCase()
        };

        this.aiTranscripts.unshift(transcript);
        this.persistAITranscripts();
        
        // Also log in main conversation log
        this.logConversation({
            type: 'ai',
            participantId: aiData.userId,
            participantName: aiData.userName,
            participantType: aiData.userType,
            propertyId: aiData.propertyContext?.propertyId,
            propertyName: aiData.propertyContext?.propertyName,
            content: `AI Conversation - Prompt: ${aiData.prompt}\nResponse: ${aiData.response}`,
            channel: 'ai_assistant',
            aiAssisted: true,
            metadata: {
                aiModel: aiData.aiModel,
                intent: aiData.intent,
                entities: aiData.entities
            }
        });
        
        return transcript;
    }

    // Search conversations
    searchConversations(query, filters = {}) {
        const searchTerm = query.toLowerCase();
        let results = this.logs.filter(log => 
            log.searchableText.includes(searchTerm)
        );

        // Apply filters
        if (filters.participantType) {
            results = results.filter(log => log.participantType === filters.participantType);
        }
        
        if (filters.propertyId) {
            results = results.filter(log => log.propertyId === filters.propertyId);
        }
        
        if (filters.dateRange) {
            const start = new Date(filters.dateRange.start);
            const end = new Date(filters.dateRange.end);
            results = results.filter(log => {
                const logDate = new Date(log.timestamp);
                return logDate >= start && logDate <= end;
            });
        }
        
        if (filters.type) {
            results = results.filter(log => log.type === filters.type);
        }
        
        if (filters.priority) {
            results = results.filter(log => log.metadata.priority === filters.priority);
        }
        
        if (filters.resolved !== undefined) {
            results = results.filter(log => log.metadata.resolved === filters.resolved);
        }

        return results;
    }

    // Get conversation analytics
    getAnalytics(timeframe = '30d') {
        const cutoffDate = this.getDateCutoff(timeframe);
        const recentLogs = this.logs.filter(log => 
            new Date(log.timestamp) >= cutoffDate
        );

        return {
            totalConversations: recentLogs.length,
            byType: this.groupBy(recentLogs, 'type'),
            byParticipantType: this.groupBy(recentLogs, 'participantType'),
            byProperty: this.groupBy(recentLogs, 'propertyName'),
            byChannel: this.groupBy(recentLogs, log => log.metadata.channel),
            averageResponseTime: this.calculateAverageResponseTime(recentLogs),
            resolutionRate: this.calculateResolutionRate(recentLogs),
            sentimentAnalysis: this.groupBy(recentLogs, log => log.metadata.sentiment),
            urgentConversations: recentLogs.filter(log => log.metadata.urgency === 'urgent').length,
            aiAssistedConversations: recentLogs.filter(log => log.metadata.aiAssisted).length,
            topTags: this.getTopTags(recentLogs),
            dailyVolume: this.getDailyVolume(recentLogs)
        };
    }

    // Export conversations
    exportConversations(format, filters = {}) {
        const conversations = this.searchConversations('', filters);
        
        switch (format) {
            case 'csv':
                return this.exportToCSV(conversations);
            case 'json':
                return this.exportToJSON(conversations);
            case 'pdf':
                return this.exportToPDF(conversations);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    // Archive old conversations
    archiveOldConversations(daysOld = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        const toArchive = this.logs.filter(log => 
            new Date(log.timestamp) < cutoffDate
        );
        
        const remaining = this.logs.filter(log => 
            new Date(log.timestamp) >= cutoffDate
        );
        
        // Store archived conversations separately
        const existingArchive = JSON.parse(localStorage.getItem('archivedConversations') || '[]');
        const newArchive = [...existingArchive, ...toArchive];
        localStorage.setItem('archivedConversations', JSON.stringify(newArchive));
        
        // Update active logs
        this.logs = remaining;
        this.persistLogs();
        
        return {
            archived: toArchive.length,
            remaining: remaining.length
        };
    }

    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    createSearchableText(data) {
        return `${data.participantName || ''} ${data.propertyName || ''} ${data.unitNumber || ''} ${data.subject || ''} ${data.content || ''}`.toLowerCase();
    }

    buildSearchIndex() {
        // Simple inverted index for faster searching
        const index = {};
        this.logs.forEach(log => {
            const words = log.searchableText.split(/\s+/);
            words.forEach(word => {
                if (!index[word]) index[word] = [];
                index[word].push(log.id);
            });
        });
        return index;
    }

    updateSearchIndex(logEntry) {
        const words = logEntry.searchableText.split(/\s+/);
        words.forEach(word => {
            if (!this.searchIndex[word]) this.searchIndex[word] = [];
            this.searchIndex[word].push(logEntry.id);
        });
    }

    groupBy(array, keyFunc) {
        return array.reduce((groups, item) => {
            const key = typeof keyFunc === 'function' ? keyFunc(item) : item[keyFunc];
            groups[key] = (groups[key] || 0) + 1;
            return groups;
        }, {});
    }

    calculateAverageResponseTime(logs) {
        const responseTimes = logs
            .filter(log => log.metadata.responseTime)
            .map(log => log.metadata.responseTime);
        
        if (responseTimes.length === 0) return 0;
        
        const total = responseTimes.reduce((sum, time) => sum + time, 0);
        return Math.round(total / responseTimes.length);
    }

    calculateResolutionRate(logs) {
        const resolved = logs.filter(log => log.metadata.resolved).length;
        return logs.length > 0 ? Math.round((resolved / logs.length) * 100) : 0;
    }

    getTopTags(logs) {
        const tagCounts = {};
        logs.forEach(log => {
            log.metadata.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        return Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }));
    }

    getDailyVolume(logs) {
        const dailyVolume = {};
        logs.forEach(log => {
            const date = new Date(log.timestamp).toISOString().split('T')[0];
            dailyVolume[date] = (dailyVolume[date] || 0) + 1;
        });
        return dailyVolume;
    }

    getDateCutoff(timeframe) {
        const date = new Date();
        switch (timeframe) {
            case '7d':
                date.setDate(date.getDate() - 7);
                break;
            case '30d':
                date.setDate(date.getDate() - 30);
                break;
            case '90d':
                date.setDate(date.getDate() - 90);
                break;
            case '1y':
                date.setFullYear(date.getFullYear() - 1);
                break;
            default:
                date.setDate(date.getDate() - 30);
        }
        return date;
    }

    exportToCSV(conversations) {
        const headers = ['Timestamp', 'Type', 'Participant', 'Property', 'Subject', 'Content', 'Channel', 'Priority', 'Resolved'];
        const rows = conversations.map(conv => [
            conv.timestamp,
            conv.type,
            `${conv.participantName} (${conv.participantType})`,
            conv.propertyName,
            conv.subject || '',
            conv.content.replace(/"/g, '""'), // Escape quotes
            conv.metadata.channel,
            conv.metadata.priority,
            conv.metadata.resolved ? 'Yes' : 'No'
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');
        
        return csvContent;
    }

    exportToJSON(conversations) {
        return JSON.stringify(conversations, null, 2);
    }

    exportToPDF(conversations) {
        // This would integrate with a PDF library like jsPDF
        // For now, return formatted text that could be converted to PDF
        return conversations.map(conv => 
            `Date: ${new Date(conv.timestamp).toLocaleString()}\n` +
            `Type: ${conv.type}\n` +
            `Participant: ${conv.participantName} (${conv.participantType})\n` +
            `Property: ${conv.propertyName}\n` +
            `Subject: ${conv.subject || 'N/A'}\n` +
            `Content: ${conv.content}\n` +
            `Channel: ${conv.metadata.channel}\n` +
            `Priority: ${conv.metadata.priority}\n` +
            `Resolved: ${conv.metadata.resolved ? 'Yes' : 'No'}\n` +
            `${'='.repeat(80)}\n\n`
        ).join('');
    }

    persistLogs() {
        localStorage.setItem('conversationLogs', JSON.stringify(this.logs));
    }

    persistAITranscripts() {
        localStorage.setItem('aiTranscripts', JSON.stringify(this.aiTranscripts));
    }

    // Get recent conversations for dashboard
    getRecentConversations(limit = 10) {
        return this.logs.slice(0, limit);
    }

    // Get conversations by participant
    getParticipantConversations(participantId) {
        return this.logs.filter(log => log.participantId === participantId);
    }

    // Mark conversation as resolved
    markResolved(conversationId, resolved = true) {
        const log = this.logs.find(l => l.id === conversationId);
        if (log) {
            log.metadata.resolved = resolved;
            log.metadata.resolvedAt = resolved ? new Date().toISOString() : null;
            this.persistLogs();
        }
        return log;
    }

    // Add tags to conversation
    addTags(conversationId, tags) {
        const log = this.logs.find(l => l.id === conversationId);
        if (log) {
            log.metadata.tags = [...new Set([...log.metadata.tags, ...tags])];
            this.persistLogs();
        }
        return log;
    }

    // Get conversation statistics
    getStats() {
        const total = this.logs.length;
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = this.logs.filter(log => 
            log.timestamp.split('T')[0] === today
        );
        
        return {
            total,
            today: todayLogs.length,
            unresolved: this.logs.filter(log => !log.metadata.resolved).length,
            urgent: this.logs.filter(log => log.metadata.urgency === 'urgent').length,
            aiAssisted: this.logs.filter(log => log.metadata.aiAssisted).length
        };
    }
}

// Global instance
window.ConversationLogService = new ConversationLogService();