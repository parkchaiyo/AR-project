
export async function renderAR(id) {

    const app = document.querySelector("#app");

    app.innerHTML = `
        <header class="navbar">
            <h2 onclick="navigate('/')">MR STORE</h2>
            <span>AR Experience</span>
        </header>

        <section class="container">

            <button class="back-button"
                onclick="navigate('/product/${id}')">
                ← Back to Product
            </button>

            <div id="ar-content">
                Loading 3D Model...
            </div>

        </section>
    `;

    try {

        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
            throw new Error("ไม่พบสินค้า");
        }

        const product = await response.json();

        if (!product.model3D) {
            throw new Error("สินค้านี้ไม่มีโมเดล 3D");
        }

        document.querySelector("#ar-content").innerHTML = `

            <div class="ar-header">
                <h2>${product.name}</h2>
                <p>View this product in your real environment</p>
            </div>

            <div class="ar-viewer">

                <model-viewer

                    src="${product.model3D}"

                    alt="${product.name}"

                    ar

                    ar-modes="scene-viewer webxr"

                    ar-placement="floor"

                    ar-scale="auto"

                    camera-controls

                    auto-rotate

                    shadow-intensity="1"

                    exposure="1"

                    environment-image="neutral"

                    style="width:100%; height:500px;">

                    <button
                        slot="ar-button"
                        class="start-ar-button">

                        <span>◎</span>
                        View in Your Space

                    </button>

                </model-viewer>

            </div>

            <div class="ar-instructions">

                <h3>How to use AR</h3>

                <p>
                    1. Press View in Your Space
                </p>

                <p>
                    2. Allow camera access if requested
                </p>

                <p>
                    3. Move your phone to scan the environment
                </p>

                <p>
                    4. Tap the screen to place the 3D model
                </p>

            </div>

        `;

    } catch (error) {

        document.querySelector("#ar-content").innerHTML =
            `<p>${error.message}</p>`;

    }
}
