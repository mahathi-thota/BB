import dotenv from 'dotenv';
import {fileURLToPath} from 'node:url';
dotenv.config({path:fileURLToPath(new URL('../../../.env',import.meta.url))});
export const config={port:Number(process.env.PORT)||5000,mongoUri:process.env.MONGO_URI||'mongodb://127.0.0.1:27017/borrowbuddy',jwtSecret:process.env.JWT_SECRET||'development-secret-change-me',clientUrl:process.env.CLIENT_URL||'http://localhost:5173',maxBorrowDays:Number(process.env.MAX_BORROW_DAYS)||7};
