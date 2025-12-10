export const generateProjectKey = (name: string) => {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    .normalize('NFKD') // handles accented chars
    .replace(/[^\w\s]/g, ' ') // replace symbols with space
    .split(/\s+/)
    .map(word => (word[0] ? word[0].toUpperCase() : ''))
    .filter(l => /[A-Z]/i.test(l)) // allow unicode letters too
    .join('')
    .slice(0, 5);
};
