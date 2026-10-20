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

export const loadHotelRoomsFleet = (): RoomItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('hotel_room_board_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (_) {}
  return [];
};

export const saveHotelRoomsFleet = (data: RoomItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hotel_room_board_state', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('hotel_rooms_changed', { detail: data }));
    window.dispatchEvent(new Event('hotel_rooms_changed'));
  } catch (_) {}
};
