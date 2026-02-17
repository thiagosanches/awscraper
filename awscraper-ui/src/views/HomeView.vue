<script setup>
import { ref, computed, onMounted } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const loading = ref(false)
const error = ref(null)
const stats = ref([])
const recentResources = ref([])
const alerts = ref([])
const regionDistribution = ref([])

const typeIconMap = {
  'Lambda': { icon: 'λ', color: '#10b981' },
  'EC2': { icon: 'EC2', color: '#f59e0b' },
  'S3': { icon: 'S3', color: '#06b6d4' },
  'RDS': { icon: 'RDS', color: '#14b8a6' },
  'DynamoDB': { icon: 'DDB', color: '#6366f1' },
  'API-Gateway': { icon: 'API', color: '#3b82f6' },
  'SecurityGroup': { icon: 'SG', color: '#8b5cf6' },
  'CloudFront': { icon: 'CF', color: '#ec4899' },
  'SNS': { icon: 'SNS', color: '#ec4899' },
  'SQS': { icon: 'SQS', color: '#f59e0b' },
  'EBS': { icon: 'EBS', color: '#f97316' },
  'NAT': { icon: 'NAT', color: '#06b6d4' }
}

const fetchDashboardData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Fetch stats from API
    const statsResponse = await fetch(`${API_BASE_URL}/stats`)
    if (!statsResponse.ok) throw new Error('Failed to fetch stats')
    
    const statsData = await statsResponse.json()
    
    // Map stats data to cards
    const statCards = [
      { icon: 'RES', label: 'Total Resources', value: statsData.total.toString(), trend: '', color: '#3b82f6' }
    ]
    
    // Add cards for each type (byType is an array of {Type, count} objects)
    statsData.byType.forEach((item) => {
      const mapping = typeIconMap[item.Type] || { icon: 'RES', color: '#64748b' }
      statCards.push({
        icon: mapping.icon,
        label: item.Type,
        value: item.count.toString(),
        trend: '',
        color: mapping.color
      })
    })
    
    stats.value = statCards.slice(0, 8) // Limit to 8 cards
    
    // Build region distribution (byRegion is also an array of {Region, count} objects)
    const regions = statsData.byRegion.map((item) => ({
      region: item.Region,
      count: item.count,
      percentage: Math.round((item.count / statsData.total) * 100)
    }))
    // Sort by count descending
    regions.sort((a, b) => b.count - a.count)
    regionDistribution.value = regions
    
    // Fetch recent resources
    const resourcesResponse = await fetch(`${API_BASE_URL}/resources?limit=5`)
    if (resourcesResponse.ok) {
      const resources = await resourcesResponse.json()
      recentResources.value = resources.map(r => ({
        name: r.Id,
        type: r.Type,
        region: r.Region,
        status: r.Status === 'LIVE' ? 'active' : 'inactive',
        time: formatTime(r.LastModified)
      }))
    }
    
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
    error.value = 'Failed to load dashboard data. Make sure the API server is running on port 3000.'
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return 'unknown'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000) // seconds
  
  if (diff < 60) return `${diff} secs ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

const refreshData = () => {
  fetchDashboardData()
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div>
        <h1 class="dashboard-title">Cloud Resource Dashboard</h1>
        <p class="dashboard-subtitle">Real-time AWS infrastructure monitoring and analysis</p>
      </div>
      <button class="refresh-btn" @click="refreshData" :disabled="loading">
        <svg class="refresh-icon" :class="{ spinning: loading }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ loading ? 'Loading...' : 'Refresh Data' }}
      </button>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-card glass-card">
        <div class="stat-icon" :style="{ background: stat.color, color: 'white' }">{{ stat.icon }}</div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-trend" :class="{ positive: stat.trend.startsWith('+'), negative: stat.trend.startsWith('-') }">
            {{ stat.trend }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Recent Resources -->
      <div class="glass-card recent-resources">
        <h2 class="card-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Recent Resources
        </h2>
        <div class="resource-list">
          <div v-for="resource in recentResources" :key="resource.name" class="resource-item">
            <div class="resource-info">
              <div class="resource-name">{{ resource.name }}</div>
              <div class="resource-meta">
                <span class="resource-type">{{ resource.type }}</span>
                <span class="resource-region">{{ resource.region }}</span>
              </div>
            </div>
            <div class="resource-status">
              <span class="status-badge" :class="resource.status">{{ resource.status }}</span>
              <span class="resource-time">{{ resource.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div class="glass-card alerts">
        <h2 class="card-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Security Alerts
        </h2>
        <div class="alert-list">
          <div v-for="(alert, index) in alerts" :key="index" class="alert-item" :class="alert.severity">
            <div class="alert-indicator"></div>
            <div class="alert-content">
              <div class="alert-message">{{ alert.message }}</div>
              <div class="alert-severity">{{ alert.severity.toUpperCase() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Region Distribution -->
      <div class="glass-card region-distribution">
        <h2 class="card-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Region Distribution
        </h2>
        <div class="region-list">
          <div v-for="region in regionDistribution" :key="region.region" class="region-item">
            <div class="region-header">
              <span class="region-name">{{ region.region }}</span>
              <span class="region-count">{{ region.count }} resources</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: region.percentage + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-btn">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Search Resources
      </button>
      <button class="action-btn">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Generate Report
      </button>
      <button class="action-btn">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Export Data
      </button>
      <button class="action-btn">
        <svg class="action-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 1v6m0 6v6m8.66-15l-3 5.2M6.34 15.8l-3 5.2m15.32 0l-3-5.2M6.34 8.2l-3-5.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Configuration
      </button>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.dashboard-subtitle {
  color: #94a3b8;
  margin: 0.5rem 0 0 0;
  font-size: 1.05rem;
  font-weight: 400;
}

.refresh-btn {
  background: #3b82f6;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.refresh-btn:hover {
  background: #2563eb;
}

.refresh-icon {
  width: 18px;
  height: 18px;
}
.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #ef4444;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.glass-card {
  background: #1a1f2e;
  border: 1px solid #252d3f;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.glass-card:hover {
  border-color: #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
}

.stat-content {
  flex: 1;
}

.stat-label {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.stat-value {
  color: #ffffff;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-trend {
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.stat-trend.positive {
  color: #10b981;
}

.stat-trend.negative {
  color: #ef4444;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card-title {
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 1.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  width: 20px;
  height: 20px;
  color: #3b82f6;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #0f1419;
  border-radius: 8px;
  border: 1px solid #1e2839;
  transition: all 0.2s ease;
}

.resource-item:hover {
  border-color: #2d3748;
  background: #151b2b;
}

.resource-info {
  flex: 1;
}

.resource-name {
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.resource-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.resource-type {
  color: #64748b;
}

.resource-region {
  color: #64748b;
}

.resource-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-badge.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.resource-time {
  color: #64748b;
  font-size: 0.75rem;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.alert-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #0f1419;
  border-radius: 8px;
  border: 1px solid #1e2839;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.alert-item:hover {
  border-color: #2d3748;
  background: #151b2b;
}

.alert-item.critical {
  border-left-color: #ef4444;
}

.alert-item.high {
  border-left-color: #f59e0b;
}

.alert-item.low {
  border-left-color: #10b981;
}

.alert-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-message {
  color: #ffffff;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.alert-severity {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.region-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.region-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.region-name {
  color: #ffffff;
  font-weight: 500;
  font-size: 0.95rem;
}

.region-count {
  color: #64748b;
  font-size: 0.875rem;
}

.progress-bar {
  height: 6px;
  background: #1e2839;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  flex: 1;
  min-width: 200px;
  background: #1a1f2e;
  border: 1px solid #252d3f;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.action-btn:hover {
  background: #252d3f;
  border-color: #3b82f6;
}

.action-icon {
  width: 18px;
  height: 18px;
  color: #3b82f6;
}

@media (max-width: 768px) {
  .dashboard-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}
</style>
