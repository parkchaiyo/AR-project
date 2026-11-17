
import "./style.css";

import { renderStore } from "./pages/store.js";
import { renderProduct } from "./pages/product.js";
import { renderAR } from "./pages/ar.js";

async function router() {
    const path = window.location.pathname;

    if (path === "/") {
        await renderStore();
    }

    else if (path.startsWith("/product/")) {
        const id = path.split("/")[2];
        await renderProduct(id);
    }

    else if (path.startsWith("/ar/")) {
        const id = path.split("/")[2];
        await renderAR(id);
    }

    else {
        document.querySelector("#app").innerHTML =
            "<h2>ไม่พบหน้าที่ต้องการ</h2>";
    }
}

window.addEventListener("popstate", router);

window.navigate = (url) => {
    history.pushState({}, "", url);
    router();
};

router();
