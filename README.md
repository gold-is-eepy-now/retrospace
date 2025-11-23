# Retrospace 🚀

A nostalgic social media mashup combining the chaotic energy of 2005 MySpace with the micro-blogging speed of 2007 Twitter.

## Features

- **Retro UI**: Pixel-perfect recreation of mid-2000s aesthetics.
- **Persistent Backend**: Uses a local JSON database so your posts and users survive page refreshes.
- **Profiles**: Customizable themes, music players, and "Top 8" friends.
- **Social Features**: Likes, Comments, Direct Messages, and Following.
- **Admin Panel**: Ban users and delete posts (create a user named `admin`).
- **AI Integration**: Generates emo lyrics, blog posts, and status updates.

## 📦 Prerequisites

You need **Node.js** installed on your computer.
- [Download Node.js](https://nodejs.org/)

## 🚀 Quick Start (Running the Server)

The app works in two modes: **Local Mode** (browser storage only) and **Server Mode** (persistent database). To use Server Mode:

1.  **Open your terminal** in the project folder.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start the server**:
    ```bash
    npm start
    ```
    You should see: `Retrospace Server running at http://localhost:3001`

4.  **Open the App**:
    - The frontend will automatically detect the server running on port 3001.
    - If the server is off, the app falls back to LocalStorage (Demo Mode).

## 🔑 Admin Access

To access the moderation panel:
1.  Sign up with the username: `admin`
2.  You will see an `[Admin]` link in the header.
3.  You can ban users and delete posts from there.

## 🛠️ File Structure

- `server.js`: The backend API and database manager.
- `database.json`: Automatically created file where user data is saved.
- `src/App.tsx`: Main frontend logic.
- `src/services/api.ts`: Handles communication between the frontend and backend.

## 🎵 Music Player

The music player is visual-only by default to respect browser autoplay policies, but it perfectly mimics the WinAmp aesthetics of the era.
