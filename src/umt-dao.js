import { UMT_BASE } from "./env.js";
import { tryCatch } from "./utils.js";

export const createUMTDAO = ({ auth, env = "delta" }) => {
  const deltaBaseURL = "https://api.ubermetrics-technologies.com";
  const betaBaseURL = "https://beta-api.ubermetrics-technologies.com";

  let UMT_BASE = deltaBaseURL;

  if (env === "beta") {
    UMT_BASE = betaBaseURL;
  }

  const { username, password } = auth;

  const fetchToken = ({ username, password }) =>
    fetch(`${UMT_BASE}/auth/token`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
      },
    });

  const mentions = {
    async get(params) {
      const [res, error] = await tryCatch(() =>
        fetchToken({ username, password }),
      );
      if (error) throw error;
      const token = await res.text();

      const searchParams = new URLSearchParams(params).toString();

      return fetch(`${UMT_BASE}/v2/mentions?${searchParams}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  };
  return {
    mentions,
  };
};
