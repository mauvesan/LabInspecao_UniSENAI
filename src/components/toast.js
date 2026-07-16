export const toastHost=()=>`<div id="toast-host" class="toast" role="status" aria-live="polite"></div>`;
export function showToast(m){const h=document.querySelector("#toast-host");if(!h)return;h.textContent=m;h.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>h.classList.remove("show"),2800)}
