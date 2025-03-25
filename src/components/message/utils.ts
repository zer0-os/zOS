export const getPlaceholderDimensions = (w: number, h: number) => {
  const width = w || 300;
  const height = h || 200;
  const maxWidth = 520;
  const maxHeight = 640;
  const aspectRatio = width / height;
  let finalWidth = width;
  let finalHeight = height;
  if (height > maxHeight) {
    finalHeight = maxHeight;
    finalWidth = maxHeight * aspectRatio;
  }
  if (finalWidth > maxWidth) {
    finalWidth = maxWidth;
    finalHeight = maxWidth / aspectRatio;
  }
  return { width: finalWidth, height: finalHeight };
};
