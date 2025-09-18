export interface TrackingEvent {
  id: number;
  date: string;
  time: string;
  status: string;
  location: string;
  note?: string;
  isDelivered?: boolean;
}

export const trackingSummary: TrackingEvent[] = [
  {
    id: 10,
    date: "Aug 28, 2025",
    time: "9:42 AM",
    status: "Delivered",
    location: "NEW YORK, NY",
    note: "Package delivered. Signed for by: R. THOMPSON",
    isDelivered: true,
  },
  {
    id: 9,
    date: "Aug 28, 2025",
    time: "6:02 AM",
    status: "On FedEx vehicle for delivery",
    location: "NEW YORK, NY",
  },
  {
    id: 8,
    date: "Aug 28, 2025",
    time: "4:17 AM",
    status: "At local FedEx facility",
    location: "NEW YORK, NY",
  },
  {
    id: 7,
    date: "Aug 27, 2025",
    time: "11:33 PM",
    status: "Departed FedEx location",
    location: "NEWARK, NJ",
  },
  {
    id: 6,
    date: "Aug 27, 2025",
    time: "5:46 PM",
    status: "Arrived at FedEx location",
    location: "NEWARK, NJ",
  },
  {
    id: 5,
    date: "Aug 26, 2025",
    time: "10:15 PM",
    status: "Departed FedEx location",
    location: "RICHMOND, VA",
  },
  {
    id: 4,
    date: "Aug 26, 2025",
    time: "4:59 PM",
    status: "Arrived at FedEx location",
    location: "RICHMOND, VA",
  },
  {
    id: 3,
    date: "Aug 26, 2025",
    time: "4:59 PM",
    status: "Arrived at FedEx location",
    location: "RICHMOND, VA",
  },
  {
    id: 2,
    date: "Aug 25, 2025",
    time: "9:38 PM",
    status: "Departed FedEx location",
    location: "COLUMBIA, SC",
  },
  {
    id: 1,
    date: "Aug 25, 2025",
    time: "2:21 PM",
    status: "Picked up",
    location: "COLUMBIA, SC",
  },
  {
    id: 0,
    date: "Aug 24, 2025",
    time: "8:09 PM",
    status: "Shipment information sent to FedEx",
    location: "COLUMBIA, SC",
  },
];
