<script setup>
import TreeChart from '../components/TreeChart.vue'
</script>

<template>
  <div class="visualize-view">
    <div class="view-header">
      <h1 class="view-title">Resource Visualization</h1>
      <p class="view-subtitle">Interactive hierarchical view of your cloud infrastructure</p>
    </div>

    <!-- Controls Bar -->
    <div class="controls-bar glass-card">
      <div class="control-group">
        <label class="control-label">Layout</label>
        <select class="control-select">
          <option>Hierarchical</option>
          <option>Radial</option>
          <option>Force-Directed</option>
        </select>
      </div>
      <div class="control-group">
        <label class="control-label">Depth</label>
        <input type="range" min="1" max="5" value="5" class="control-slider" />
      </div>
      <button class="control-btn">
        <svg class="control-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Reset View
      </button>
      <button class="control-btn">
        <svg class="control-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Export PNG
      </button>
    </div>

    <!-- Main Layout: Graph + Sidebar -->
    <div class="main-layout">
      <!-- Graph Container -->
      <div class="graph-container glass-card">
        <TreeChart />
      </div>

      <!-- Sidebar -->
      <div class="sidebar">
        <!-- Legend Panel -->
        <div class="legend-panel glass-card">
          <h3 class="panel-title">Legend</h3>
          <div class="legend-items">
            <div class="legend-item">
              <span class="legend-color" style="background: #10b981;"></span>
              <span class="legend-label">Projects</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #3b82f6;"></span>
              <span class="legend-label">Lambda Functions</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #f59e0b;"></span>
              <span class="legend-label">Data Services</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #8b5cf6;"></span>
              <span class="legend-label">Storage</span>
            </div>
          </div>
        </div>

        <!-- Stats Panel -->
        <div class="stats-panel glass-card">
          <h3 class="panel-title">Visualization Stats</h3>
          <div class="stats-list">
            <div class="stat-item">
              <span class="stat-label">Total Nodes</span>
              <span class="stat-value">28</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Max Depth</span>
              <span class="stat-value">4</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Projects</span>
              <span class="stat-value">5</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Resources</span>
              <span class="stat-value">23</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visualize-view {
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

.view-header {
  margin-bottom: 2rem;
}

.view-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.view-subtitle {
  color: #94a3b8;
  margin: 0.5rem 0 0 0;
  font-size: 1.05rem;
}

.glass-card {
  background: #1a1f2e;
  border: 1px solid #252d3f;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.controls-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #1a1f2e;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
}

.control-select {
  background: #0f1419;
  border: 1px solid #252d3f;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #ffffff;
  cursor: pointer;
  outline: none;
}

.control-select option {
  background: #1a1f2e;
  color: #ffffff;
}

.control-slider {
  width: 150px;
  cursor: pointer;
}

.control-btn {
  background: #0f1419;
  border: 1px solid #252d3f;
  padding: 0.65rem 1.25rem;
  border-radius: 8px;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.control-btn:hover {
  background: #252d3f;
  border-color: #3b82f6;
}

.control-icon {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
  align-items: start;
}

.graph-container {
  min-height: 600px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
}

.legend-panel,
.stats-panel {
  padding: 1.5rem;
}

.panel-title {
  color: #ffffff;
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 1.25rem 0;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-label {
  color: #94a3b8;
  font-size: 0.875rem;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem;
  background: #0f1419;
  border: 1px solid #1e2839;
  border-radius: 8px;
}

.stat-label {
  color: #64748b;
  font-size: 0.85rem;
}

.stat-value {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    grid-template-columns: 1fr 1fr;
    display: grid;
  }
}

@media (max-width: 768px) {
  .view-title {
    font-size: 2rem;
  }
  
  .sidebar {
    grid-template-columns: 1fr;
  }
  
  .controls-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-slider {
    width: 100%;
  }
}
</style>
