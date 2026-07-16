export const imbalance=(a,b)=>Math.max(a,b)>0?Math.abs(a-b)/Math.max(a,b)*100:0;
export function calculateBrakeMetrics({mass,fl,fr,rl,rr}){const total=fl+fr+rl+rr,weight=mass*9.81/1000;return{efficiency:weight?total/weight*100:0,frontImbalance:imbalance(fl,fr),rearImbalance:imbalance(rl,rr)}}
