function formatDate(dateInput: Date | number | string): string {
  const d = new Date(dateInput || Date.now());

  const pad = (n) => n.toString().padStart(2, '0');

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export default formatDate;
