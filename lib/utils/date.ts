export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'Posted just now';
  } else if (diffInMinutes < 60) {
    return `Posted ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `Posted ${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `Posted ${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffInWeeks < 4) {
    return `Posted ${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInMonths < 12) {
    return `Posted ${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    return `Posted ${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  }
}

export function formatLastModified(createdAt: string | Date, updatedAt: string | Date): string {
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);
  
  // If updated is significantly different from created (more than 1 minute), show last modified
  const diffInMs = updated.getTime() - created.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes > 1) {
    return `Last modified ${formatRelativeTime(updatedAt).replace('Posted ', '')}`;
  }
  
  return formatRelativeTime(createdAt);
}
