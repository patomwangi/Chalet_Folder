export interface VoucherData {
  voucherNumber: string;
  bookingId: string;
  chaletName: string;
  guestName: string;
  guestEmail: string;
  hotelEmail: string;
  checkInTime: string;
  checkOutTime: string;
  checkInDate: string;
  checkOutDate: string;
  amenities: string[];
  selfCateringNotice: string;
  cancellationPolicy: string;
  refundableFeesPolicy: string;
  totalCost: number;
  createdAt: Date;
}

export interface VoucherGenerationRequest {
  bookingId: string;
  emailToGuest: boolean;
  emailToHotel: boolean;
  saveToSystem: boolean;
}

export interface PolicyData {
  cancellationPolicy: string;
  refundableFeesPolicy: string;
  checkInTime: string;
  checkOutTime: string;
}