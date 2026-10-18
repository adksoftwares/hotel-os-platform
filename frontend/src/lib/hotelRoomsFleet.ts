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
  { id: '101', roomNumber: '101', type: 'Deluxe King', floor: 1, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'David Miller', reservation: 'RES-4401', pricePerNight: 180 },
  { id: '102', roomNumber: '102', type: 'Deluxe King', floor: 1, occupancy: 'Vacant', housekeeping: 'Dirty', operational: 'In Service', reservation: 'None', pricePerNight: 180 },
  { id: '103', roomNumber: '103', type: 'Twin Executive', floor: 1, occupancy: 'Vacant', housekeeping: 'Inspected', operational: 'In Service', reservation: 'None', pricePerNight: 160 },
  { id: '104', roomNumber: '104', type: 'Twin Executive', floor: 1, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Elena Rostova', reservation: 'RES-4405', pricePerNight: 160 },
  { id: '201', roomNumber: '201', type: 'Executive Suite', floor: 2, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Sarah Jenkins (VIP)', reservation: 'RES-4410', pricePerNight: 280 },
  { id: '202', roomNumber: '202', type: 'Executive Suite', floor: 2, occupancy: 'Vacant', housekeeping: 'Cleaning', operational: 'In Service', reservation: 'None', pricePerNight: 280 },
  { id: '203', roomNumber: '203', type: 'Deluxe King', floor: 2, occupancy: 'Vacant', housekeeping: 'Clean', operational: 'In Service', reservation: 'None', pricePerNight: 180 },
  { id: '204', roomNumber: '204', type: 'Deluxe King', floor: 2, occupancy: 'Occupied', housekeeping: 'Dirty', operational: 'In Service', currentGuest: 'Carlos Gomez', reservation: 'RES-4412', pricePerNight: 180 },
  { id: '301', roomNumber: '301', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Vacant', housekeeping: 'Inspected', operational: 'In Service', reservation: 'None', pricePerNight: 350 },
  { id: '302', roomNumber: '302', type: 'Ocean Panorama Suite', floor: 3, occupancy: 'Occupied', housekeeping: 'Clean', operational: 'In Service', currentGuest: 'Michael Chang', reservation: 'RES-4418', pricePerNight: 350 },
  { id: '303', roomNumber: '303', type: 'Family Studio', floor: 3, occupancy: 'Vacant', housekeeping: 'Dirty', operational: 'Out of Order', reservation: 'None', pricePerNight: 220 },
  { id: '401', roomNumber: '401', type: 'Presidential Penthouse', floor: 4, occupancy: 'Occupied', housekeeping: 'Inspected', operational: 'In Service', currentGuest: 'Ambassador Al-Mansoor', reservation: 'RES-4420', pricePerNight: 750 },
];

export const loadHotelRoomsFleet = (): RoomItem[] => {
  if (typeof window === 'undefined') return SAMPLE_ROOMS_FLEET;
  try {
    const saved = localStorage.getItem('hotel_room_board_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Seed default if empty
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
