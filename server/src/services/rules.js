export const blocks=['Uni Block','Autonomous Block']; export const floors=[1,2,3,4];
export function normalizeName(name){return name.trim().replace(/\s+/g,' ')}
export function validName(name){return /^[\p{L} .'-]{2,40}$/u.test(normalizeName(name))}
export function depositRefund(deposit){return deposit}
export function transition(status,next){const allowed={PENDING:['ACCEPTED','DECLINED','CANCELLED'],ACCEPTED:['ACTIVE','CANCELLED'],ACTIVE:['RETURN_REQUESTED','OVERDUE'],RETURN_REQUESTED:['RETURNED'],OVERDUE:['RETURN_REQUESTED','RETURNED']};if(!allowed[status]?.includes(next)){const e=new Error(`Cannot move borrowing from ${status} to ${next}`);e.status=409;throw e;}return next}
export function trustScore({ratingSum=0,ratingCount=0,successfulReturns=0,lateReturns=0}={}){const avg=(ratingSum+12)/(ratingCount+3);const total=successfulReturns+lateReturns;if(total===0&&ratingCount===0)return 4;const onTime=total?successfulReturns/total:1;return Math.round((.6*avg+.3*(5*onTime)+.1*(5*Math.min(total/10,1)))*10)/10}
