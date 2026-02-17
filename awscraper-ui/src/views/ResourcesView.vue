<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const searchQuery = ref('')
const selectedType = ref('all')
const selectedRegion = ref('all')
const selectedStatus = ref('all')
const editingResource = ref(null)
const showEditModal = ref(false)
const detailedResource = ref(null)
const showDetailsModal = ref(false)
const loading = ref(false)
const error = ref(null)

const resourceTypes = ref(['all'])
const regions = ref(['all'])
const statusOptions = ['all', 'LIVE', 'DELETED']
const teams = ref(['Platform', 'Backend', 'Frontend', 'Data', 'DevOps', 'Security', 'Infrastructure', 'QA'])

const allResources = ref([])

// Fetch resources from API
const fetchResources = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params = new URLSearchParams()
    if (selectedType.value !== 'all') params.append('type', selectedType.value)
    if (selectedRegion.value !== 'all') params.append('region', selectedRegion.value)
    if (selectedStatus.value !== 'all') params.append('status', selectedStatus.value)
    if (searchQuery.value) params.append('search', searchQuery.value)

    const response = await fetch(`${API_BASE_URL}/resources?${params}`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json()
    allResources.value = data
  } catch (err) {
    console.error('Failed to fetch resources:', err)
    error.value = 'Failed to load resources. Make sure the API server is running on port 3000.'
  } finally {
    loading.value = false
  }
}

// Fetch filter options from API
const fetchFilters = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/filters`)
    if (!response.ok) return
    
    const data = await response.json()
    resourceTypes.value = ['all', ...data.types]
    regions.value = ['all', ...data.regions]
    if (data.teams.length > 0) {
      teams.value = data.teams
    }
  } catch (err) {
    console.error('Failed to fetch filters:', err)
  }
}

// Load data on mount
onMounted(async () => {
  await fetchFilters()
  await fetchResources()
})

// Watch for filter changes
watch([selectedType, selectedRegion, selectedStatus, searchQuery], () => {
  fetchResources()
}, { debounce: 300 })

const getResourceIcon = (type) => {
  const icons = {
    'Lambda': 'λ',
    'EC2': 'EC2',
    'S3': 'S3',
    'RDS': 'RDS',
    'DynamoDB': 'DDB',
    'API-Gateway': 'API',
    'SecurityGroup': 'SG',
    'CloudFront': 'CF',
    'SNS': 'SNS',
    'SQS': 'SQS',
    'EBS': 'EBS',
    'NAT': 'NAT',
    'SSM': 'SSM',
    'AutoScalingGroups': 'ASG',
    'DMS': 'DMS',
    'Glue': 'GLU',
    'Kinesis': 'KIN',
    'ElasticBeanstalk': 'EBS',
    'Route53': 'R53',
    'IAMUsers': 'IAM'
  }
  return icons[type] || 'RES'
}

const openEditModal = (resource) => {
  editingResource.value = { ...resource }
  showEditModal.value = true
}

const closeEditModal = () => {
  editingResource.value = null
  showEditModal.value = false
}

const saveResource = async () => {
  if (!editingResource.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`${API_BASE_URL}/resources/${encodeURIComponent(editingResource.value.Id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Team: editingResource.value.Team,
        Comments: editingResource.value.Comments
      })
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const updated = await response.json()
    
    // Update the resource in the local array
    const index = allResources.value.findIndex(r => r.Id === updated.Id)
    if (index !== -1) {
      allResources.value[index] = updated
    }
    
    closeEditModal()
  } catch (err) {
    console.error('Failed to save resource:', err)
    error.value = 'Failed to save changes. Please try again.'
  } finally {
    loading.value = false
  }
}

const openDetailsModal = (resource) => {
  detailedResource.value = resource
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  detailedResource.value = null
  showDetailsModal.value = false
}

const formatRawObj = (rawObj) => {
  if (!rawObj) return 'No additional metadata available'
  
  try {
    const parsed = typeof rawObj === 'string' ? JSON.parse(rawObj) : rawObj
    return JSON.stringify(parsed, null, 2)
  } catch (err) {
    return rawObj
  }
}
</script>

<template>
  <div class="resources-view">
    <div class="view-header">
      <h1 class="view-title">Resource Inventory</h1>
      <p class="view-subtitle">Browse and manage your AWS resources</p>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="error-banner">
      {{ error }}
    </div>

    <!-- Filters -->
    <div class="filters glass-card">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search resources by name or tags..."
          class="search-input"
        />
      </div>
      <div class="filter-group">
        <label class="filter-label">Type</label>
        <select v-model="selectedType" class="filter-select">
          <option v-for="type in resourceTypes" :key="type" :value="type">
            {{ type === 'all' ? 'All Types' : type }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Region</label>
        <select v-model="selectedRegion" class="filter-select">
          <option v-for="region in regions" :key="region" :value="region">
            {{ region === 'all' ? 'All Regions' : region }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="selectedStatus" class="filter-select">
          <option v-for="status in statusOptions" :key="status" :value="status">
            {{ status === 'all' ? 'All Statuses' : status }}
          </option>
        </select>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info">
      <span class="results-count">{{ allResources.length }} resources found</span>
      <button class="export-btn">
        <svg class="export-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Export
      </button>
    </div>

    <!-- Resources Grid -->
    <div class="resources-grid">
      <div v-for="resource in allResources" :key="resource.Id" class="resource-card glass-card">
        <div class="resource-header">
          <div class="resource-icon">{{ getResourceIcon(resource.Type) }}</div>
          <div class="resource-main">
            <h3 class="resource-name">{{ resource.Id }}</h3>
            <div class="resource-type">{{ resource.Type }}</div>
          </div>
          <span class="status-badge" :class="resource.Status.toLowerCase()">{{ resource.Status }}</span>
        </div>
        
        <div class="resource-info">
          <span class="info-item">{{ resource.AccountName }}</span>
          <span class="info-separator">•</span>
          <span class="info-item">{{ resource.Region }}</span>
          <span v-if="resource.Team" class="info-separator">•</span>
          <span v-if="resource.Team" class="info-item team">{{ resource.Team }}</span>
        </div>

        <div class="resource-actions">
          <button class="action-btn-small" @click="openDetailsModal(resource)">View Details</button>
          <button class="action-btn-small" @click="openEditModal(resource)">Edit</button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Edit Resource Metadata</h2>
          <button class="modal-close" @click="closeEditModal">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div v-if="editingResource" class="modal-body">
          <div class="form-section">
            <h3 class="section-title">Resource Information</h3>
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Resource ID</label>
                <input type="text" v-model="editingResource.Id" class="form-input" disabled />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type</label>
                <input type="text" v-model="editingResource.Type" class="form-input" disabled />
              </div>
              <div class="form-group">
                <label class="form-label">Region</label>
                <input type="text" v-model="editingResource.Region" class="form-input" disabled />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Account ID</label>
                <input type="text" v-model="editingResource.AccountId" class="form-input" disabled />
              </div>
              <div class="form-group">
                <label class="form-label">Account Name</label>
                <input type="text" v-model="editingResource.AccountName" class="form-input" disabled />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Status</label>
                <input type="text" v-model="editingResource.Status" class="form-input" disabled />
              </div>
              <div class="form-group">
                <label class="form-label">Last Modified</label>
                <input type="text" v-model="editingResource.LastModified" class="form-input" disabled />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Team Assignment</h3>
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Team</label>
                <select v-model="editingResource.Team" class="form-select">
                  <option :value="null">Not Assigned</option>
                  <option v-for="team in teams" :key="team" :value="team">{{ team }}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Comments & Notes</h3>
            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Comments</label>
                <textarea v-model="editingResource.Comments" class="form-textarea" rows="5" placeholder="Add notes, documentation links, dependencies, or any relevant information about this resource..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeEditModal">Cancel</button>
          <button class="btn-primary" @click="saveResource">Save Changes</button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
      <div class="modal-content modal-wide">
        <div class="modal-header">
          <h2 class="modal-title">Resource Details</h2>
          <button class="modal-close" @click="closeDetailsModal">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div v-if="detailedResource" class="modal-body">
          <!-- Basic Information -->
          <div class="details-section">
            <h3 class="details-section-title">Basic Information</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Resource ID:</span>
                <span class="detail-value">{{ detailedResource.Id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Type:</span>
                <span class="detail-value">
                  <span class="resource-type-badge" :data-type="detailedResource.Type">
                    {{ getResourceIcon(detailedResource.Type) }}
                  </span>
                  {{ detailedResource.Type }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status-badge" :class="detailedResource.Status?.toLowerCase()">
                    {{ detailedResource.Status }}
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Region:</span>
                <span class="detail-value">{{ detailedResource.Region }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Account ID:</span>
                <span class="detail-value">{{ detailedResource.AccountId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Account Name:</span>
                <span class="detail-value">{{ detailedResource.AccountName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Modified:</span>
                <span class="detail-value">{{ detailedResource.LastModified || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="details-section">
            <h3 class="details-section-title">Managed Metadata</h3>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Team:</span>
                <span class="detail-value">{{ detailedResource.Team || 'Not Assigned' }}</span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Comments:</span>
                <span class="detail-value">{{ detailedResource.Comments || 'No comments' }}</span>
              </div>
            </div>
          </div>

          <!-- AWS Metadata (RawObj) -->
          <div class="details-section">
            <h3 class="details-section-title">AWS Resource Metadata</h3>
            <div class="detail-description">
              Additional metadata collected from AWS, including tags, creation date, and resource-specific configuration.
            </div>
            <pre class="raw-obj-display"><code>{{ formatRawObj(detailedResource.RawObj) }}</code></pre>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-primary" @click="closeDetailsModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resources-view {
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

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: #ef4444;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.glass-card {
  background: #1a1f2e;
  border: 1px solid #252d3f;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.search-box {
  flex: 1;
  min-width: 300px;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #0f1419;
  border: 1px solid #1e2839;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.search-icon {
  width: 18px;
  height: 18px;
  color: #64748b;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
}

.search-input::placeholder {
  color: #64748b;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
}

.filter-select {
  background: #0f1419;
  border: 1px solid #1e2839;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  min-width: 150px;
}

.filter-select option {
  background: #1a1f2e;
  color: #ffffff;
}

.results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.results-count {
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.95rem;
}

.export-btn {
  background: #1a1f2e;
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

.export-btn:hover {
  background: #252d3f;
  border-color: #3b82f6;
}

.export-icon {
  width: 16px;
  height: 16px;
  color: #3b82f6;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.resource-card {
  transition: all 0.2s ease;
  padding: 1rem;
}

.resource-card:hover {
  border-color: #2d3748;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.resource-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.resource-icon {
  font-size: 1rem;
  font-weight: 700;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  flex-shrink: 0;
}

.resource-main {
  flex: 1;
  min-width: 0;
}

.resource-name {
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resource-type {
  color: #64748b;
  font-size: 0.8rem;
}

.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.status-badge.live {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-badge.deleted {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.resource-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: #94a3b8;
  font-size: 0.85rem;
  flex-wrap: wrap;
}

.info-item {
  color: #94a3b8;
}

.info-item.team {
  color: #3b82f6;
  font-weight: 500;
}

.info-separator {
  color: #475569;
  font-weight: 700;
}

.resource-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn-small {
  flex: 1;
  background: #0f1419;
  border: 1px solid #1e2839;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn-small:hover {
  background: #1e2839;
  border-color: #3b82f6;
  color: #ffffff;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: #1a1f2e;
  border: 1px solid #252d3f;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #252d3f;
}

.modal-title {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #94a3b8;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
}

.modal-close svg {
  width: 100%;
  height: 100%;
}

.modal-close:hover {
  color: #ffffff;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #252d3f;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-input,
.form-select,
.form-textarea {
  background: #0f1419;
  border: 1px solid #1e2839;
  border-radius: 6px;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #3b82f6;
  background: #151b2b;
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.form-select {
  cursor: pointer;
}

.form-select option {
  background: #1a1f2e;
  color: #ffffff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #252d3f;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #1e2839;
  color: #94a3b8;
  border: 1px solid #252d3f;
}

.btn-secondary:hover {
  background: #252d3f;
  color: #ffffff;
}

@media (max-width: 768px) {
  .view-title {
    font-size: 2rem;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    width: 100%;
    min-width: unset;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 1rem;
  }

  .modal-content {
    max-height: 95vh;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item.full-width {
    grid-column: 1;
  }
}

/* Details Modal Specific Styles */
.modal-wide {
  max-width: 900px;
}

.details-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #1e2839;
}

.details-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.details-section-title {
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-description {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #e2e8f0;
  font-size: 0.95rem;
  line-height: 1.5;
  word-break: break-word;
}

.raw-obj-display {
  background: #0a0e1a;
  border: 1px solid #1e2839;
  border-radius: 6px;
  padding: 1rem;
  margin: 0;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.raw-obj-display code {
  color: #94a3b8;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre;
}

.resource-type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 0.5rem;
}
</style>
