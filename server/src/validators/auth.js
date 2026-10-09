import {z} from 'zod';

export const registrationSchema=z.object({
  fullName:z.string(),
  collegeId:z.string().regex(/^\d{12}(?:\d{2})?$/,'ID must be exactly 12 or 14 digits'),
  password:z.string().min(8,'Password must be at least 8 characters'),
  dateOfBirth:z.coerce.date(),
  gender:z.enum(['Female','Male','Non-binary','Prefer not to say']),
  college:z.string().trim().min(2).max(100),
  branch:z.string().trim().min(2).max(80),
  residenceType:z.enum(['hosteller','day_scholar']),
  hostelBlock:z.string().trim().max(50).optional().default(''),
  roomNumber:z.string().trim().max(20).optional().default('')
}).superRefine((value,ctx)=>{
  if(value.dateOfBirth>=new Date())ctx.addIssue({code:'custom',path:['dateOfBirth'],message:'Enter a valid date of birth in the past'});
  if(value.residenceType==='hosteller'&&!value.hostelBlock)ctx.addIssue({code:'custom',path:['hostelBlock'],message:'Hostel block is required for hostellers'});
  if(value.residenceType==='hosteller'&&!value.roomNumber)ctx.addIssue({code:'custom',path:['roomNumber'],message:'Room number is required for hostellers'});
});
