# AWScraper UI

A modern web interface for AWScraper - your cloud resource intelligence platform.

> [!WARNING]
> This was developed using Claude Sonnet 4.5 to accelerate the front-end application. Moving forward, the code will be maintained/improved manually, so please anticipate some changes in the design and structure of the project.

## Features

- **Dark/Light Theme Toggle** - Beautiful glassmorphism design with smooth theme switching
- **Interactive Dashboard** - Real-time statistics and metrics for your AWS resources
- **Resource Inventory** - Searchable, filterable catalog of all your cloud resources
- **Visual Hierarchy** - Interactive D3.js tree visualization of resource relationships
- **Security Alerts** - Real-time monitoring of security issues and configurations
- **Multi-Region Support** - View and manage resources across all AWS regions
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Vue 3** - Progressive JavaScript Framework
- **Vue Router** - Official routing solution
- **D3.js** - Data visualization library
- **Vite** - Next generation frontend tooling
- **Modern CSS** - Glassmorphism, gradients, and animations

## Project Structure

```text
src/
├── assets/          # Global styles and assets
├── components/      # Reusable Vue components
│   └── TreeChart.vue
├── router/          # Vue Router configuration
├── views/           # Page components
│   ├── HomeView.vue      # Dashboard
│   ├── ResourcesView.vue # Resource inventory
│   └── VisualizeView.vue # Tree visualization
├── App.vue          # Root component
└── main.js          # Application entry point
```

## Usage

### Dashboard

The main dashboard provides an overview of your AWS infrastructure with:
- Resource count statistics
- Recent activity feed
- Security alerts
- Region distribution charts

### Resources

Browse and filter your AWS resources with:
- Search functionality
- Type and region filters
- Detailed resource cards
- Export capabilities

### Visualize

Interactive tree visualization showing:

- Hierarchical resource relationships
- Project groupings
- Zoomable and pannable canvas
- Customizable layout options

## Customization

The UI uses CSS variables and can be easily customized. Key colors and styles are defined in the component styles using the glassmorphism design pattern.

## Development

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
