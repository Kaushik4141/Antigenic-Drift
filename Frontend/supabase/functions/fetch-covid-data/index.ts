import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CovidApiResponse {
  country: string;
  cases: {
    total: number;
    new: string;
  };
  deaths: {
    total: number;
    new: string;
  };
  tests: {
    total: number;
  };
  population: number;
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const country = url.searchParams.get("country");

    if (!country) {
      return new Response(
        JSON.stringify({ error: "Country parameter is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cachedData, error: cacheError } = await supabase
      .from("covid_data")
      .select("*")
      .eq("country_name", country)
      .maybeSingle();

    if (cachedData && !cacheError) {
      const cacheAge = Date.now() - new Date(cachedData.updated_at).getTime();
      const oneHour = 60 * 60 * 1000;

      if (cacheAge < oneHour) {
        return new Response(JSON.stringify(cachedData), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }
    }

    const apiNinjasKey = Deno.env.get("API_NINJAS_KEY");
    if (!apiNinjasKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const apiResponse = await fetch(
      `https://api.api-ninjas.com/v1/covid19?country=${encodeURIComponent(country)}`,
      {
        headers: {
          "X-Api-Key": apiNinjasKey,
        },
      }
    );

    if (!apiResponse.ok) {
      throw new Error(`API responded with status: ${apiResponse.status}`);
    }

    const apiData: CovidApiResponse[] = await apiResponse.json();

    if (!apiData || apiData.length === 0) {
      return new Response(
        JSON.stringify({ error: "No data found for this country" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const latestData = apiData[0];
    const totalCases = latestData.cases?.total || 0;
    const totalDeaths = latestData.deaths?.total || 0;
    const population = latestData.population || 0;

    const covidData = {
      country_name: country,
      country_code: null,
      total_cases: totalCases,
      total_deaths: totalDeaths,
      total_recovered: 0,
      active_cases: 0,
      new_cases: parseInt(latestData.cases?.new?.replace(/\+/g, "") || "0"),
      new_deaths: parseInt(latestData.deaths?.new?.replace(/\+/g, "") || "0"),
      critical_cases: 0,
      cases_per_million: population > 0 ? (totalCases / population) * 1000000 : 0,
      deaths_per_million: population > 0 ? (totalDeaths / population) * 1000000 : 0,
      total_tests: latestData.tests?.total || 0,
      tests_per_million: 0,
      population: population,
      updated_at: new Date().toISOString(),
    };

    const { data: upsertedData, error: upsertError } = await supabase
      .from("covid_data")
      .upsert(covidData, {
        onConflict: "country_name",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (upsertError) {
      console.error("Error upserting data:", upsertError);
      return new Response(JSON.stringify(covidData), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(JSON.stringify(upsertedData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
