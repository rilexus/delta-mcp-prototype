import { encode } from "@toon-format/toon";

export const get = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

export const toonify = (data) => encode(data);

export const tryCatch = async (resolver) => {
  try {
    return [await resolver(), null];
  } catch (e) {
    return [null, e];
  }
};
