# Drawly App

A collaborative real-time drawing application built using Next.js, WebSockets, and Express. This app allows users to create, edit, and share drawings seamlessly.

## Features

- **Real-time collaboration** using WebSockets
- **Smooth drawing experience** with customizable colors
- **Undo/Redo functionality**
- **Multi-user support**
- **Hosted on AWS** for scalability and performance

## Tech Stack

- **Frontend**: Next.js, React
- **Backend**: Express.js, WebSockets
- **Database**: PostgreSQL
- **Monorepo Management**: Turborepo
- **Hosting**: AWS

## Installation

### Prerequisites
- Node.js v18+
- PostgreSQL database

### Setup
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd drawly
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables:
   Create a `.env` file in the prisma directory under packages and add the following:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   ```
4. Start the Application server:
   ```bash
    pnpm run dev
   ```

## Usage

- Open `http://localhost:3000` in your browser.
- Start drawing and invite others to collaborate!

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for discussion.

## License

This project is licensed under the MIT License.

---

Happy drawing! 🎨

