# Monster Tamer - Complete TypeScript Port

A fully-featured Monster Tamer RPG game built with Phaser 3, Next.js 15, and TypeScript. This is a complete port from the original JavaScript implementation, featuring creature collection, turn-based battles, and offline gameplay.

## 🎮 Game Features

- **Creature Collection**: Catch, train, and battle 20+ unique creatures
- **Turn-Based Combat**: Strategic battle system with type advantages
- **Open World Exploration**: Grid-based overworld with multiple areas
- **Save/Load System**: Local storage for persistent game progress
- **Mobile Support**: Touch controls and responsive design
- **Offline Play**: 100% offline - no servers required
- **PWA Ready**: Install as a native app on supported devices

## 🛠️ Technology Stack

- **Phaser 3.90.0** - Game engine and rendering
- **Next.js 15.3.1** - React framework and build system  
- **TypeScript 5** - Type-safe development
- **React 19** - UI components and state management

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd monster-tamer

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:8080`

### Build for Production
```bash
# Create optimized production build
npm run build-nolog

# Output will be in the /dist folder
```

## 📱 Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch development server with analytics |
| `npm run dev-nolog` | Launch development server without analytics |
| `npm run build` | Create production build with analytics |
| `npm run build-nolog` | Create production build without analytics |

## 🎯 Game Controls

### Desktop
- **Arrow Keys/WASD**: Move character
- **Z/Space**: Interact/Confirm
- **X/Escape**: Cancel/Menu
- **Enter**: Open pause menu
- **M**: Open menu (legacy)
- **F**: Toggle fullscreen

### Mobile
- **On-screen D-Pad**: Movement
- **Action Button**: Interact/Confirm
- **Menu Button**: Open pause menu

## 🏗️ Project Structure

```
├── src/
│   ├── game/                 # Game source code
│   │   ├── scenes/         # Game scenes (18 total)
│   │   ├── battle/         # Battle system modules
│   │   ├── world/          # Overworld system modules
│   │   ├── managers/       # Game managers (Audio, Performance, etc.)
│   │   ├── services/       # Data services (Save, Legacy Data)
│   │   ├── models/         # Data models and types
│   │   ├── assets/        # Asset key definitions
│   │   └── common/        # Shared utilities
│   ├── components/         # React components
│   ├── pages/             # Next.js pages
│   └── styles/           # CSS styles
├── public/
│   └── assets/           # Game assets (images, audio, data)
├── archive/             # Original JavaScript code (reference)
└── docs/               # Technical documentation
```

## 🎮 Game Systems

### Core Systems
- **Overworld Engine**: Grid-based movement, NPCs, encounters
- **Battle System**: Turn-based combat with capture mechanics
- **Save System**: Local storage with multiple save slots
- **Input System**: Unified keyboard and touch controls
- **Audio System**: Background music and sound effects

### Scene Architecture
1. **Boot** → System initialization
2. **Preloader** → Asset loading
3. **Title** → Main menu
4. **Overworld** → Main game world
5. **Battle** → Combat encounters
6. **Menu System** → Party, Inventory, Shop

### Data Management
- **Legacy Data Migration**: Seamless import from original saves
- **Type Safety**: Full TypeScript coverage
- **Validation**: Comprehensive data validation
- **Error Handling**: Robust error recovery

## 📊 Performance

### Optimizations
- **60 FPS** desktop performance
- **50+ FPS** mobile performance
- **< 150 MB** memory usage
- **< 3 seconds** initial load time
- **96 kB** optimized bundle size

### Features
- **Lazy Loading**: Scene-based asset loading
- **Memory Management**: Proper cleanup and garbage collection
- **Performance Monitoring**: Built-in FPS and memory tracking
- **Mobile Optimization**: Touch-friendly UI and controls

## 🧪 Testing

### Automated Tests
- **Unit Tests**: Core utilities and functions
- **Integration Tests**: Battle system validation
- **Service Tests**: Save/load functionality

### Manual Testing
- **Scene Transitions**: All scene changes verified
- **Save/Load**: Multiple save slots tested
- **Combat**: Complete battle flow tested
- **Mobile**: Touch controls responsive

## 📚 Documentation

### Technical Docs
- [Port QA Report](docs/PORT_QA_REPORT.md) - Complete port verification
- [Battle System Documentation](BATTLE_SYSTEM_PORT_DOCUMENTATION.md) - Battle engine details
- [Overworld Documentation](OVERWORLD_PORT_IMPLEMENTATION.md) - World system details
- [Legacy Data Migration](LEGACY_DATA_MANAGER_IMPLEMENTATION.md) - Data system details

### API References
- [Overworld Quick Reference](OVERWORLD_QUICK_REFERENCE.md) - World system API
- [Map Quick Reference](MAP_QUICK_REFERENCE.md) - Map system API

## 🎯 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Consistent code style
- **Modular Design**: Proper separation of concerns
- **Documentation**: Comprehensive inline comments

### Adding Features
1. Create new scenes in `src/game/scenes/`
2. Add reusable modules to appropriate subdirectories
3. Update `src/game/main.ts` for new scenes
4. Add asset keys to `src/game/assets/AssetKeys.ts`
5. Test scene transitions thoroughly

## 🔧 Configuration

### Game Settings
- **Resolution**: 1024x768 (auto-scaled)
- **Tile Size**: 32x32 pixels
- **FPS Target**: 60 FPS
- **Audio**: Web Audio API with fallback

### Build Configuration
- **Static Export**: Optimized for static hosting
- **PWA**: Service worker and manifest included
- **Bundle Splitting**: Automatic code splitting
- **Asset Optimization**: Image and audio compression

## 🐛 Troubleshooting

### Common Issues
- **Build Fails**: Run `npm install` to update dependencies
- **Asset Loading**: Check console for 404 errors
- **Performance**: Disable debug mode with 'D' key
- **Mobile**: Ensure touch events are enabled

### Debug Features
- **D Key**: Toggle debug overlay
- **F Key**: Toggle fullscreen
- **Console**: Performance metrics logged

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit a pull request

## 📞 Support

For technical questions or bug reports:
- Check the [documentation](docs/) first
- Review existing [issues](../../issues)
- Create a new issue with details

---

**Game Status**: ✅ **Production Ready**  
**Port Status**: ✅ **Complete**  
**Last Updated**: November 2024