<script>
import * as d3 from 'd3'
export default {
  data() {
    return {
      myData: {
        Id: 0,
        Identifier: 'ROOT',
        children: [
          {
            Id: 1,
            ParentId: null,
            TypeId: 1,
            Identifier: 'xyz-project-one',
            Removed: 'false',
            LastFetchTime: '2024-01-12 23:17:59',
            children: [
              {
                Id: 2,
                ParentId: 1,
                TypeId: 2,
                Identifier: 'lambda1',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 3,
                ParentId: 1,
                TypeId: 2,
                Identifier: 'lambda2',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 4,
                ParentId: 1,
                TypeId: 2,
                Identifier: 'lambda3',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 5,
                ParentId: 1,
                TypeId: 2,
                Identifier: 'lambda4',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 6,
                ParentId: 1,
                TypeId: 2,
                Identifier: 'lambda5',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              }
            ]
          },
          {
            Id: 7,
            ParentId: null,
            TypeId: 1,
            Identifier: 'xyz-project-two',
            Removed: 'false',
            LastFetchTime: '2024-01-12 23:17:59',
            children: [
              {
                Id: 8,
                ParentId: 7,
                TypeId: 1,
                Identifier: 'lambdaA',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 9,
                ParentId: 7,
                TypeId: 1,
                Identifier: 'lambdaB',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 10,
                ParentId: 7,
                TypeId: 1,
                Identifier: 'lambdaX',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 11,
                ParentId: 7,
                TypeId: 1,
                Identifier: 'lambdaY',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59',
                children: [
                  {
                    Id: 23,
                    ParentId: 11,
                    TypeId: 1,
                    Identifier: 'lambdaY1',
                    Removed: 'false',
                    LastFetchTime: '2024-01-13 11:41:38',
                    children: [
                      {
                        Id: 24,
                        ParentId: 23,
                        TypeId: 1,
                        Identifier: 'athena',
                        Removed: 'false',
                        LastFetchTime: '2024-01-13 11:44:39'
                      },
                      {
                        Id: 25,
                        ParentId: 23,
                        TypeId: 1,
                        Identifier: 'rds',
                        Removed: 'false',
                        LastFetchTime: '2024-01-13 11:44:39'
                      },
                      {
                        Id: 26,
                        ParentId: 23,
                        TypeId: 1,
                        Identifier: 'sqs',
                        Removed: 'false',
                        LastFetchTime: '2024-01-13 11:44:39'
                      },
                      {
                        Id: 27,
                        ParentId: 23,
                        TypeId: 1,
                        Identifier: 'sns',
                        Removed: 'false',
                        LastFetchTime: '2024-01-13 11:44:39'
                      },
                      {
                        Id: 28,
                        ParentId: 23,
                        TypeId: 1,
                        Identifier: 's3',
                        Removed: 'false',
                        LastFetchTime: '2024-01-13 11:44:39'
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            Id: 12,
            ParentId: null,
            TypeId: 1,
            Identifier: 'xyz-project-three',
            Removed: 'false',
            LastFetchTime: '2024-01-12 23:17:59',
            children: [
              {
                Id: 13,
                ParentId: 12,
                TypeId: 1,
                Identifier: 'lambda01',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 14,
                ParentId: 12,
                TypeId: 1,
                Identifier: 'lambda02',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              }
            ]
          },
          {
            Id: 15,
            ParentId: null,
            TypeId: 1,
            Identifier: 'xyz-project-four',
            Removed: 'false',
            LastFetchTime: '2024-01-12 23:17:59',
            children: [
              {
                Id: 16,
                ParentId: 15,
                TypeId: 1,
                Identifier: 'lambda00001',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 17,
                ParentId: 15,
                TypeId: 1,
                Identifier: 'lambda00002',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              },
              {
                Id: 18,
                ParentId: 15,
                TypeId: 1,
                Identifier: 'lambda00003',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59'
              }
            ]
          },
          {
            Id: 19,
            ParentId: null,
            TypeId: 1,
            Identifier: 'xyz-project-five',
            Removed: 'false',
            LastFetchTime: '2024-01-12 23:17:59',
            children: [
              {
                Id: 20,
                ParentId: 19,
                TypeId: 1,
                Identifier: 'lambda0',
                Removed: 'false',
                LastFetchTime: '2024-01-12 23:17:59',
                children: [
                  {
                    Id: 21,
                    ParentId: 20,
                    TypeId: 1,
                    Identifier: 'athena',
                    Removed: 'false',
                    LastFetchTime: '2024-01-13 01:10:17',
                    children: [
                      {
                        Id: 22,
                        ParentId: 21,
                        TypeId: 1,
                        Identifier: 'glue',
                        Removed: 'false',
                        LastFetchTime: '2024-01-13 01:50:26'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    drawChart() {
      // Get container dimensions
      const container = this.$el
      const width = container.clientWidth || 800
      const height = 600
      const margin = { top: 40, right: 120, bottom: 40, left: 120 }
      
      const treeLayout = d3.tree().size([height - margin.top - margin.bottom, width - margin.left - margin.right])
      const root = d3.hierarchy(this.myData)
      treeLayout(root)

      const svg = d3
        .select(this.$el.querySelector('svg'))
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      // Clear any existing content
      svg.selectAll('*').remove()
      
      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      g
        .selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr(
          'd',
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        )

      const nodes = g
        .selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d) => `translate(${d.y},${d.x})`)

      nodes
        .append('circle')
        .attr('r', 5)
        .on('mouseover', function () {
          d3.select(this).transition().duration('50').attr('opacity', '.50')
        })
        .on('mouseout', function () {
          d3.select(this).transition().duration('50').attr('opacity', '1')
        })

      nodes
        .append('text')
        .attr('dy', 3)
        .attr('x', (d) => (d.children ? -8 : 8))
        .style('text-anchor', (d) => (d.children ? 'end' : 'start'))
        .text((d) => d.data.Identifier)
    }
  },
  mounted() {
    this.drawChart()
  }
}
</script>

<template>
  <div class="tree-chart-wrapper">
    <svg></svg>
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
  transition: all 0.3s ease;
  cursor: pointer;
  filter: drop-shadow(0 0 8px rgba(78, 205, 196, 0.6));
}

.node:hover circle {
  fill: #4ecdc4;
  stroke: #fff;
  stroke-width: 4px;
  r: 8;
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
