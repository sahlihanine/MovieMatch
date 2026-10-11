export const isEmail = (v = "") => /^\S+@\S+\.\S+$/.test(v.trim());
export const isPasswordValid = (v = "") => v.length >= 6; // minimum Firebase
export const isNameValid = (v = "") => v.trim().length >= 2;
export const isAgeValid = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 10 && n <= 120;
};
export const isUrl = (v = "") => {
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export const minLength = (v = "", n = 1) => v.trim().length >= n;