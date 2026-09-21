export type ShiftType = 'morning' | 'afternoon' | 'night';

const getShiftFromHour = (hour: number): ShiftType => {
    if (hour >= 7 && hour < 13) return 'morning';
    if (hour >= 13 && hour < 19) return 'afternoon';
    return 'night';
};

export const shiftFilterService = {
    getShiftFromHour,
};
