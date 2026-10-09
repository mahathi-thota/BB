import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {config} from '../config/index.js';
import {User,Item} from '../models/index.js';

const names=['Rahul','Ananya','Kiran','Nikhil','Meera','Arjun','Sneha','Siddu','Charan','Mohan','Pranav','Lavanya','Divya','Vikram','Harsha','Dev','Keerthi','Bhavana','Tej','Isha'];
const rows=[['Casio Scientific Calculator','Calculators',200,4.8],['Casio fx-82','Calculators',150,4.9],['Graphing Calculator TI-84','Calculators',500,4.6],['Basic Calculator','Calculators',100,2.7],['Lab Coat M','Lab Coats',100,4.7],['Engineering Mathematics book','Books',150,4.5],['Type-C Fast Charger','Chargers',100,4.9],['Laptop Charger Dell 65W','Chargers',400,3.2],['Laptop Charger HP 65W','Chargers',400,4.6],['Extension Board 4-socket','Appliances',100,4.6],['Iron Box','Appliances',200,3.1],['Electric Kettle','Appliances',300,4.7],['Hair Dryer','Appliances',250,4.8],['Soldering Iron Kit','Project Tools',300,4.4],['Wooden Plank 4 ft','Project Tools',150,4.3],['Cricket Bat','Sports',250,4.6],['Badminton Racket','Sports',200,4.9],['Storage Box','Others',100,4.5],['Sunglasses','Others',250,2.8],['Big Umbrella','Others',50,4.8]];

await mongoose.connect(config.mongoUri);
const passwordHash=await bcrypt.hash('Password@123',12);
const users=[];
for(let i=0;i<names.length;i++){
  const seedKey=`demo-student-${i+1}`;
  let user=await User.findOne({seedKey});
  if(!user){
    let candidate=100000000001n+BigInt(i);
    while(await User.exists({collegeId:String(candidate)}))candidate++;
    user=await User.create({seedKey,fullName:names[i],collegeId:String(candidate),passwordHash,ratingCount:10,ratingSum:rows[i][3]*10,trustScore:rows[i][3]});
  }
  users.push(user);
}
let added=0;
for(let i=0;i<rows.length;i++){
  const [name,category,deposit,trust]=rows[i];
  if(await Item.exists({owner:users[i]._id,name}))continue;
  await Item.create({owner:users[i]._id,name,category,deposit,condition:['Excellent','Good','Fair'][i%3],description:`${name} in good working order. Borrow it for your classes and return it on time.`,emoji:'📦',distanceKm:+(.1+Math.random()*.9).toFixed(1),availableFrom:new Date(),availableUntil:new Date(Date.now()+30*864e5)});
  added++;
}
console.log(`BorrowBuddy demo data ready: ${users.length} demo students and ${added} new listings. Existing records were preserved.`);
await mongoose.disconnect();
