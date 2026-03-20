export const DUNE_LITANY = "I must not fear. Fear is the mind-killer. Fear is the little-death that brings total obliteration. I will face my fear. I will permit it to pass over me and through me. And when it has gone past I will turn the inner eye to see its path. Where the fear has gone there will be nothing. Only I will remain.";

export const QUOTES_BY_DIFFICULTY = {
  easy: [
    "The quick brown fox jumps over the lazy dog.",
    "To be, or not to be, that is the question.",
    "All that glitters is not gold.",
    "Believe you can and you're halfway there.",
    "Do one thing every day that scares you.",
    "Stay hungry, stay foolish.",
    "Dream big and dare to fail."
  ],
  medium: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "In the end, it's not the years in your life that count. It's the life in your years.",
    "The only way to do great work is to love what you do.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you've ever wanted is on the other side of fear."
  ],
  hard: [
    DUNE_LITANY,
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "What you get by achieving your goals is not as important as what you become by achieving your goals.",
    "The only limit to our realization of tomorrow will be our doubts of today.",
    "The best way to predict the future is to create it.",
    "Your time is limited, so don't waste it living someone else's life."
  ]
};

export type Difficulty = keyof typeof QUOTES_BY_DIFFICULTY;
