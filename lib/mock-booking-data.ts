export interface MockBarber {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewsCount: number;
  avatarUrl?: string;
  initials: string;
  bio: string;
  serviceIds: string[];
}

export interface MockService {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceEur: number;
  popular?: boolean;
}

export interface TimeSlot {
  time: string; // e.g. "09:30"
  available: boolean;
  period: "morning" | "afternoon" | "evening";
}

export const MOCK_BARBERS: MockBarber[] = [
  {
    id: "barber-1",
    name: "Alex Rivera",
    role: "Master Barber",
    rating: 5.0,
    reviewsCount: 142,
    initials: "AR",
    bio: "Specializing in precision skin fades, modern tapers, and beard sculpting with hot towel treatments.",
    serviceIds: ["srv-1", "srv-2", "srv-3", "srv-4", "srv-5"],
  },
  {
    id: "barber-2",
    name: "Dardan Krasniqi",
    role: "Senior Hair Stylist",
    rating: 4.9,
    reviewsCount: 98,
    initials: "DK",
    bio: "Expert in scissor work, classic textured cuts, and modern pompadours.",
    serviceIds: ["srv-1", "srv-2", "srv-4"],
  },
  {
    id: "barber-3",
    name: "Marco Vance",
    role: "Grooming Specialist",
    rating: 4.8,
    reviewsCount: 86,
    initials: "MV",
    bio: "Traditional hot lather razor shaves, beard styling, and full gentleman grooming.",
    serviceIds: ["srv-2", "srv-3", "srv-5"],
  },
];

export const MOCK_SERVICES: MockService[] = [
  {
    id: "srv-1",
    name: "Signature Skin Fade & Haircut",
    description: "Custom fade tailored to your head shape, textured top, lineup, and premium styling product finish.",
    durationMinutes: 45,
    priceEur: 20,
    popular: true,
  },
  {
    id: "srv-2",
    name: "Classic Executive Haircut",
    description: "Traditional scissor and clipper cut with neck taper, hot lather neck shave, and wash.",
    durationMinutes: 30,
    priceEur: 15,
  },
  {
    id: "srv-3",
    name: "Beard Trim & Hot Towel Lineup",
    description: "Precision beard shaping, foil shaver blend, straight razor contouring, and hot herbal towel.",
    durationMinutes: 25,
    priceEur: 12,
    popular: true,
  },
  {
    id: "srv-4",
    name: "The Full Royal Package",
    description: "Skin fade or classic cut + full beard sculpt + hot towel massage + charcoal nose strip & shampoo wash.",
    durationMinutes: 70,
    priceEur: 32,
    popular: true,
  },
  {
    id: "srv-5",
    name: "Traditional Hot Lather Head Shave",
    description: "Straight razor head shave with pre-shave oils, steamed towel wrap, and soothing aftershave balm.",
    durationMinutes: 40,
    priceEur: 18,
  },
];

export function getMockSlotsForDate(dateStr: string): TimeSlot[] {
  // Deterministic seed from date string to simulate available/booked slots
  const hash = dateStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const baseTimes = [
    { time: "09:00", period: "morning" as const },
    { time: "09:45", period: "morning" as const },
    { time: "10:30", period: "morning" as const },
    { time: "11:15", period: "morning" as const },
    { time: "12:00", period: "morning" as const },
    { time: "13:30", period: "afternoon" as const },
    { time: "14:15", period: "afternoon" as const },
    { time: "15:00", period: "afternoon" as const },
    { time: "15:45", period: "afternoon" as const },
    { time: "16:30", period: "afternoon" as const },
    { time: "17:15", period: "evening" as const },
    { time: "18:00", period: "evening" as const },
    { time: "18:45", period: "evening" as const },
    { time: "19:30", period: "evening" as const },
  ];

  return baseTimes.map((slot, index) => {
    // Make 2-3 slots booked based on hash
    const isBooked = (hash + index * 7) % 5 === 0;
    return {
      time: slot.time,
      period: slot.period,
      available: !isBooked,
    };
  });
}
