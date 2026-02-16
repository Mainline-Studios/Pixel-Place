/**
 * Initial training data for Pyx AI moderation system
 * These examples are used to train the neural network on first initialization
 */

export const INITIAL_TRAINING = {
  safe: [
    // Friendly greetings
    "hello everyone",
    "hi there",
    "good morning",
    "good evening",
    "hey what's up",
    "how are you",
    "nice to meet you",
    
    // Positive interactions
    "that's cool",
    "nice work",
    "great job",
    "awesome",
    "thanks for helping",
    "appreciate it",
    "you're welcome",
    "no problem",
    
    // Gaming context
    "good game",
    "gg",
    "let's play",
    "what's your favorite game",
    "want to team up",
    "anyone want to play",
    "I love this game",
    "this is fun",
    "great level",
    "nice move",
    
    // General conversation
    "what's your favorite color",
    "I like pizza",
    "it's sunny today",
    "I'm doing homework",
    "my favorite subject is math",
    "I have a dog",
    "I like to draw",
    "reading is fun",
    
    // Game-specific safe phrases
    "died to lava",
    "respawn please",
    "restart level",
    "checkpoint reached",
    "health is low",
    "game over",
    "try again",
    "next level",
    
    // Constructive feedback
    "this could be better",
    "maybe try this way",
    "I found a bug",
    "the game is laggy",
    "can you fix this",
    
    // Questions
    "how do I play",
    "where is the shop",
    "when does the event start",
    "what does this do",
    "can someone help"
  ],
  
  inappropriate: [
    // Common profanity (masked for training data)
    "f***",
    "s***",
    "damn",
    "hell",
    "crap",
    "stupid idiot",
    "you suck",
    "shut up",
    "loser",
    "noob trash",
    
    // Harassment and bullying
    "nobody likes you",
    "you're terrible",
    "kill yourself",
    "go die",
    "I hate you",
    "you're ugly",
    "get lost",
    "leave the game",
    "stop playing",
    "quit now",
    
    // PII patterns (examples, not real data)
    "my email is test@email.com",
    "call me at 555-1234",
    "my address is 123 main street",
    "my phone number is",
    "email me at",
    "my real name is john smith",
    "I live in apartment 5",
    
    // Inappropriate requests
    "send me your password",
    "what's your real name",
    "where do you live",
    "how old are you really",
    "want to meet up",
    "add me on discord",
    "follow me on instagram",
    
    // Spam patterns
    "click this link",
    "free coins hack",
    "get unlimited money",
    "visit my website",
    "subscribe to my channel",
    "check out this link",
    
    // Threats and violence (non-gaming context)
    "I'm going to hurt you",
    "I'll find you",
    "watch your back",
    "you better watch out",
    "I know where you live",
    
    // Discriminatory language
    "racist comment",
    "sexist remark",
    "homophobic slur",
    "offensive stereotype",
    
    // Explicit content references
    "inappropriate website reference",
    "adult content mention",
    "explicit material",
    
    // Scamming attempts
    "give me your account",
    "trade your password for coins",
    "I'm a developer give me admin",
    "trust me I'm staff"
  ]
};

/**
 * Gaming-specific safe phrases that might otherwise be flagged
 * These help the AI understand gaming context
 */
export const GAMING_SAFE_PHRASES = [
  "died",
  "kill",
  "dead",
  "death",
  "respawn",
  "restart",
  "eliminated",
  "knocked out",
  "lost a life",
  "game over",
  "you got me",
  "nice kill",
  "that killed me",
  "boss fight",
  "attack",
  "defeat"
];
