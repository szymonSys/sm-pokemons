export async function getPokemons({
  limit = 10,
  offset = 0,
  nextUrl,
}: GetPokemonsRequestParams = {}) {
  if (nextUrl) {
    const url = new URL(nextUrl);
    limit = Number(url.searchParams.get("limit")) || limit;
    offset = Number(url.searchParams.get("offset")) || offset;
  }
  return makeRequest<GetPokemonsResponse>("pokemon", {
    params: { limit, offset },
  });
}

export async function getPokemonsWithDetails(
  params: GetPokemonsRequestParams = {}
) {
  const pokemonsResponse = await getPokemons(params);
  if (pokemonsResponse.data) {
    const detailedPokemons = await Promise.all(
      pokemonsResponse.data.results.map(async (pokemon) => {
        const detailsResponse = await getPokemonDetailsById(pokemon.name);
        if (!detailsResponse.data) return null;
        return {
          ...pokemon,
          details: detailsResponse.data,
        };
      })
    );
    return {
      next: pokemonsResponse.data.next,
      data: detailedPokemons.filter(
        (item) => item !== null
      ) as PokemonWithDetails[],
    };
  }
  return { data: [], next: null };
}

export async function getPokemonDetailsById(id: string) {
  return await makeRequest<PokemonDetailsResponse>("pokemon", { path: id });
}

export type GetPokemonsRequestParams = {
  limit?: number;
  offset?: number;
  nextUrl?: string;
};

export type PokemonResourceItem = {
  name: string;
  url: string;
};

export type GetPokemonsResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonResourceItem[];
};

export type PokemonWithDetails = {
  name: string;
  url: string;
  details: PokemonDetailsResponse;
};

export type PokemonDetailsResponse = {
  name: string;
  sprites: {
    front_default: string | null;
  };
  abilities: {
    ability: {
      name: string;
      url: string;
    };
  }[];
  base_experience: number;
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  types: { type: { name: string; url: string } }[];
  weight: number;
};

type AnyObject = Record<string, any>;
export type RequestOptions = {
  method?: "GET";
  path?: string | string[];
  params?: Record<string, string | number>;
};

async function makeRequest<T extends AnyObject | AnyObject[]>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data?: T; error?: string }> {
  try {
    const parsedPath = Array.isArray(options.path)
      ? options.path.join("/")
      : options.path || "";
    const url = new URL(
      `${BASE_URL}/${endpoint}${parsedPath && "/" + parsedPath}`
    );
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString());
      });
    }
    const response = await fetch(url.toString(), {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API request error:", error);
    return { error: (error as Error).message };
  }
}

const BASE_URL = "https://pokeapi.co/api/v2";
