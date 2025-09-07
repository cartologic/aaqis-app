# AAQIS - Africa Air Quality Information System 🌍

A modern, interactive web application for real-time air quality monitoring across African cities, built with **Svelte 5** and **SvelteKit**.

![AAQIS Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Tech-Svelte%205%20%7C%20TypeScript%20%7C%20Tailwind%20CSS-blue)
![Package Manager](https://img.shields.io/badge/Package%20Manager-Bun-orange)

## 🌟 Overview

AAQIS (Africa Air Quality Information System) is a comprehensive platform designed to provide real-time air quality monitoring and analysis for major African cities. The system serves multiple stakeholders including:

- **👥 General Public**: Health advice and daily air quality updates
- **🏢 Government Officials**: Policy-making insights and regulatory data  
- **🔬 Researchers**: Historical trends and data analysis tools
- **📊 Environmental Organizations**: Monitoring and reporting capabilities

## 🎯 Key Features

### 📊 **Real-Time Monitoring**
- Live air quality data from multiple monitoring stations
- AQI (Air Quality Index) calculations for all major pollutants
- Color-coded severity levels following international standards
- Interactive station selection with detailed breakdowns

### 🗺️ **Interactive Mapping**
- **MapLibre GL** powered interactive maps
- Custom station markers with real-time status indicators
- Beautiful popup overlays with comprehensive data
- Smooth pan and zoom functionality with city-specific views

### 📅 **Advanced Data Visualization**
- **ECharts-powered** calendar heatmap (GitHub contribution style)
- Historical trends with daily, weekly, and monthly aggregation
- Time series analysis with Chart.js integration
- Professional legends and tooltips

### 🌍 **Multi-City Coverage**
Currently monitoring air quality in:
- **🇪🇹 Addis Ababa** - Ethiopia's capital and largest city
- **🇺🇬 Kampala** - Uganda's vibrant capital
- **🇰🇪 Nairobi** - Kenya's bustling metropolis  
- **🇷🇼 Kigali** - Rwanda's clean and green capital
- **🇧🇼 Gaborone** - Botswana's administrative center

### 🔬 **Comprehensive Pollutant Monitoring**
- **PM₂.₅** - Fine particulate matter (most health-critical)
- **PM₁₀** - Coarse particulate matter
- **O₃** - Ground-level ozone
- **NO₂** - Nitrogen dioxide
- **SO₂** - Sulfur dioxide  
- **CO** - Carbon monoxide

## 🛠️ Technical Architecture

### **Frontend Stack**
- **⚡ Svelte 5** - Latest reactive framework with runes
- **🏗️ SvelteKit** - Full-stack framework with SSR/SPA capabilities
- **📘 TypeScript** - Type-safe development
- **🎨 Tailwind CSS 4** - Modern utility-first styling
- **📊 ECharts** - Professional data visualization library
- **🗺️ MapLibre GL** - High-performance mapping engine

### **Data Processing**
- **🗂️ Apache Arrow** - Efficient columnar data processing
- **📦 Parquet-WASM** - Client-side parquet file parsing
- **⚡ WebAssembly** - High-performance data operations
- **🕒 Date-fns** - Robust date/time manipulation

### **Development Tools**
- **🚀 Bun** - Fast JavaScript runtime and package manager
- **⚡ Vite** - Lightning-fast build tool
- **🔍 Svelte Check** - TypeScript integration for Svelte
- **📏 ESLint & Prettier** - Code quality and formatting

## 🚀 Quick Start

### Prerequisites
- **Bun** >= 1.0.0 (recommended package manager)
- **Node.js** >= 18.0.0 (fallback)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/cartologic/aaqis-app.git
cd aaqis-app

# Install dependencies using Bun (recommended)
bun install

# Start development server
bun run dev

# Alternative: Using npm/yarn
npm install && npm run dev
```

### Build & Deploy

```bash
# Production build
bun run build

# Preview production build
bun run preview

# Type checking
bun run check

# Continuous type checking
bun run check:watch
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── app.html                 # HTML template
├── app.css                  # Global styles
├── lib/                     # Shared library code
│   ├── components/          # Reusable Svelte components
│   │   ├── AQIGauge.svelte         # Circular AQI indicator
│   │   ├── AirQualityHeatmap.svelte # ECharts calendar heatmap
│   │   ├── FilterBar.svelte        # Advanced filtering controls
│   │   ├── LineChart.svelte        # Time series charts
│   │   ├── MapComponent.svelte     # Interactive map with popups
│   │   └── DataDebugger.svelte     # Development debugging tool
│   ├── dataUtils.ts         # Data processing and aggregation
│   ├── locationService.ts   # Geolocation and station finding
│   ├── messages.ts          # Stakeholder-specific messaging
│   └── types.ts             # TypeScript type definitions
├── routes/                  # SvelteKit file-based routing
│   ├── +layout.svelte       # App-wide layout
│   └── +page.svelte         # Main dashboard page
static/
├── data/                    # Static data files
│   └── *.parquet           # Air quality datasets
└── favicon.png             # App icon
```

## 🎨 Design System

### **Color Palette**
The application uses a carefully curated color system based on international AQI standards:

- **🟢 Good (0-50)**: `#00e400` - Vibrant green indicating healthy air
- **🟡 Moderate (51-100)**: `#ffff00` - Yellow for acceptable conditions  
- **🟠 Unhealthy for Sensitive (101-150)**: `#ff7e00` - Orange warning
- **🔴 Unhealthy (151-200)**: `#ff0000` - Red alert level
- **🟣 Very Unhealthy (201-300)**: `#8f3f97` - Purple danger zone
- **⚫ Hazardous (300+)**: `#7e0023` - Maroon critical level

### **Typography**
- **Primary Font**: Ubuntu (Google Fonts)
- **UI Font Stack**: Inter, SF Pro, system fonts
- **Monospace**: SF Mono, Consolas, Monaco

## 🌍 Data Sources & Processing

### **Data Pipeline**
1. **📥 Data Ingestion**: Parquet files containing historical and real-time measurements
2. **🔄 Processing**: Apache Arrow for efficient columnar operations
3. **📊 Aggregation**: Daily, weekly, monthly summaries with statistical analysis
4. **🎯 Filtering**: Station-specific, city-wide, and temporal filtering
5. **📡 Real-time Updates**: Simulated live data feed for demonstration

### **Data Quality**
- Comprehensive data validation and error handling
- Missing data interpolation and flagging
- Quality assurance metrics and reporting
- Temporal consistency checks

## 🎯 Stakeholder Features

### **👥 Public Interface**
- Simple, intuitive AQI readings with health advice
- Location-based recommendations
- Easy-to-understand visual indicators
- Mobile-responsive design

### **🏢 Government Dashboard**
- Policy-relevant data aggregations
- Regulatory compliance monitoring  
- Trend analysis for decision-making
- Export capabilities for reporting

### **🔬 Research Tools**
- Historical data access and analysis
- Statistical trend identification
- Data export in multiple formats
- API access for programmatic use

## 🔧 Configuration & Customization

### **Environment Variables**
```bash
# Development
VITE_API_BASE_URL=https://api.aaqis.org
VITE_MAP_STYLE=your-mapbox-style-url

# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id
```

### **Customizing Cities**
Update `src/lib/types.ts` to add new cities:

```typescript
export const CITY_INFO: Record<string, CityInfo> = {
  your_city: {
    name: 'your_city',
    displayName: 'Your City',
    country: 'your_country',
    emoji: '🏙️',
    center: [longitude, latitude],
    zoom: 11,
    stations: []
  }
}
```

## 🚀 Deployment Options

### **Static Deployment**
```bash
bun run build
# Deploy the `build/` directory to any static host
```

### **SvelteKit Adapters**
- **Vercel**: `@sveltejs/adapter-vercel`
- **Netlify**: `@sveltejs/adapter-netlify`  
- **Cloudflare**: `@sveltejs/adapter-cloudflare`
- **Node.js**: `@sveltejs/adapter-node`

## 🔍 Performance Optimizations

- **⚡ Code Splitting**: Automatic route-based code splitting
- **🗜️ Asset Optimization**: Vite's built-in minification and tree-shaking
- **📊 Lazy Loading**: Charts and maps load on demand
- **💾 Efficient Data Structures**: Columnar data processing with Apache Arrow
- **🎯 Smart Caching**: Browser and CDN caching strategies

## 🧪 Testing & Quality Assurance

```bash
# Type checking
bun run check

# Linting (when configured)
bun run lint

# Testing (when configured)  
bun run test
```

## 🤝 Contributing

We welcome contributions to improve AAQIS! Please see our contributing guidelines:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin feature/amazing-feature`)
5. **🔄 Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use Svelte 5 runes for reactivity
- Maintain consistent code formatting
- Add proper documentation for new features
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **🌍 Environmental Data Providers** for crucial air quality measurements
- **🏛️ African Governments** for supporting environmental monitoring
- **👨‍💻 Open Source Community** for the amazing tools and libraries
- **🎨 Design Inspiration** from modern environmental dashboards

## 📞 Contact & Support

- **🌐 Website**: [https://aaqis.org](https://aaqis.org)
- **📧 Email**: support@cartologic.com
- **🐛 Issues**: [GitHub Issues](https://github.com/cartologic/aaqis-app/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/cartologic/aaqis-app/discussions)

---

**🌍 Built with ❤️ for a cleaner, healthier Africa**

*Empowering communities with actionable air quality information*