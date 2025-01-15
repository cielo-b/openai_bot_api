// const express = require('express');
// const bodyParser = require('body-parser');
// const OpenAI = require('openai');
// const { sequelize } = require('./database'); // Assuming only sequelize is used
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// app.post('/chat', async (req, res) => {
//     const userInput = req.body.message;

//     try {
//         // Step 1: Classify Intent
//         const intentResponse = await openai.chat.completions.create({
//             model: 'gpt-3.5-turbo',
//             messages: [
//                 { role: 'system', content: 'Classify the user input as "report", "chat", or "unknown".' },
//                 { role: 'user', content: userInput },
//             ],
//             max_tokens: 10,
//         });

//         const intent = intentResponse.choices?.[0]?.message?.content?.trim().toLowerCase();

//         if (intent === 'report') {
//             try {
//                 // Step 2: Generate SQL Query
//                 const sqlResponse = await openai.chat.completions.create({
//                     model: 'gpt-3.5-turbo',
//                     messages: [
//                         { role: 'system', content: 'Generate a SQL query based on the schema provided.' },
//                         {
//                             role: 'user',
//                             content: `Database schema:
//                                 1. Patients (id, name, age, gender)
//                                 2. Diagnoses (id, PatientId, DiseaseId, diagnosis_date)
//                                 3. Diseases (id, name)

//                                 User query: "${userInput}"`,
//                         },
//                     ],
//                     max_tokens: 150,
//                 });

//                 let sqlQuery = sqlResponse.choices?.[0]?.message?.content?.trim();
//                 sqlQuery = sqlQuery.replace(/```sql|```/g, '').trim(); // Clean up markdown

//                 // Execute SQL query
//                 const [results] = await sequelize.query(sqlQuery);

//                 if (results.length > 0) {
//                     return res.json({ success: true, intent, data: results });
//                 } else {
//                     throw new Error('No data found for the given query.');
//                 }
//             } catch (dbError) {
//                 console.error('Database Query Error:', dbError);
//                 const fallbackResponse = await openai.chat.completions.create({
//                     model: 'gpt-3.5-turbo',
//                     messages: [
//                         { role: 'system', content: 'Provide a general health-related answer or tips.' },
//                         { role: 'user', content: userInput },
//                     ],
//                     max_tokens: 150,
//                 });

//                 return res.json({
//                     success: true,
//                     intent,
//                     message: fallbackResponse.choices?.[0]?.message?.content?.trim(),
//                 });
//             }
//         } else {
//             // Step 3: General Chat Response
//             const chatResponse = await openai.chat.completions.create({
//                 model: 'gpt-3.5-turbo',
//                 messages: [
//                     { role: 'system', content: 'Provide a general health-related answer or tips.' },
//                     { role: 'user', content: userInput },
//                 ],
//                 max_tokens: 150,
//             });

//             return res.json({ success: true, intent, message: chatResponse.choices?.[0]?.message?.content?.trim() });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again later.' });
//     }
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

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


// Route to handle chatbot requests
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an all-knowing assistant who answers any question, whether about health, medicines, technology, or general knowledge.' },
        { role: 'user', content: userMessage },
      ],
    });

    console.log(response?.choices?.[0]?.message?.content);
    const chatbotReply = response?.choices?.[0]?.message?.content;
    res.json({ response: chatbotReply });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error.message);
    res.status(500).json({ error: 'An error occurred. Please try again.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
