// The 12 official showrooms. Names, addresses, operating hours and phone numbers are as listed on
// xpeng.co.id/en/find-us (October 2026). Opening days are not published there, so none are stated.
// Coordinates are geocoded from each official street address with OpenStreetMap Nominatim: street-level,
// inside the locality named in the address, not surveyed building positions.
// Listed in the find-us page's own order. `region` groups them for the homepage map: Greater Jakarta
// (Jabodetabek) covers the Jakarta and Tangerang showrooms; `area` keeps the finer split the order form uses.

export type Showroom = {
  id: string;
  name: string;
  area: string;
  region: "Jakarta" | "Batam" | "Bandung" | "Semarang" | "Surabaya";
  city: string;
  address: string;
  hours: string;
  phone: string;
  lat: number;
  lng: number;
};

export const showrooms: Showroom[] = [
  {
    id: "pondok-indah",
    name: "XPENG Pondok Indah",
    area: "Jakarta",
    region: "Jakarta",
    city: "Jakarta Selatan",
    address: "Jl. Sultan Iskandar Muda No.24, Kby. Lama Sel., Kec. Kebayoran Lama, Kota Jakarta Selatan, DKI Jakarta 12240",
    hours: "08.30–19.00",
    phone: "(021) 39703526",
    lat: -6.24668,
    lng: 106.78148,
  },
  {
    id: "idd-pik-2",
    name: "XPENG IDD PIK 2",
    area: "Tangerang",
    region: "Jakarta",
    city: "Kabupaten Tangerang",
    address: "Indonesia Design District (IDD), Jl. M.H. Thamrin, Salembaran, Kec. Kosambi, Kabupaten Tangerang, Banten",
    hours: "10.00–22.00",
    phone: "(021) 39737587",
    lat: -6.0488,
    lng: 106.70441,
  },
  {
    id: "pluit",
    name: "XPENG Pluit",
    area: "Jakarta",
    region: "Jakarta",
    city: "Jakarta Utara",
    address: "Jl. Pluit Indah No.19, RT.8/RW.6, Pluit, Kec. Penjaringan, Jakarta Utara, DKI Jakarta",
    hours: "08.30–19.00",
    phone: "(021) 150372",
    lat: -6.12108,
    lng: 106.78147,
  },
  {
    id: "alam-sutera",
    name: "XPENG Alam Sutera",
    area: "Tangerang",
    region: "Jakarta",
    city: "Tangerang Selatan",
    address: "Jl. Jalur Sutera Blok D2, Kav. 27, Alam Sutera, Tangerang Selatan",
    hours: "08.30–19.00",
    phone: "(021) 150372",
    lat: -6.23014,
    lng: 106.65872,
  },
  {
    id: "bsd-city",
    name: "XPENG BSD City",
    area: "Tangerang",
    region: "Jakarta",
    city: "Kabupaten Tangerang",
    address: "QBIG BSD City Lt. Dasar, Unit G.01a, Jl. BSD Raya Utama, Kel. Lengkong Kulon, Kec. Pagedangan, Kab. Tangerang",
    hours: "10.00–22.00",
    phone: "0811 1010 9000",
    lat: -6.28374,
    lng: 106.63622,
  },
  {
    id: "puri",
    name: "XPENG Puri",
    area: "Jakarta",
    region: "Jakarta",
    city: "Jakarta Barat",
    address: "Jl. Lkr. Luar Barat No.Kav. 86, Kembangan Utara, Kec. Kembangan, Kota Jakarta Barat, DKI Jakarta",
    hours: "08.30–19.00",
    phone: "(021) 38774888",
    lat: -6.17753,
    lng: 106.72871,
  },
  {
    id: "sunter",
    name: "XPENG Sunter",
    area: "Jakarta",
    region: "Jakarta",
    city: "Jakarta Utara",
    address: "Jl. Danau Sunter Barat Blok A3 No.42, Sunter Agung, Tanjung Priok, Jakarta Utara, DKI Jakarta 14350",
    hours: "09.00–21.00",
    phone: "(021) 38774888",
    lat: -6.13197,
    lng: 106.85533,
  },
  {
    id: "surabaya-hr-muhammad",
    name: "XPENG Surabaya HR Muhammad",
    area: "Surabaya",
    region: "Surabaya",
    city: "Surabaya",
    address: "Jl. Mayjen HR. Muhammad No.132, Pradahkalikendal, Kec. Dukuhpakis, Surabaya, Jawa Timur",
    hours: "08.30–19.00",
    phone: "(031) 135973372",
    lat: -7.28345,
    lng: 112.68986,
  },
  {
    id: "surabaya-kertajaya",
    name: "XPENG Surabaya Kertajaya",
    area: "Surabaya",
    region: "Surabaya",
    city: "Surabaya",
    address: "Jl. Raya Kertajaya Indah No.50-52, Manyar Sabrangan, Kec. Mulyorejo, Surabaya, Jawa Timur 60116",
    hours: "08.30–19.00",
    phone: "(031) 150372",
    lat: -7.28064,
    lng: 112.77642,
  },
  {
    id: "semarang",
    name: "XPENG Semarang",
    area: "Semarang",
    region: "Semarang",
    city: "Semarang",
    address: "Jl. Jenderal Sudirman No.308, Salamanmloyo, Kec. Semarang Barat, Kota Semarang, Jawa Tengah",
    hours: "08.00–16.00",
    phone: "0851 9080 9349",
    lat: -6.98294,
    lng: 110.39084,
  },
  {
    id: "batam",
    name: "XPENG Batam",
    area: "Batam",
    region: "Batam",
    city: "Batam",
    address: "Jl. Gajah Mada, Kel. Baloi, Kec. Lubuk Baja, Kota Batam, Kepulauan Riau 29432",
    hours: "09.00–16.00",
    phone: "0812 1317 1768 / 0812 1317 1736",
    lat: 1.12269,
    lng: 104.00855,
  },
  {
    id: "bandung",
    name: "XPENG Bandung",
    area: "Bandung",
    region: "Bandung",
    city: "Bandung",
    address: "Jl. Pajajaran No.117 & 119, Arjuna, Kec. Cicendo, Kota Bandung, Jawa Barat",
    hours: "08.00–20.00",
    phone: "0811 2222 0550",
    lat: -6.90655,
    lng: 107.59637,
  },
];

export const showroomAreas = Array.from(new Set(showrooms.map((s) => s.area)));

export const mapsUrl = (s: Showroom) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + " " + s.address)}`;

export const FIND_US_URL = "https://xpeng.co.id/en/find-us";

export const HOTLINE = "150372";
