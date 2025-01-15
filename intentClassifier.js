const natural = require('natural');
const classifier = new natural.BayesClassifier();

// Training data for intent classification
classifier.addDocument('give me a report', 'report');
classifier.addDocument('generate report of patients', 'report');
classifier.addDocument('how many patients have malaria', 'report');
classifier.addDocument('what are the symptoms of malaria', 'chat');
classifier.addDocument('give me health tips', 'chat');
classifier.addDocument('how to prevent malaria', 'chat');

// Train the classifier
classifier.train();

// Function to classify user input
function classifyIntent(message) {
  return classifier.classify(message);
}

module.exports = { classifyIntent };
