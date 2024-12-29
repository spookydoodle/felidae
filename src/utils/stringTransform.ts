/**
 * Capitalizes the first character and sets all others to lower case.
 */
export const capitalizeWord = (text: string) => {
  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
};

/**
 * Capitalizes only the first character. 
 */
export const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.substring(1);
};
