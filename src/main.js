import "./styles/tokens.css"; import "./styles/base.css"; import "./styles/layout.css"; import "./styles/components.css"; import "./styles/print.css";
import { config } from "./config.js"; import { router } from "./app/router.js"; import { session } from "./app/session.js";
import { appHeader } from "./components/app-header.js"; import { toastHost } from "./components/toast.js";
session.initialize();
document.querySelector("#app").innerHTML = `${appHeader()}<main id="route-view" class="route-view" tabindex="-1"></main>${toastHost()}<footer class="app-footer"><span>${config.appName} · ${config.appVersion}</span><strong>@Prof. Me. Mauro Alves</strong></footer>`;
router.start(document.querySelector("#route-view"));
