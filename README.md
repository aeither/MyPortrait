<div align="center">
    <img src="https://github.com/user-attachments/assets/784cc6da-40ff-426b-95fd-685090ae449e" alt="Logo" width="960">
</div>

# LukUp

LukUp is a modern web application for interacting with the LUKSO blockchain, allowing users to search for Universal Profiles, view profile details, and send LYX tokens via an intuitive chat interface. This project focused on creating next-generation mini dApp that extend the functionality of The Grid.

## 🌐 The Grid Integration

LukUp transforms how users interact with Universal Profiles on The Grid by:

- **AI-Enhanced Interactions**: Converting complex blockchain operations into simple, conversational commands
- **Seamless Profile Discovery**: Making Universal Profiles more accessible and discoverable via natural language search
- **Frictionless Microtransactions**: Enabling quick LYX donations with minimal steps through chat commands
- **Identity-Centric Experience**: Putting Universal Profiles at the center of the user experience, enhancing The Grid's focus on digital identity

LukUp demonstrates how AI agents can be integrated with blockchain technology to create more intuitive and accessible dApps, turning Universal Profiles into dynamic, interactive spaces where digital identity, social interaction, and creative monetization converge.

## 🚀 Features

- **Universal Profile Integration**: Connect with LUKSO Universal Profile wallets
- **Profile Search**: Find Universal Profiles by name, username, or partial address
- **Profile Viewing**: Display profile information including name, avatar, and background images
- **LYX Donations**: Send LYX tokens to any Universal Profile address with a simple chat command
- **AI-Powered Chat**: Interact with the application using natural language through an AI assistant
- **Responsive UI**: Modern, clean interface built with Tailwind CSS that works across devices

## 🔧 Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Blockchain Integration**: 
  - LUKSO UP Provider for wallet connectivity
  - ERC725.js for profile data retrieval
  - Viem for blockchain interactions
- **AI Integration**: AI SDK with Chat interface
- **Data Fetching**: GraphQL via the LUKSO Envio indexer

## 💡 Value Proposition for The Grid

LukUp enhances The Grid ecosystem in several ways:

1. **Lowering Entry Barriers**: Simplifying blockchain interactions through natural language, making The Grid accessible to non-technical users
2. **Enhancing Social Dynamics**: Facilitating easier discovery of other users' profiles, fostering community connections
3. **Enabling Micro-Monetization**: Streamlining the donation process, supporting creator economies within The Grid
4. **Demonstrating New Interaction Paradigms**: Showcasing how AI can transform the way users interact with blockchain applications

By combining AI with LUKSO's blockchain infrastructure, LukUp represents a new generation of Web3 applications that prioritize user experience without compromising on functionality.

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 18+ recommended
- Yarn package manager
- LUKSO UP Browser extension installed (for wallet connectivity)

### Installation Steps

1. Clone the repository
   ```
   git clone https://github.com/aeither/LukUp.git
   cd LukUp
   ```

2. Install dependencies
   ```
   yarn install
   ```

3. Create a `.env` file with the required environment variables:
   ```
   GROQ_API_KEY=your_api_key
   ```

4. Start the development server
   ```
   yarn dev
   ```

5. Build for production
   ```
   yarn build
   ```

## 🔍 Usage

### Connecting Your Wallet

1. Access the application through your browser
2. Ensure you have the LUKSO UP Browser extension installed
3. The application will automatically detect your UP Browser extension

### Searching for Profiles

1. Use the chat interface to search for profiles with the command format:
   ```
   search [name or address]
   ```
2. Select a profile from the search results to view details

### Sending Donations

1. Use the chat interface to send LYX with the command format:
   ```
   donate [amount] to [address]
   ```
2. Confirm the transaction in your UP Browser wallet

## 🚀 Future Roadmap

Building on our participation in Hack The Grid, we plan to expand LukUp with:

- **Enhanced AI Capabilities**: Implementing more complex interactions and personalized recommendations
- **LSP7/8 Token Support**: Expanding beyond LYX to handle digital assets and collectibles
- **Integration with Other Grid Mini dApps**: Creating a seamless ecosystem of interoperable applications
- **Multi-language Support**: Making The Grid accessible to global audiences

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
