const express = require('express');
const {Server} = require('socket.io');
const {OpenAI} = require('openai');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure to set your OpenAI API key in the .env file
});

const app = express();
const server = require('http').Server(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow frontend to connect
  },
});

let assistant = await client.beta.assistants.create({
  name: 'hungcq Temporal assistant',
  instructions: 'Use your knowledge base to answer questions about Temporal.',
  model: 'gpt-4o-mini',
  tools: [{type: 'file_search'}],
});

await client.beta.assistants.update(assistant.id, {
  tool_resources: {file_search: {vector_store_ids: ['vs_ewunN7laFAOw6m8mEOF5jixY']}},
});

// Handle WebSocket connections
io.on('connection', async (socket) => {
  console.log('A user connected');

  const thread = await client.beta.threads.create();

  // Listen for 'message' events from the frontend
  socket.on('message', async (msg) => {
    console.log(msg);
    try {
      // Send user message to OpenAI
      const message = await client.beta.threads.messages.create(
          thread.id,
          {
            role: 'user',
            content: msg,
          },
      );

      const stream = await client.beta.threads.runs.create(
          thread.id,
          {assistant_id: assistant.id, stream: true},
      );

      for await (const event of stream) {
        // console.log(JSON.stringify(event))
        if (event.event !== 'thread.message.delta') {
          continue;
        }
        let text = event.data.delta.content[0].text.value;
        const annotations = event.data.delta.content[0].text.annotations;
        if (!annotations) {
          socket.emit('message', text);
          continue;
        }
        let index = 0;
        for (let annotation of annotations) {
          text = text.replace(annotation.text, '[' + index + ']');
          const {file_citation} = annotation;
          if (file_citation) {
            const citedFile = await client.files.retrieve(
                file_citation.file_id);
            text = text.replace('[' + index + ']',
                ' (source: ' + citedFile.filename + ')');
          }
          index++;
        }
        socket.emit('message', text);
      }
    } catch (error) {
      console.error('Error:', error);
      socket.emit('message', 'Error occurred');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(8000, () => {
  console.log('Server running on localhost:1918');
});
