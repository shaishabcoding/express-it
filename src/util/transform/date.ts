export const date = (str: string) => {
  try {
    return new Date(str);
  } catch {
    return;
  }
};
