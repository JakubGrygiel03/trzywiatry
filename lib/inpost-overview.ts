/** Capitals and large towns — enough to cover Poland without a 50-request burst. */
export const INPOST_OVERVIEW_CITIES: { city: string; lat: number; lng: number }[] = [
  { city: "Warszawa", lat: 52.2297, lng: 21.0122 },
  { city: "Kraków", lat: 50.0647, lng: 19.945 },
  { city: "Łódź", lat: 51.7592, lng: 19.456 },
  { city: "Wrocław", lat: 51.1079, lng: 17.0385 },
  { city: "Poznań", lat: 52.4064, lng: 16.9252 },
  { city: "Gdańsk", lat: 54.352, lng: 18.6466 },
  { city: "Szczecin", lat: 53.4285, lng: 14.5528 },
  { city: "Bydgoszcz", lat: 53.1235, lng: 18.0084 },
  { city: "Lublin", lat: 51.2465, lng: 22.5684 },
  { city: "Białystok", lat: 53.1325, lng: 23.1688 },
  { city: "Katowice", lat: 50.2649, lng: 19.0238 },
  { city: "Gdynia", lat: 54.5189, lng: 18.5305 },
  { city: "Częstochowa", lat: 50.8118, lng: 19.1203 },
  { city: "Toruń", lat: 53.0138, lng: 18.5984 },
  { city: "Kielce", lat: 50.8661, lng: 20.6286 },
  { city: "Rzeszów", lat: 50.0413, lng: 21.999 },
  { city: "Olsztyn", lat: 53.7784, lng: 20.4801 },
  { city: "Opole", lat: 50.6751, lng: 17.9213 },
  { city: "Zielona Góra", lat: 51.9356, lng: 15.5064 },
  { city: "Gorzów Wielkopolski", lat: 52.7368, lng: 15.2288 },
  { city: "Koszalin", lat: 54.1943, lng: 16.1722 },
  { city: "Słupsk", lat: 54.4641, lng: 17.0287 },
  { city: "Suwałki", lat: 54.1115, lng: 22.9309 },
  { city: "Nowy Sącz", lat: 49.6218, lng: 20.697 },
  { city: "Wałbrzych", lat: 50.7714, lng: 16.2843 },
  { city: "Radom", lat: 51.4027, lng: 21.1471 },
];

export type InpostOverviewCluster = {
  city: string;
  lat: number;
  lng: number;
  count: number;
};
