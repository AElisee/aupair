"use client";

import { useEffect, useState } from "react";

export type CountryDTO = {
  name: string;
  flag: string;
  dialCode: string;
};

export function useCountries() {
  const [data, setData] = useState<{ origin: CountryDTO[]; host: CountryDTO[] }>({ origin: [], host: [] });

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json);
      });
  }, []);

  return data;
}
