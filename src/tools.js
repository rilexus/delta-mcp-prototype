import z from "zod";
import { get, toonify } from "./utils.js";

export const createMentionsTool = (options) => {
  const { dao } = options;

  const mapMention = (mention) => {
    const uuid = get(mention, "uuid");
    const title = get(mention, "document.title");
    const published = get(mention, "document.published");
    const url = get(mention, "document.url");
    const sentiment = get(mention, "sentiment.display");
    const virality = get(mention, "document.virality.total");
    const inlinks = get(mention, "document.inlinks.total");
    const outlinks = get(mention, "document.outlinks.total");
    const mediaSegment = get(mention, "document.mediaSegment.name");

    return {
      uuid,
      title,
      url,
      virality,
      published,
      inlinks,
      outlinks,
      mediaSegment,
      sentiment:
        sentiment === 1
          ? "positive"
          : sentiment === -1
            ? "negative"
            : sentiment === 0
              ? "neutral"
              : "no sentiment",
    };
  };

  const inputSchema = z.object({
    searches_id: z
      .string()
      .describe(
        "Comma-separated list of search ids. Use '0' for all searches, a folder id for all searches in a folder, or specific search ids.",
      )
      .default("0"),
    phrase: z
      .string()
      .describe("Include only mentions matching this search query.")
      .optional(),
    date_from: z
      .string()
      .describe(
        "Exclude mentions published before this ISO 8601 timestamp (e.g. '2024-01-01' or '2024-01-01T08:00Z').",
      )
      .optional(),
    date_to: z
      .string()
      .describe(
        "Exclude mentions published after this ISO 8601 timestamp. Defaults to 3000-01-01T01:01:01.000Z.",
      )
      .optional(),
    language: z
      .string()
      .describe(
        "Filter by language code(s), comma-separated (e.g. 'en' or 'en,de').",
      )
      .optional(),
    country: z
      .string()
      .describe(
        "Filter by country code(s), comma-separated. Use 'missing' to include mentions with no country assigned.",
      )
      .optional(),
    media_segment_id: z
      .string()
      .describe(
        `Filter by media segment id(s), comma-separated.

      Available values:
      * 2 (Blogs)
      * 3 (News)
      * 4 (Social Networks)
      * 5 (Microblogs)
      * 6 (Web)
      * 7 (Forums)
      * 10 (Press Releases)`,
      )
      .optional(),
    sentiment: z
      .array(z.enum(["-1", "0", "1", "-99"]))
      .describe(
        "Filter by sentiment: -1 (negative), 0 (neutral), 1 (positive), -99 (no sentiment).",
      )
      .optional(),
    tags_id: z
      .string()
      .describe(
        "Include mentions tagged with at least one of the specified tag ids, comma-separated.",
      )
      .optional(),

    offset: z
      .number()
      .int()
      .describe(
        "Number of initial results to skip. Max offset+limit is 10000. Default 0.",
      )
      .default(0),
    limit: z
      .number()
      .int()
      .describe("Number of results to return (max 100). Default 25.")
      .default(25),
  });

  const fetchMentionsTool = {
    name: "fetch_mentions",
    description: `
    Fetch media mentions matching the specified filters.
    Supports filtering by search, phrase, date range, language, country, media segment, sentiment, tags, source, read/marked/critical/mailed status, inlink count, and more.
    Results are paginated and sortable. Returns total count and a list of mentions with title, url, media segment, published date, sentiment, virality, and link counts.
  `,
    inputSchema,
    execute: async ({
      searches_id,
      phrase,
      date_from,
      date_to,
      language,
      country,
      media_segment_id,
      sentiment,
      tags_id,
      offset,
      limit,
    }) => {
      const params = {
        "searches.id": searches_id,

        offset,
        limit: Math.min(limit, 100),
      };

      if (phrase) params["phrase"] = phrase;
      if (date_from) params["document.published.geq"] = date_from;
      if (date_to) params["document.published.leq"] = date_to;
      if (language) params["document.languageCode"] = language;
      if (country) params["document.countryCode"] = country;
      if (media_segment_id)
        params["document.mediaSegment.id"] = media_segment_id;
      if (sentiment?.length) params["sentiment.display"] = sentiment.join(",");
      if (tags_id) params["tags.id"] = tags_id;

      const response = await (await dao.mentions.get(params)).json();

      return {
        content: [
          {
            type: "text",
            text: toonify({
              ...response,
              items: response.items?.map(mapMention),
            }),
          },
        ],
      };
    },
  };

  return fetchMentionsTool;
};

export const currentDateAndTimeTool = {
  name: "current_date_and_time",
  description:
    "Returns the current date and time. Call this whenever you need to know today's date or the current time, for example when the user asks 'what day is it?' or when computing relative date ranges like 'last 7 days'.",
  inputSchema: undefined,
  execute: async () => {
    const now = new Date();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            iso: now.toISOString(),
            date: now.toISOString().slice(0, 10),
            time: now.toTimeString().slice(0, 8),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        },
      ],
    };
  },
};
