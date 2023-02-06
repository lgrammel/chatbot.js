# chatbot.js

> &nbsp;
>
> #### Get a HTTP chatbot server that calls the Open AI API with your custom prompt running in less than 3 minutes.
>
> &nbsp;

## Setup

### Install Chatbot.js
1. `npm install @rubberduckai/chatbot.js`

### Create Prompt Template
1. `mkdir template`
1. `cd template`
1. `wget https://raw.githubusercontent.com/rubberduck-ai/chatbot.js/main/example/prompt.template`
1. `cd ..`

### Run Chatbot.js Server
1. `npm chatbot --host 127.0.0.1 --port 3000 --template-folder template --open-ai-api-key YOUR_OPEN_AI_API_KEY`

### Create chat
1. `curl -X POST http://127.0.0.1:3000/chat`

### Add message to chat (will create bot response)
1. `curl -X POST -H "Content-Type: application/json; charset=utf-8" -d '{ "message": "how can i get the current date in javascript" }' http://127.0.0.1:3000/chat/0/message`

## Development

Pre-requisites: `brew install pnpm`

* Install dependencies: `pnpm install`
* Start server: `pnpm start`
