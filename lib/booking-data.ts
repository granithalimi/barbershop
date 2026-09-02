export interface Barber {
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

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceEur: number;
  popular?: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  period: "morning" | "afternoon" | "evening";
}
