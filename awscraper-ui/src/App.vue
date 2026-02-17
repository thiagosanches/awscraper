<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'

const isDark = ref(true)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', 'dark')
})
</script>

<template>
  <div class="app-container" :class="{ dark: isDark }">
    <header class="glass-header">
      <div class="header-content">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h1 class="logo-text">AWScraper</h1>
          <span class="beta-tag">BETA</span>
        </div>
        <nav class="nav-links">
          <RouterLink to="/" class="nav-link">
            Dashboard
          </RouterLink>
          <RouterLink to="/resources" class="nav-link">
            Resources
          </RouterLink>
          <RouterLink to="/visualize" class="nav-link">
            Visualize
          </RouterLink>
        </nav>
        <button @click="toggleTheme" class="theme-toggle" title="Toggle theme">
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
    <main class="main-content">
      <RouterView />
    </main>
    <footer class="glass-footer">
      <p>© 2026 AWScraper • Cloud Resource Intelligence Platform</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
  transition: all 0.3s ease;
}

.app-container.dark {
  background: #0a0e1a;
}

.glass-header {
  background: #151b2b;
  border-bottom: 1px solid #1e2839;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.5px;
}

.beta-tag {
  background: #1e40af;
  color: #93c5fd;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.65rem 1.25rem;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: #ffffff;
  background: #1e2839;
}

.nav-link.router-link-active {
  color: #3b82f6;
  background: #1e2839;
  border: 1px solid #1e3a5f;
}

.theme-toggle {
  background: #1e2839;
  border: 1px solid #2d3748;
  border-radius: 6px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #94a3b8;
}

.theme-toggle svg {
  width: 20px;
  height: 20px;
}

.theme-toggle:hover {
  background: #2d3748;
  color: #ffffff;
  border-color: #3b82f6;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 200px);
}

.glass-footer {
  background: #151b2b;
  border-top: 1px solid #1e2839;
  padding: 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.875rem;
}

.glass-footer p {
  margin: 0;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-direction: column;
    width: 100%;
  }
  
  .nav-link {
    width: 100%;
    justify-content: center;
  }
}
</style>
