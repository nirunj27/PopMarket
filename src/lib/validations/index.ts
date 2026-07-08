import { z } from 'zod';

const phoneRegex = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const emailSchema = z.string().email('Please enter a valid email address').max(255);
const phoneSchema = z
  .string()
  .regex(phoneRegex, 'Please enter a valid Indian mobile number')
  .or(z.literal(''))
  .optional();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: emailSchema,
    companyName: z.string().max(100).optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const eventSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Event title must be at least 3 characters')
      .max(120, 'Event title cannot exceed 120 characters'),
    description: z
      .preprocess((val) => (val === undefined || val === null ? '' : val), z.string().max(2000))
      .optional(),
    venueName: z
      .string()
      .min(2, 'Please enter a venue name (at least 2 characters)')
      .max(120, 'Venue name cannot exceed 120 characters'),
    venueAddress: z
      .string()
      .min(10, 'Please enter a complete street address (at least 10 characters)')
      .max(300, 'Address cannot exceed 300 characters'),
    city: z.string().min(1, 'Please select a city from the list'),
    eventDate: z.string().min(1, 'Please select an event date'),
    setupTime: z.preprocess(
      (val) => (val === undefined || val === null ? '' : val),
      z.string().optional(),
    ),
    startTime: z.string().min(1, 'Please select a market start time'),
    endTime: z.string().min(1, 'Please select a market end time'),
    stallRows: z.coerce
      .number({ error: 'Stall rows must be a number' })
      .int('Stall rows must be a whole number')
      .min(3, 'Minimum 3 rows required for the stall grid')
      .max(30, 'Maximum 30 rows allowed'),
    stallCols: z.coerce
      .number({ error: 'Stall columns must be a number' })
      .int('Stall columns must be a whole number')
      .min(3, 'Minimum 3 columns required for the stall grid')
      .max(30, 'Maximum 30 columns allowed'),
    visitorCapacity: z.coerce
      .number({ error: 'Visitor capacity must be a number' })
      .int('Visitor capacity must be a whole number')
      .min(50, 'Visitor capacity must be at least 50 guests')
      .max(50000, 'Visitor capacity cannot exceed 50,000 guests'),
    stallFee: z.coerce
      .number({ error: 'Stall fee must be a number' })
      .int('Stall fee must be a whole rupee amount — no decimals')
      .min(100, 'Stall fee must be at least ₹100')
      .max(1000000, 'Stall fee cannot exceed ₹10,00,000'),
    rsvpEntryFee: z.coerce
      .number({ error: 'RSVP entry fee must be a number' })
      .int('RSVP entry fee must be whole rupees')
      .min(0, 'RSVP entry fee cannot be negative')
      .max(5000, 'RSVP entry fee cannot exceed ₹5,000')
      .optional()
      .default(0),
    coverImageUrl: z.preprocess(
      (val) => (val === undefined || val === null ? '' : val),
      z.union([z.string().url('Invalid cover image URL'), z.literal('')]),
    ),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(`${data.eventDate}T00:00:00`);

    if (!Number.isNaN(eventDate.getTime()) && eventDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Event date cannot be in the past',
        path: ['eventDate'],
      });
    }

    if (data.startTime && data.endTime && data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endTime'],
      });
    }

    if (data.setupTime && data.startTime && data.setupTime >= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Vendor setup time must be before market start time',
        path: ['setupTime'],
      });
    }

    const totalStalls = data.stallRows * data.stallCols;
    if (totalStalls < 9) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Your stall grid must have at least 9 total bays',
        path: ['stallRows'],
      });
    }
  });

export const vendorApplicationSchema = z.object({
  businessName: z.string().min(2, 'Business name is required').max(120),
  ownerName: z.string().min(2, 'Owner name is required').max(100),
  email: emailSchema,
  phone: z.string().regex(phoneRegex, 'Please enter a valid Indian mobile number'),
  cuisineType: z.string().min(1, 'Please select a cuisine type'),
  menuDescription: z.string().max(1000).optional().or(z.literal('')),
  menuItems: z.string().optional().or(z.literal('')),
  vendorType: z.enum(['food_truck', 'food_stall'], {
    error: 'Please select truck or stall type',
  }),
  truckName: z.string().min(2, 'Truck/stall name is required').max(80),
  truckLengthFt: z
    .union([
      z.literal(''),
      z.coerce.number().min(8, 'Truck length must be at least 8 feet').max(40),
    ])
    .optional()
    .transform((val) => (val === '' || val === undefined ? undefined : val)),
  preferredStallId: z
    .string()
    .uuid('Invalid stall selection')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? undefined : val)),
  needsPower: z.boolean(),
  needsWater: z.boolean(),
  powerRequirements: z.string().max(200).optional().or(z.literal('')),
  instagramHandle: z
    .string()
    .max(50)
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || /^@?[\w.]+$/.test(val), 'Invalid Instagram handle'),
  acceptedTerms: z.boolean().refine((v) => v === true, {
    message: 'You must accept the terms and conditions to submit your application',
  }),
})
  .superRefine((data, ctx) => {
    let items: { name: string; price: number }[] = [];
    try {
      items = JSON.parse(data.menuItems || '[]');
    } catch {
      items = [];
    }
    const validItems = Array.isArray(items)
      ? items.filter(
          (item) =>
            item &&
            typeof item.name === 'string' &&
            item.name.trim() &&
            typeof item.price === 'number' &&
            item.price >= 0,
        )
      : [];
    const summary = data.menuDescription?.trim() ?? '';
    if (validItems.length === 0 && summary.length < 20) {
      ctx.addIssue({
        code: 'custom',
        message: 'Add menu items or write a menu description (at least 20 characters)',
        path: ['menuDescription'],
      });
    }
  });

export const rsvpSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: emailSchema,
  phone: phoneSchema,
  partySize: z.coerce.number().int().min(1, 'At least 1 guest').max(20),
});

export const applicationReviewSchema = z.object({
  status: z.enum(['approved', 'waitlisted', 'rejected']),
  rejectionReason: z.string().max(500).optional(),
});

export const stallAssignmentSchema = z.object({
  stallId: z.string().uuid('Invalid stall'),
  applicationId: z.string().uuid('Invalid application'),
});

export const stallLayoutCellSchema = z.object({
  row: z.number().int().min(0),
  col: z.number().int().min(0),
  zone: z.enum(['food_truck', 'food_stall', 'blocked', 'entrance', 'stage']),
  isPremium: z.boolean().optional(),
  premiumFee: z.preprocess(
    (val) => (val === undefined || val === null ? 0 : val),
    z.coerce.number().min(0).max(100000),
  ).optional(),
});

export const stallLayoutSchema = z.array(stallLayoutCellSchema).min(9);

export const vendorTermsSchema = z.object({
  vendorTerms: z
    .string()
    .min(100, 'Terms must be at least 100 characters')
    .max(20000, 'Terms cannot exceed 20,000 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type VendorApplicationInput = z.infer<typeof vendorApplicationSchema>;
export type RsvpInput = z.infer<typeof rsvpSchema>;
export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>;
