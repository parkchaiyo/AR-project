
export async function renderProduct(id) {

    const app = document.querySelector("#app");

    app.innerHTML = `
        <header class="navbar">
            <h2 onclick="navigate('/')">MR STORE</h2>
            <span>Product Detail</span>
        </header>

        <section class="container" id="product-detail">
            Loading...
        </section>
    `;

    try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
            throw new Error("ไม่พบสินค้า");
        }

        const product = await response.json();

        document.querySelector("#product-detail").innerHTML = `

            <button class="back-button"
                onclick="navigate('/')">
                ← Back to Store
            </button>

            <div class="detail-card">

                <img class="detail-image"
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.src='https://placehold.co/600x400?text=Product'">

                <div class="detail-info">

                    <h1>${product.name}</h1>

                    <h2 class="price">
                        ฿${product.price.toLocaleString()}
                    </h2>

                    <p>${product.description}</p>

                    <p>Stock: ${product.stock}</p>

                    <label>Quantity</label>

                    <input
                        id="quantity"
                        type="number"
                        value="1"
                        min="1"
                        max="${product.stock}"
                    >

                    <button
                        class="buy-button"
                        onclick="buyProduct(${product.id})"
                        ${product.stock < 1 ? "disabled" : ""}>
                        Buy Now
                    </button>

                    <button
                        class="ar-button"
                        onclick="navigate('/ar/${product.id}')"
                        ${!product.model3D ? "disabled" : ""}>
                        View in AR
                    </button>

                </div>

            </div>
        `;

        window.buyProduct = async (productId) => {

            const quantity = Number(
                document.querySelector("#quantity").value
            );

            if (!Number.isInteger(quantity) || quantity < 1) {
                alert("กรุณาระบุจำนวนสินค้าให้ถูกต้อง");
                return;
            }

            const result = await fetch("/api/orders", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    productId,
                    quantity
                })
            });

            const data = await result.json();

            if (!result.ok) {
                alert(data.message);
                return;
            }

            alert(
                `สั่งซื้อสำเร็จ!\n${data.product}\n` +
                `จำนวน ${data.quantity}\n` +
                `รวม ฿${data.total}`
            );

            renderProduct(productId);
        };

    } catch (error) {

        document.querySelector("#product-detail").innerHTML =
            `<h2>${error.message}</h2>`;

    }
}
