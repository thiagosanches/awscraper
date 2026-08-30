<script>
import * as d3 from 'd3'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default {
  props: {
    layout: { type: String, default: 'Hierarchical' },
    maxDepth: { type: Number, default: 5 },
  },
  emits: ['stats'],
  data() {
    return {
      treeData: null,
      loading: false,
      error: null,
    }
  },
  watch: {
    layout() { this.drawChart() },
    maxDepth() { this.drawChart() },
  },
  methods: {
    async fetchData() {
      this.loading = true
      this.error = null
      try {
        const res = await fetch(`${API_BASE_URL}/tree`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        this.treeData = await res.json()
        this.$nextTick(() => this.drawChart())
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },

    pruneDepth(node, current, max) {
      if (current >= max || !node.children) return { ...node, children: undefined }
      return { ...node, children: node.children.map((c) => this.pruneDepth(c, current + 1, max)) }
    },

    resetView() {
      this.drawChart()
    },

    exportPNG() {
      const svgEl = this.$el.querySelector('svg')
      if (!svgEl) return
      const svgStr = new XMLSerializer().serializeToString(svgEl)
      const canvas = document.createElement('canvas')
      canvas.width = svgEl.clientWidth || 1200
      canvas.height = svgEl.clientHeight || 600
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#0a0e1a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        const a = document.createElement('a')
        a.download = 'aws-tree.png'
        a.href = canvas.toDataURL('image/png')
        a.click()
      }
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`
    },

    drawChart() {
      if (!this.treeData) return
      const container = this.$el
      const svgEl = container.querySelector('svg')
      if (!svgEl) return

      const data = this.pruneDepth(this.treeData, 0, this.maxDepth)
      const root = d3.hierarchy(data)

      this.$emit('stats', {
        nodes: root.descendants().length,
        maxDepth: root.height,
        accounts: root.children ? root.children.length : 0,
        types: root.descendants().filter((d) => !d.children).length,
      })

      const width = container.clientWidth || 1200
      const height = 600
      const svg = d3.select(svgEl)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      svg.selectAll('*').remove()

      if (this.layout === 'Radial') {
        this.drawRadial(svg, root, width, height)
      } else {
        this.drawHorizontal(svg, root, width, height)
      }
    },

    drawHorizontal(svg, root, width, height) {
      const margin = { top: 20, right: 220, bottom: 20, left: 100 }
      const treeLayout = d3.tree().size([
        height - margin.top - margin.bottom,
        width - margin.left - margin.right,
      ])
      treeLayout(root)

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal().x((d) => d.y).y((d) => d.x))

      const nodes = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', (d) => `node depth-${d.depth}`)
        .attr('transform', (d) => `translate(${d.y},${d.x})`)

      nodes.append('circle').attr('r', 5)
        .on('mouseover', function () { d3.select(this).transition().duration(150).attr('r', 8) })
        .on('mouseout', function () { d3.select(this).transition().duration(150).attr('r', 5) })

      nodes.append('text')
        .attr('dy', 3)
        .attr('x', (d) => (d.children ? -8 : 8))
        .style('text-anchor', (d) => (d.children ? 'end' : 'start'))
        .text((d) => d.data.Identifier)
    },

    drawRadial(svg, root, width, height) {
      const radius = Math.min(width, height) / 2 - 80

      const treeLayout = d3.tree()
        .size([2 * Math.PI, radius])
        .separation((a, b) => (a.parent === b.parent ? 1 : 2) / a.depth)

      treeLayout(root)

      const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`)

      g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkRadial().angle((d) => d.x).radius((d) => d.y))

      const nodes = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', (d) => `node depth-${d.depth}`)
        .attr('transform', (d) => `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`)

      nodes.append('circle').attr('r', 5)
        .on('mouseover', function () { d3.select(this).transition().duration(150).attr('r', 8) })
        .on('mouseout', function () { d3.select(this).transition().duration(150).attr('r', 5) })

      nodes.append('text')
        .attr('dy', '0.31em')
        .attr('x', (d) => (d.x < Math.PI === !d.children ? 6 : -6))
        .attr('text-anchor', (d) => (d.x < Math.PI === !d.children ? 'start' : 'end'))
        .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
        .text((d) => d.data.Identifier)
    },
  },
  mounted() {
    this.fetchData()
  },
}
</script>

<template>
  <div class="tree-chart-wrapper">
    <div v-if="loading" class="chart-overlay">Loading tree data...</div>
    <div v-else-if="error" class="chart-overlay chart-error">{{ error }}</div>
    <svg v-show="!loading && !error"></svg>
  </div>
</template>

<style>
.tree-chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.chart-overlay {
  color: #94a3b8;
  font-size: 1rem;
}

.chart-error {
  color: #ef4444;
}

svg {
  display: block;
  fill: transparent;
  stroke: none;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 600px;
}

.link {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 2px;
  transition: all 0.3s ease;
}

.link:hover {
  stroke: #4ecdc4;
  stroke-width: 3px;
}

.node circle {
  fill: rgba(255, 255, 255, 0.9);
  stroke: #4ecdc4;
  stroke-width: 3px;
  cursor: pointer;
  filter: drop-shadow(0 0 8px rgba(78, 205, 196, 0.6));
}

.node.depth-0 circle { fill: #ffffff; stroke: #ffffff; }
.node.depth-1 circle { fill: #10b981; stroke: #10b981; }
.node.depth-2 circle { fill: #4ecdc4; stroke: #4ecdc4; }

.node:hover circle {
  filter: drop-shadow(0 0 15px rgba(78, 205, 196, 1));
}

.node text {
  font: 13px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  fill: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  font-weight: 600;
  transition: all 0.3s ease;
}

.node:hover text {
  fill: #4ecdc4;
  font-size: 14px;
  font-weight: 700;
}
</style>
