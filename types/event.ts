export type EventStatus = "draft" | "published" | "cancelled";

export type ApiEvent = {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  eventDate: string; // ISO
  endDate: string | null; // ISO or null
  startTime: string;
  endTime: string;
  locationName: string;
  address: string;
  city: string;
  country: string;
  googleMapsLink: string;
  image: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  capacity: number | null;
  price: number | null;
  currency: string;
  category: string;
  tags: string[];
  isOnline: boolean;
  onlineLink: string;
  isFeatured: boolean;
  status: EventStatus;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiEventsListResponse =
  | ApiEvent[]
  | {
      items: ApiEvent[];
      total?: number;
      page?: number;
      limit?: number;
    };

export type ApiEventsCalendarResponse = Record<string, number>;

