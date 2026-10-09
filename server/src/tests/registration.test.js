import test from 'node:test';
import assert from 'node:assert/strict';
import {registrationSchema} from '../validators/auth.js';

const base={fullName:'Priya Sharma',collegeId:'123456789012',password:'Password@123',dateOfBirth:'2003-06-12',gender:'Female',college:'Example College',branch:'Computer Science',residenceType:'day_scholar'};
test('student registration accepts required profile details for a day scholar',()=>assert.equal(registrationSchema.safeParse(base).success,true));
test('hosteller registration requires both hostel block and room number',()=>{
  assert.equal(registrationSchema.safeParse({...base,residenceType:'hosteller'}).success,false);
  assert.equal(registrationSchema.safeParse({...base,residenceType:'hosteller',hostelBlock:'Block B',roomNumber:'204'}).success,true);
});
test('registration rejects malformed roll IDs and future dates of birth',()=>{
  assert.equal(registrationSchema.safeParse({...base,collegeId:'1234567890123'}).success,false);
  assert.equal(registrationSchema.safeParse({...base,dateOfBirth:'2999-01-01'}).success,false);
});
