@@ .. @@
 export const ChaletImagesSchema = z.object({
   images: z.array(ChaletImageSchema).min(1, { message: 'At least one image is required' }),
 });

 export type ChaletImagesData = z.infer<typeof ChaletImagesSchema>;

+// Voucher Schema
+export const VoucherSchema = z.object({
+  voucherNumber: z.string(),
+  bookingId: z.string(),
+  chaletName: z.string(),
+  guestName: z.string(),
+  guestEmail: z.string().email(),
+  hotelEmail: z.string().email(),
+  checkInTime: z.string(),
+  checkOutTime: z.string(),
+  checkInDate: z.string(),
+  checkOutDate: z.string(),
+  amenities: z.array(z.string()),
+  selfCateringNotice: z.string(),
+  cancellationPolicy: z.string(),
+  refundableFeesPolicy: z.string(),
+  totalCost: z.number(),
+});
+
+export type VoucherFormData = z.infer<typeof VoucherSchema>;
+
+// High Season Pricing Schema
+export const HighSeasonPricingSchema = z.object({
+  basePrice: z.number().min(0),
+  weekendPrice: z.number().min(0),
+  highSeasonEnabled: z.boolean(),
+  easterPrice: z.number().min(0).optional(),
+  christmasPrice: z.number().min(0).optional(),
+  minimumNightsEaster: z.number().min(1).optional(),
+  minimumNightsChristmas: z.number().min(1).optional(),
+  easterStartDate: z.date().optional(),
+  easterEndDate: z.date().optional(),
+  christmasStartDate: z.date().optional(),
+  christmasEndDate: z.date().optional(),
+});
+
+export type HighSeasonPricingData = z.infer<typeof HighSeasonPricingSchema>;
+
+// Room Blocking Schema
+export const RoomBlockingSchema = z.object({
+  dates: z.array(z.date()),
+  reason: z.enum(['maintenance', 'internal_use', 'other']),
+  description: z.string().min(1, 'Description is required'),
+});
+
+export type RoomBlockingData = z.infer<typeof RoomBlockingSchema>;