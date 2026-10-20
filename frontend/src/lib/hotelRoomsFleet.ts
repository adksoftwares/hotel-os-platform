export interface RoomItem {
  id: string;
  roomNumber: string;
  type: string;
  floor: number;
  occupancy: 'Vacant' | 'Occupied' | 'Reserved';
  housekeeping: 'Clean' | 'Dirty' | 'Cleaning' | 'Inspected';
  operational: 'In Service' | 'Out of Order';
  currentGuest?: string;
  reservation?: string;
  pricePerNight: number;
}

export const SAMPLE_ROOMS_FLEET: RoomItem[] = [];

const FAKE_SAMPLE_IDS = new Set(['101', '102', '103', '104', '201', '202', '203', '204', '301', '302', '303', '401']);

export const loadHotelRoomsFleet = (): RoomItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('hotel_room_board_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Strip out fake sample seeded rooms if present
        const cleaned = parsed.filter((r: RoomItem) => !FAKE_SAMPLE_IDS.has(String(r.id)) && !FAKE_SAMPLE_IDS.has(String(r.roomNumber)));
        if (cleaned.length !== parsed.length) {
          localStorage.setItem('hotel_room_board_state', JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
    localStorage.setItem('hotel_room_board_state', JSON.stringify([]));
  } catch (_) {}
  return [];
};

export const saveHotelRoomsFleet = (data: RoomItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hotel_room_board_state', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('hotel_rooms_changed'));
  } catch (_) {}
};
