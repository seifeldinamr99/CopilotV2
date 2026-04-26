export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleDateString();
}

export function downloadImage(url: string, id: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = `creative-${id}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
