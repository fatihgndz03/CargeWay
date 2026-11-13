/**
 * Türkiye'de satılan / bilinen tam elektrikli (BEV) modeller.
 * Kaynak: önceki Bolt sürümündeki katalog. Fiyat, puan ve menzil değerleri
 * doğrulanmadığı için bilerek ALINMADI; yalnızca marka ve model adı var. Klasik hibritler (şarj edilemez) çıkarıldı.
 */
export interface Model {
  marka: string;
  ad: string;
}

export interface Marka {
  slug: string;
  ad: string;
}

export const MARKALAR: Marka[] = [
  { slug: "togg", ad: "Togg" },
  { slug: "tesla", ad: "Tesla" },
  { slug: "bmw", ad: "BMW" },
  { slug: "mercedes", ad: "Mercedes" },
  { slug: "hyundai", ad: "Hyundai" },
  { slug: "kia", ad: "Kia" },
  { slug: "byd", ad: "BYD" },
  { slug: "volkswagen", ad: "Volkswagen" },
  { slug: "audi", ad: "Audi" },
  { slug: "volvo", ad: "Volvo" },
  { slug: "peugeot", ad: "Peugeot" },
  { slug: "renault", ad: "Renault" },
  { slug: "ford", ad: "Ford" },
  { slug: "toyota", ad: "Toyota" },
  { slug: "honda", ad: "Honda" },
];

export const MODELLER: Model[] = [
  { marka: "togg", ad: "T10X V2 RWD" },
  { marka: "togg", ad: "T10X AWD" },
  { marka: "togg", ad: "T10F" },
  { marka: "tesla", ad: "Model Y Long Range" },
  { marka: "tesla", ad: "Model 3 Highland" },
  { marka: "tesla", ad: "Model S Plaid" },
  { marka: "bmw", ad: "iX xDrive50" },
  { marka: "bmw", ad: "i4 eDrive40" },
  { marka: "bmw", ad: "i5 eDrive40" },
  { marka: "mercedes", ad: "EQE 350+" },
  { marka: "mercedes", ad: "EQB 350 4MATIC" },
  { marka: "hyundai", ad: "Ioniq 5 Long Range" },
  { marka: "hyundai", ad: "Ioniq 6" },
  { marka: "hyundai", ad: "Kona Electric" },
  { marka: "kia", ad: "EV6 GT-Line" },
  { marka: "kia", ad: "EV9 Earth" },
  { marka: "byd", ad: "Atto 3" },
  { marka: "byd", ad: "Seal" },
  { marka: "byd", ad: "Dolphin" },
  { marka: "volkswagen", ad: "ID.4 Pro" },
  { marka: "volkswagen", ad: "ID.3 Pro S" },
  { marka: "audi", ad: "Q8 e-tron 55" },
  { marka: "audi", ad: "Q4 e-tron 40" },
  { marka: "volvo", ad: "EX30 Twin" },
  { marka: "volvo", ad: "EX90" },
  { marka: "peugeot", ad: "e-2008" },
  { marka: "peugeot", ad: "e-308" },
  { marka: "renault", ad: "Megane E-Tech" },
  { marka: "renault", ad: "Scenic E-Tech" },
  { marka: "ford", ad: "Mustang Mach-E" },
  { marka: "toyota", ad: "bZ4X" },
  { marka: "honda", ad: "e:Ny1" },
];
