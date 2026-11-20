
export async function renderStore() {
    const app = document.querySelector("#app");

    app.innerHTML = `
        <header class="navbar">
            <h2>MR STORE</h2>
            <span>3D Shopping Experience</span>
        </header>

        <section class="container">

            <div class="hero">
                <h1>Explore Products</h1>
                <p>Discover products in Augmented Reality</p>
            </div>

            <div class="products-header">
                <h2>Our Products</h2>
                <div class="carousel-controls">
                    <button id="prevProducts" aria-label="Previous products">‹</button>
                    <button id="nextProducts" aria-label="Next products">›</button>
                </div>
            </div>

            <div id="products" class="product-carousel">
                Loading...
            </div>

        </section>
    `;

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("ไม่สามารถโหลดสินค้าได้");
        }

        const products = await response.json();

        const productContainer = document.querySelector("#products");

        productContainer.innerHTML = products.map(product => `
            <div class="product-card">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.src='https://placehold.co/400x300?text=Product'"
                >

                <div class="product-info">
                    <h3>${product.name}</h3>

                    <p>฿${Number(product.price).toLocaleString()}</p>

                    <button
                        onclick="navigate('/product/${product.id}')">
                        View Product
                    </button>
                </div>

            </div>
        `).join("");

        // ปุ่มเลื่อนสินค้า
        const prevButton = document.querySelector("#prevProducts");
        const nextButton = document.querySelector("#nextProducts");

        prevButton.addEventListener("click", () => {
            productContainer.scrollBy({
                left: -productContainer.clientWidth * 0.8,
                behavior: "smooth"
            });
        });

        nextButton.addEventListener("click", () => {
            productContainer.scrollBy({
                left: productContainer.clientWidth * 0.8,
                behavior: "smooth"
            });
        });

    } catch (error) {
        document.querySelector("#products").innerHTML =
            `<p>${error.message}</p>`;
    }
}
