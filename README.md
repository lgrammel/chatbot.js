# chatbot.js

> #### ⚡ Get a HTTP chatbot server that calls the Open AI API with your custom prompt running in less than 3 minutes. ⚡

## Setup

### Install Chatbot.js

`npm install @rubberduckai/chatbot.js`

### Create Prompt Template

1. `mkdir template`
1. `cd template`
1. `wget https://raw.githubusercontent.com/rubberduck-ai/chatbot.js/main/example/prompt.template`
1. `cd ..`

### Run Chatbot.js Server

`npm chatbot --host 127.0.0.1 --port 3000 --template-folder template --open-ai-api-key YOUR_OPEN_AI_API_KEY`

### Create chat

`curl -X POST http://127.0.0.1:3000/chat`
Response:

```
{"id":"0","messages":[]}%
```

### Add message to chat (will create bot response)

`curl -X POST -H "Content-Type: application/json; charset=utf-8" -d '{ "message": "how can i get the current date in javascript" }' http://127.0.0.1:3000/chat/0/message`

Response:

```
{"id":"0","messages":[{"author":"user","text":"how can i get the current date in javascript"},{"author":"bot","text":" To get the current date in JavaScript, you can use the Date object. The Date object provides methods for working with dates and times. For example, you can use the Date.now() method to get the current timestamp in milliseconds. You can also use the Date.getFullYear() method to get the current year. If you need to format the date in a specific way, you can use the Intl.DateTimeFormat() method. This method allows you to specify the locale and the format of the date."}]}%
```

## Development

Pre-requisites: `brew install pnpm`

- Install dependencies: `pnpm install`
- Start server: `pnpm start`
