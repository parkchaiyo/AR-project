
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

            <h2>Our Products</h2>

            <div id="products" class="product-grid">
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

        document.querySelector("#products").innerHTML =
            products.map(product => `
                <div class="product-card">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        onerror="this.src='https://placehold.co/400x300?text=Product'"
                    >

                    <div class="product-info">

                        <h3>${product.name}</h3>

                        <p>฿${product.price.toLocaleString()}</p>

                        <button
                            onclick="navigate('/product/${product.id}')">
                            View Product
                        </button>

                    </div>

                </div>
            `).join("");

    } catch (error) {
        document.querySelector("#products").innerHTML =
            `<p>${error.message}</p>`;
    }
}
