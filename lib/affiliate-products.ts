import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type ProductTone = "green" | "peach" | "pink" | "blue";

export type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  categoryTag: string | null;
  tags: string[];
  externalLink: string;
  imageUrl: string | null;
  sample: boolean;
  tone: ProductTone;
};

type SampleDefinition = {
  id: string;
  messageKey: string;
  categoryTag: string | null;
  tags: readonly string[];
  externalLink: string;
  tone: ProductTone;
};

const SAMPLE_PRODUCTS: readonly SampleDefinition[] = [
  {
    id: "sample-shofar",
    messageKey: "shofar",
    categoryTag: "tishrei",
    tags: ["tishrei", "elul"],
    externalLink: "https://example.com/kardom/shofar",
    tone: "green",
  },
  {
    id: "sample-sukkah-lights",
    messageKey: "sukkahLights",
    categoryTag: "tishrei",
    tags: ["tishrei"],
    externalLink: "https://example.com/kardom/sukkah-lights",
    tone: "peach",
  },
  {
    id: "sample-honey-set",
    messageKey: "honeySet",
    categoryTag: "tishrei",
    tags: ["tishrei"],
    externalLink: "https://example.com/kardom/honey-set",
    tone: "pink",
  },
  {
    id: "sample-kittel",
    messageKey: "kittel",
    categoryTag: "tishrei",
    tags: ["tishrei"],
    externalLink: "https://example.com/kardom/kittel",
    tone: "blue",
  },
  {
    id: "sample-swaddle",
    messageKey: "swaddle",
    categoryTag: "birth",
    tags: ["birth"],
    externalLink: "https://example.com/kardom/swaddle",
    tone: "pink",
  },
  {
    id: "sample-naming-print",
    messageKey: "namingPrint",
    categoryTag: "birth",
    tags: ["birth", "simchat-bat"],
    externalLink: "https://example.com/kardom/naming-print",
    tone: "blue",
  },
  {
    id: "sample-baby-kiddush",
    messageKey: "babyKiddush",
    categoryTag: "birth",
    tags: ["birth", "brit-milah"],
    externalLink: "https://example.com/kardom/baby-kiddush",
    tone: "green",
  },
  {
    id: "sample-photo-album",
    messageKey: "photoAlbum",
    categoryTag: "birth",
    tags: ["birth"],
    externalLink: "https://example.com/kardom/photo-album",
    tone: "peach",
  },
  {
    id: "sample-ketubah",
    messageKey: "ketubah",
    categoryTag: "wedding",
    tags: ["wedding"],
    externalLink: "https://example.com/kardom/ketubah",
    tone: "peach",
  },
  {
    id: "sample-menorah",
    messageKey: "menorah",
    categoryTag: "kislev",
    tags: ["kislev"],
    externalLink: "https://example.com/kardom/menorah",
    tone: "blue",
  },
  {
    id: "sample-haggadah",
    messageKey: "haggadah",
    categoryTag: "nisan",
    tags: ["nisan"],
    externalLink: "https://example.com/kardom/haggadah",
    tone: "green",
  },
  {
    id: "sample-candlesticks",
    messageKey: "candlesticks",
    categoryTag: null,
    tags: [],
    externalLink: "https://example.com/kardom/candlesticks",
    tone: "pink",
  },
];

export function sampleMessageKeys() {
  return SAMPLE_PRODUCTS.map((product) => product.messageKey);
}

export function normalizeTopicToken(value: string) {
  return value.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

export function productMatchesTopic(product: CatalogProduct, topicId: string) {
  const topic = normalizeTopicToken(topicId);
  if (!topic) {
    return false;
  }
  if (product.categoryTag && normalizeTopicToken(product.categoryTag) === topic) {
    return true;
  }
  return product.tags.some((tag) => normalizeTopicToken(tag) === topic);
}

export function recommendProducts(products: CatalogProduct[], topicId: string) {
  const matched = products.filter((product) => productMatchesTopic(product, topicId));
  return matched.length > 0 ? matched : products;
}

export function asExternalUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function buildSampleCatalog(
  translate: (messageKey: string, field: "title" | "description") => string,
): CatalogProduct[] {
  return SAMPLE_PRODUCTS.map((product) => ({
    id: product.id,
    title: translate(product.messageKey, "title"),
    description: translate(product.messageKey, "description"),
    categoryTag: product.categoryTag,
    tags: [...product.tags],
    externalLink: product.externalLink,
    imageUrl: null,
    sample: true,
    tone: product.tone,
  }));
}

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function tagList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
}

function rowToProduct(row: unknown): CatalogProduct | null {
  if (!row || typeof row !== "object") {
    return null;
  }
  const record = row as Record<string, unknown>;
  const title = textValue(record.title);
  const externalLink = asExternalUrl(record.external_link);
  const id = textValue(record.id);
  if (!title || !externalLink || !id) {
    return null;
  }

  return {
    id,
    title,
    description: textValue(record.description),
    categoryTag: textValue(record.category_tag) || null,
    tags: tagList(record.tags),
    externalLink,
    imageUrl: asExternalUrl(record.image_url),
    sample: false,
    tone: "blue",
  };
}

export async function loadAffiliateCatalog(): Promise<CatalogProduct[] | null> {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  try {
    const supabase = createClient(env.url, env.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(8000),
          }),
      },
    });

    const { data, error } = await supabase
      .from("affiliate_products")
      .select("id, title, description, category_tag, tags, external_link, image_url");

    if (error || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const products = data
      .map((row) => rowToProduct(row))
      .filter((product): product is CatalogProduct => product !== null);

    return products.length > 0 ? products : null;
  } catch {
    return null;
  }
}
