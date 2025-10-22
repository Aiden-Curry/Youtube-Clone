const profanityWords = [
  "badword1",
  "badword2",
  "offensive",
  "inappropriate",
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();

  return profanityWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lowerText);
  });
}

export function filterProfanity(text: string): string {
  let filteredText = text;

  profanityWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));
  });

  return filteredText;
}

export function validateContent(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: "Content cannot be empty" };
  }

  if (text.length > 5000) {
    return { valid: false, error: "Content is too long (max 5000 characters)" };
  }

  if (containsProfanity(text)) {
    return { valid: false, error: "Content contains inappropriate language" };
  }

  return { valid: true };
}
