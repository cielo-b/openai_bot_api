import express from 'express';
import bodyParser from 'body-parser';
import OpenAI from 'openai';
import cors from 'cors';
import { franc } from 'franc';
import {iso6393} from 'iso-639-3';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const detectLanguage = async (text) => {
  const langCode = franc(text); // Detect the language
  const language = iso6393.find((lang) => lang.iso6393 === langCode);
  return language ? language.name : 'English'; // Default to English if not detected
};

// Helper Function: Generate AI response
const generateChatResponse = async (message, language) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a healthcare assistant. Respond in the language of the user in either English or French or Kinyarwanda according to the input language.
          you are also a knowledgeable and friendly assistant specializing in health and medical services. You can:
          1. Recommend over-the-counter medicines for common ailments (e.g., fever, cold, headache).
          2. Suggest suitable tests or procedures based on symptoms.
          3. Advise users on when to seek medical attention.
          4. Provide health tips and suggestions in multiple languages for accessibility.
          Note: Always encourage users to consult a professional for serious or persistent issues.`,
        },
        { role: 'user', content: message },
      ],
    });
    return response?.choices?.[0]?.message?.content || 'Sorry, I couldn’t process your request at the moment.';
  } catch (error) {
    console.error('Error while generating AI response:', error.message);
    throw new Error('AI service is currently unavailable.');
  }
};

// Route to handle chatbot requests
app.post('/chat', async (req, res) => {
  const { message, image } = req.body;

  // Validate input
  if (!message) {
    return res.status(400).json({ error: 'Message field is required.' });
  }

  try {
    const detectedLanguage = await detectLanguage(message);
    console.log('Detected Language:', detectedLanguage);
    // Handle text message
    const textResponse = await generateChatResponse(message, detectedLanguage);

    // Placeholder for handling image input if required in the future
    if (image) {
      console.log('Image processing is not implemented yet.');
    }

    // Respond with AI output
    res.status(200).json({
      success: true,
      language: detectedLanguage,
      response: textResponse,
    });
  } catch (error) {
    console.error('Error in /chat route:', error.message);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again later.',
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong on the server. Please try again later.',
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
