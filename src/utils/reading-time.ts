export type ReadingTimeResult = {
  text: string;
  minutes: number;
  words: number;
};

export function getReadingTimeInMinutes(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

export function getReadingTime(text: string): string {
  const minutes = getReadingTimeInMinutes(text);
  return `${minutes} min read`;
}

export function getDetailedReadingTime(text: string): ReadingTimeResult {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return {
    text: `${minutes} min read`,
    minutes,
    words,
  };
}
