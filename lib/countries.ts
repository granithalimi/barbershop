export interface CountryOption {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { name: "North Macedonia", code: "MK", flag: "🇲🇰", dialCode: "+389" },
  { name: "Kosovo", code: "XK", flag: "🇽🇰", dialCode: "+383" },
  { name: "Albania", code: "AL", flag: "🇦🇱", dialCode: "+355" },
  { name: "Greece", code: "GR", flag: "🇬🇷", dialCode: "+30" },
  { name: "Serbia", code: "RS", flag: "🇷🇸", dialCode: "+381" },
  { name: "Bulgaria", code: "BG", flag: "🇧🇬", dialCode: "+359" },
  { name: "Turkey", code: "TR", flag: "🇹🇷", dialCode: "+90" },
  { name: "Bosnia & Herzegovina", code: "BA", flag: "🇧🇦", dialCode: "+387" },
  { name: "Croatia", code: "HR", flag: "🇭🇷", dialCode: "+385" },
  { name: "Slovenia", code: "SI", flag: "🇸🇮", dialCode: "+386" },
  { name: "Hungary", code: "HU", flag: "🇭🇺", dialCode: "+36" },
  { name: "Austria", code: "AT", flag: "🇦🇹", dialCode: "+43" },
  { name: "Italy", code: "IT", flag: "🇮🇹", dialCode: "+39" },
  { name: "Germany", code: "DE", flag: "🇩🇪", dialCode: "+49" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", dialCode: "+41" },
  { name: "France", code: "FR", flag: "🇫🇷", dialCode: "+33" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", dialCode: "+32" },
  { name: "Luxembourg", code: "LU", flag: "🇱🇺", dialCode: "+352" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", dialCode: "+31" },
  { name: "Spain", code: "ES", flag: "🇪🇸", dialCode: "+34" },
  { name: "Portugal", code: "PT", flag: "🇵🇹", dialCode: "+351" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { name: "Sweden", code: "SE", flag: "🇸🇪", dialCode: "+46" },
  { name: "Norway", code: "NO", flag: "🇳🇴", dialCode: "+47" },
];
