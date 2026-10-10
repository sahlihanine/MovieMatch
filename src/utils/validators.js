export const isEmail = (v = "") => /^\S+@\S+\.\S+$/.test(v.trim());
export const isPasswordValid = (v = "") => v.length >= 6; // minimum Firebase
export const isNameValid = (v = "") => v.trim().length >= 2;
export const isAgeValid = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 10 && n <= 120;
};