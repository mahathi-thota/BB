import multer from 'multer'; import path from 'node:path'; import fs from 'node:fs';
const dir=path.resolve('uploads'); fs.mkdirSync(dir,{recursive:true});
// Swap this local adapter for Cloudinary without changing item controllers.
export const upload=multer({storage:multer.diskStorage({destination:dir,filename:(_req,file,cb)=>cb(null,`${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g,'_')}`)}),limits:{fileSize:5*1024*1024}});
