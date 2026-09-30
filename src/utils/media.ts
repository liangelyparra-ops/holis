export function getDirectDriveUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    // 1. Matches /file/d/FILE_ID/
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }
    // 2. Matches ?id=FILE_ID
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }
  return url;
}

export function getEmbedUrl(url: string | undefined): string {
  if (!url) return '';

  // 1. Google Drive Links (PDF, Video, Docs, etc.)
  if (url.includes('drive.google.com')) {
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://drive.google.com/file/d/${fileDMatch[1]}/preview`;
    }
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }

  // 2. YouTube Links
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    } else if (url.includes('watch?v=')) {
      const match = url.match(/[?&]v=([^&#]+)/);
      if (match && match[1]) {
        videoId = match[1];
      }
    } else if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    } else if (url.includes('/embed/')) {
      const parts = url.split('/embed/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }

  // 3. Vimeo Links
  if (url.includes('vimeo.com')) {
    const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
    if (match && match[3]) {
      return `https://player.vimeo.com/video/${match[3]}`;
    }
  }

  return url;
}

export const getFirstMediaBlock = (project: any) => {
  if (project.blocks && project.blocks.length > 0) {
    return project.blocks.find((b: any) => ['image', 'carousel', 'video', 'pdf'].includes(b.type));
  }
  return null;
};
