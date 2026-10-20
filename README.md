# 🏛️ LegalBridge-AI Mobile

<div align="center">
  <img src="./assets/icon.png" alt="LegalBridge-AI Logo" width="120" height="120">
  
  **Your AI-Powered Legal Assistant on Mobile**
  
  [![Expo SDK](https://img.shields.io/badge/Expo%20SDK-53-blue.svg)](https://expo.dev/)
  [![React Native](https://img.shields.io/badge/React%20Native-0.79.5-green.svg)](https://reactnative.dev/)
  [![License](https://img.shields.io/badge/License-0BSD-red.svg)](https://opensource.org/licenses/0BSD)
  
  🏆 **SIH 2024 Finalist Project** 🏆
</div>

---

## 📱 About LegalBridge-AI Mobile

LegalBridge-AI Mobile is the revolutionary mobile application developed for **Smart India Hackathon (SIH) 2024** finals. This cutting-edge legal technology solution brings the power of artificial intelligence to your fingertips, making legal assistance accessible, affordable, and available 24/7.

Our mission is to democratize legal knowledge and provide instant legal guidance to citizens, legal professionals, and students across India.

## ✨ Key Features

### 🤖 **AI Lawyer**
- Get instant answers to legal queries
- 24/7 availability for legal consultation
- Powered by advanced AI algorithms
- Supports multiple legal domains

### 📚 **Bare Acts Database**
- Complete collection of Indian legal bare acts
- Search functionality across all acts
- Easy navigation and bookmarking
- Offline access to essential documents

### 📄 **FIR Builder**
- Generate First Information Reports (FIRs) digitally
- Step-by-step guided process
- Download in multiple formats
- Compliant with official formats

### 🗃️ **Document Management**
- Upload and manage original legal documents
- Secure cloud storage
- Document categorization and tagging
- Easy sharing capabilities

### 🔍 **Legal Database**
- Extensive collection of case laws
- Advanced search and filtering
- Case study references
- Legal precedent database

### ⚙️ **Smart Features**
- Dark/Light mode support
- Multilingual interface
- Voice search capabilities
- Offline functionality

## 🛠️ Technology Stack

### **Frontend (Mobile)**
- **React Native** (0.79.5) - Cross-platform mobile development
- **Expo SDK** (53) - Development platform and toolchain
- **React Navigation** - Navigation library
- **React Native Paper** - Material Design components
- **React Native Vector Icons** - Icon library
- **React Native Reanimated** - Advanced animations

### **Development Tools**
- **Metro Bundler** - JavaScript bundler
- **Expo CLI** - Command-line tools
- **ESLint** - Code linting
- **Prettier** - Code formatting

### **Key Libraries**
```json
{
  "expo": "~53.0.0",
  "react": "19.0.0",
  "react-native": "0.79.5",
  "@react-navigation/native": "^7.0.13",
  "react-native-paper": "^5.12.5",
  "react-native-vector-icons": "^10.2.0",
  "axios": "^1.3.0",
  "react-native-pdf": "^6.7.6"
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/LegalBridge-AI.git
   cd LegalBridge-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/emulator**
   - Scan QR code with Expo Go app (recommended for testing)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

### Building for Production

1. **Build for Android**
   ```bash
   npx expo build:android
   ```

2. **Build for iOS**
   ```bash
   npx expo build:ios
   ```

## 📱 Screenshots

<div align="center">
  <img src="./screenshots/landing.png" alt="Landing Page" width="200">
  <img src="./screenshots/ai-lawyer.png" alt="AI Lawyer" width="200">
  <img src="./screenshots/bare-acts.png" alt="Bare Acts" width="200">
  <img src="./screenshots/fir-builder.png" alt="FIR Builder" width="200">
</div>

## 🏗️ Project Structure

```
LegalBridge-AI/
├── 📁 android/              # Android-specific files
├── 📁 assets/               # App assets (images, icons)
├── 📁 components/           # Reusable React components
│   ├── Footer.js
│   └── MenuBar.js
├── 📁 images/               # Static images
├── 📁 Json/                 # JSON data files
│   ├── cpc.json
│   ├── crpc.json
│   ├── iea.json
│   ├── ipc.json
│   └── mva.json
├── 📁 pages/                # App screens/pages
│   ├── Landing.js
│   ├── Query.js
│   ├── BareActs.js
│   ├── Database.js
│   ├── FIRDownload.js
│   ├── OriginalDocuments.js
│   ├── Settings.js
│   └── ...
├── App.js                   # Main app component
├── package.json             # Dependencies and scripts
├── app.json                 # Expo configuration
└── README.md               # Project documentation
```

## 🎯 Core Functionalities

### 1. **AI-Powered Legal Consultation**
- Natural language processing for legal queries
- Context-aware responses
- Multi-domain legal expertise
- Conversation history tracking

### 2. **Comprehensive Legal Database**
- Indian Penal Code (IPC)
- Code of Criminal Procedure (CrPC)
- Code of Civil Procedure (CPC)
- Indian Evidence Act (IEA)
- Motor Vehicle Act (MVA)

### 3. **Digital FIR Generation**
- User-friendly form interface
- Auto-validation of required fields
- PDF generation and download
- Official format compliance

### 4. **Document Management System**
- Secure file upload and storage
- Document categorization
- Search and filter capabilities
- Sharing and collaboration tools

## 🔧 Configuration

### Environment Setup
Create a `.env` file in the root directory:

```env
API_BASE_URL=your_backend_api_url
OPENAI_API_KEY=your_openai_api_key
FIREBASE_CONFIG=your_firebase_config
```

### Expo Configuration
The `app.json` file contains Expo-specific configuration:

```json
{
  "expo": {
    "name": "LegalBridge-AI",
    "slug": "legalbridge-ai",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true
  }
}
```

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Running on Physical Device
1. Install Expo Go from App Store/Play Store
2. Scan QR code from terminal
3. App will load on your device

## 🚀 Deployment

### Play Store Deployment
1. Build APK: `npx expo build:android`
2. Sign with your keystore
3. Upload to Google Play Console

### App Store Deployment
1. Build IPA: `npx expo build:ios`
2. Upload to App Store Connect
3. Submit for review

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow React Native best practices
- Use TypeScript for type safety
- Write comprehensive tests
- Follow the existing code style
- Update documentation for new features

## 📄 License

This project is licensed under the **0BSD License** - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Developed with ❤️ by our SIH 2024 team:


## 🏆 Achievements

- 🥇 **SIH 2024 Finalist** - Selected among top teams nationwide
- 🚀 **Innovation Award** - For revolutionary legal tech solution
- 📱 **Best Mobile App** - User-friendly interface and functionality
- 🤖 **AI Excellence** - Advanced natural language processing


## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core AI lawyer functionality
- ✅ Bare acts database
- ✅ FIR builder
- ✅ Document management

### Phase 2 (Upcoming)
- 🔄 Multilingual support
- 🔄 Voice recognition
- 🔄 Advanced analytics
- 🔄 Legal case tracking

### Phase 3 (Future)
- 🔮 Blockchain integration
- 🔮 Smart contracts
- 🔮 Legal marketplace
- 🔮 AI-powered legal research

## 🙏 Acknowledgments

- **Smart India Hackathon** for providing the platform
- **Ministry of Electronics & IT** for supporting innovation
- **Legal experts** for domain knowledge and guidance
- **Open source community** for amazing tools and libraries

---

<div align="center">
  <strong>Made with 💙 for the people of India</strong>
  
  ⭐ **Star this repository if you found it helpful!** ⭐
</div>