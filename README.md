# Balnce AI Imagination Engine - The Infinite Canvas

The Infinite Canvas is Balnce AI's way of providing a decentralized, AI-powered, next generation tool that will allow users to manage workflows based on their intent. 
If you can imagine, the Canvas will help you bring it alive.

## Tech Stack Details

The Infinite Canvas is built as a TypeScript + React web application. The project's back end is supported by NodeJS. Agents used in the canvas nodes are run through Gemini API.

## Set Up & Instructions

The current build requires users to run the program directly from the terminal, as the decentralized nature of the project keeps everything at a local scale.
The intention is for the final product to be integrated within the Balnce AI app.

```bash
npm run all
```

Upon entering the landing page, all you need to do is create an account and log in!

## Usage

Once you are logged in, you can create a new project that utilizes a new canvas. Each new project will have its own canvas. The canvas has a variety of different nodes, each with 
their own unique functions to help assist you in your workflows, and they can connect to one other to tie your project together! Each canvas can be used for whatever you can think 
of, be it a new startup idea, an app you have in mind, or even taking care of your daily tasks! The following is a list of available nodes:

- Refiner: Refine text into a specific writing style.
- Summarizer: Summarize and analyze mixed media inputs.
- Translator: Translate text/audio into a target language.
- Color Swapper: Transfer palette from one image to another.
- Filter: Filter text or JSON with certain conditions.
- Web Scraper: Scrape a manually entered URL and return both structured JSON and plain text.
- Formatter: Reformat files into requested output format.
- Programmer: Generates code from prompt and optional source file.
- Gmail: Automates checking, sending, and receiving emails from your Gmail account.

## Current Project Status
The base canvas is ready to go, but we are working on implementing more nodes for automation purposes, such as connecting to Slack and Discord to name a few.

## Tools & Acknowledgements
- React.js and Tailwind CSS: General frontend UI and styling
- React Flow: React library for infinite canvas blocks
- React Router: React library for routing between different pages
- Vite: Local development server for testing
- Node.js, Typescript, and Express: Backend server code
- PostgresSQL: Local database to store user login and project information
- Bcrypt, crypto, and JWT: Node libraries for authentication
- Ollama: Local LLM models as the basis for AI agents
- Microsoft Autogen: Communication and fine tuning of AI agents
- Google Gemini: Non-local LLM models for debugging and testing
- Gemini CLI, Codex, Antigravity, etc.: Various AI tools for fast code development or debugging
