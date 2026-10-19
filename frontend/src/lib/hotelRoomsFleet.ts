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

export const SAMPLE_ROOMS_FLEET: RoomItem[] = [
  { id: '101', roomNumber: '101', type: 'Deluxe King', floor: 1, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 180 },
  { id: '102', roomNumber: '102', type: 'Deluxe King', floor: 1, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 180 },
  { id: '103', roomNumber: '103', type: 'Twin Executive', floor: 1, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 160 },
  { id: '104', roomNumber: '104', type: 'Twin Executive', floor: 1, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 160 },
  { id: '201', roomNumber: '201', type: 'Executive Suite', floor: 2, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 280 },
  { id: '202', roomNumber: '202', type: 'Executive Suite', floor: 2, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 280 },
  { id: '203', roomNumber: '203', type: 'Deluxe King', floor: 2, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 180 },
  { id: '204', roomNumber: '204', type: 'Deluxe King', floor: 2, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 180 },
  { id: '301', roomNumber: '301', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 350 },
  { id: '302', roomNumber: '302', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 350 },
  { id: '303', roomNumber: '303', type: 'Family Studio', floor: 3, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 220 },
  { id: '401', roomNumber: '401', type: 'Presidential Penthouse', floor: 4, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', pricePerNight: 750 },
];

export const loadHotelRoomsFleet = (): RoomItem[] => {
  if (typeof window === 'undefined') return SAMPLE_ROOMS_FLEET;
  try {
    const saved = localStorage.getItem('hotel_room_board_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out fake demo guests if present
        const fakeGuests = ['David Miller', 'Elena Rostova', 'Sarah Jenkins (VIP)', 'Carlos Gomez', 'Michael Chang', 'Ambassador Al-Mansoor'];
        const cleaned = parsed.map((r: RoomItem) => {
          if (r.currentGuest && fakeGuests.includes(r.currentGuest)) {
            return {
              ...r,
              occupancy: 'Vacant' as const,
              housekeeping: 'Clean' as const,
              operational: 'In Service' as const,
              currentGuest: undefined,
              reservation: 'None',
            };
          }
          return r;
        });
        localStorage.setItem('hotel_room_board_state', JSON.stringify(cleaned));
        return cleaned;
      }
    }
    // Seed clean fleet if empty
    localStorage.setItem('hotel_room_board_state', JSON.stringify(SAMPLE_ROOMS_FLEET));
  } catch (_) {}
  return SAMPLE_ROOMS_FLEET;
};

export const saveHotelRoomsFleet = (data: RoomItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('hotel_room_board_state', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('hotel_rooms_changed'));
  } catch (_) {}
};
