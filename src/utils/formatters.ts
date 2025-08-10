export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const formatBirthDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) {
    return 'N/A';
  }
  return new Date(dateString).toLocaleString('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
};

export const formatShortDateTime = (dateString: string | null): string => {
  if (!dateString) {
    return 'N/A';
  }
  return new Date(dateString).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
};

export const getLocalDateTimeString = (date = new Date()): string => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const getFileType = (mimeType: string): 'pdf' | 'image' | 'report' => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  return 'report';
};
