export const boardColors = {
  Backlog: 'bg-error-accent',
  'In Progress': 'bg-info-accent',
  Review: 'bg-primary-accent',
  Testing: 'bg-fill1',
  Done: 'bg-success-accent',
};

export const menuColors = {
  Backlog: 'error',
  'In Progress': 'info',
  Review: 'primary',
  Testing: 'neutral',
  Done: 'success',
};

export const ticketColors = {
  Backlog: 'bg-error-focus',
  'In Progress': 'bg-info-focus',
  Review: 'bg-primary-focus',
  Testing: 'bg-soft',
  Done: 'bg-success-focus',
};

export const ringColors = {
  error: 'ring-error',
  info: 'ring-info',
  primary: 'ring-primary',
  neutral: 'ring-neutral',
  success: 'ring-success',
  warning: 'ring-warning',
};

export function getBoardColor(name: string) {
  return boardColors[name] || 'bg-fill1';
}

export function getMenuColors(
  name: string
): 'error' | 'info' | 'warning' | 'neutral' | 'success' | 'primary' {
  return (
    (menuColors[name as keyof typeof menuColors] as
      | 'error'
      | 'info'
      | 'warning'
      | 'neutral'
      | 'success'
      | 'primary') || 'neutral'
  );
}

export function getTicketColor(name: string) {
  return ticketColors[name] || 'bg-fill2';
}

export const getRingColor = (name: string) => {
  const colorKey = getMenuColors(name);
  return ringColors[colorKey] || 'ring-neutral';
};
