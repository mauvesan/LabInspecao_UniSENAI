import { renderHome, renderModule, renderCases, renderReferences } from "./views.js"; import { updateNavigation } from "./navigation.js";
const routes={"/":renderHome,"/modulo/frenagem":()=>renderModule("frenagem"),"/casos":renderCases,"/referencias":renderReferences};
const path=()=>{const v=location.hash.replace(/^#/,"")||"/";return v.startsWith("/")?v:`/${v}`};
export const router={view:null,start(view){this.view=view;addEventListener("hashchange",()=>this.resolve());this.resolve()},async resolve(){const p=path();this.view.setAttribute("aria-busy","true");try{this.view.innerHTML=await (routes[p]||renderHome)();updateNavigation(p);this.view.focus({preventScroll:true});scrollTo({top:0,behavior:"instant"})}finally{this.view.removeAttribute("aria-busy")}}};
