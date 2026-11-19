
import {
    Engine,
    Scene,
    Vector3,
    Color3,
    Quaternion,
    HemisphericLight,
    FreeCamera,
    MeshBuilder,
    StandardMaterial,
    TransformNode
} from "@babylonjs/core";

import { ImportMeshAsync } from "@babylonjs/core/Loading/sceneLoader";
import { WebXRHitTest } from "@babylonjs/core/XR/features/WebXRHitTest";
import "@babylonjs/loaders/glTF";
import { WebXRDomOverlay } from "@babylonjs/core/XR/features/WebXRDOMOverlay";

export async function renderAR(id) {

    const app = document.querySelector("#app");

    app.innerHTML = `
        <header class="navbar">
            <h2 onclick="navigate('/')">MR STORE</h2>
            <span>Babylon AR</span>
        </header>

        <section class="container">

            <button class="back-button"
                onclick="navigate('/product/${id}')">
                ← Back to Product
            </button>

            <div id="ar-status">
                กำลังโหลดข้อมูลสินค้า...
            </div>

            <div style="width:100%; height:65vh; min-height:350px;">
                <canvas id="babylon-canvas"
                    style="width:100%; height:100%; display:block;">
                </canvas>
            </div>
            <div id="xr-overlay"
            style="
                position:fixed;
                inset:0;
                z-index:1000;
                pointer-events:none;
            ">

            <div id="rotate-controls"
                style="
                    display:none;
                    position:absolute;
                    bottom:40px;
                    left:0;
                    right:0;
                    justify-content:center;
                    gap:25px;
                    pointer-events:auto;
                ">

                <button id="rotate-left"
                    style="
                        width:65px;
                        height:55px;
                        border-radius:15px;
                        font-size:25px;
                    ">
                    ↶
                </button>

                <button id="rotate-right"
                    style="
                        width:65px;
                        height:55px;
                        border-radius:15px;
                        font-size:25px;
                    ">
                    ↷
                </button>

            </div>
        </div>

            <p>
                กด Enter AR เพื่อเปิดกล้อง
                จากนั้นเล็งพื้นผิวและแตะเพื่อวางสินค้า
            </p>

        </section>
    `;

    const status = document.querySelector("#ar-status");
    const canvas = document.querySelector("#babylon-canvas");

    let engine;
    let scene;
    let reticle;
    let modelRoot;
    let hasHit = false;
    let modelGroundOffset = 0;

    try {

        // 1. ดึงข้อมูลสินค้าจาก Backend
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
            throw new Error("ไม่พบสินค้า");
        }

        const product = await response.json();

        if (!product.model3D) {
            throw new Error("สินค้านี้ไม่มีโมเดล 3D");
        }

        // รองรับทั้ง URL แบบ relative และ absolute
        const modelUrl = new URL(
            product.model3D,
            window.location.href
        ).href;

        status.textContent =
            `กำลังเตรียมโมเดล ${product.name}...`;

        // 2. สร้าง Babylon Scene
        engine = new Engine(canvas, true);

        scene = new Scene(engine);

        const camera = new FreeCamera(
            "camera",
            new Vector3(0, 1, -2),
            scene
        );

        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);

        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        light.intensity = 1;

        // 3. สร้างวงแหวนแสดงตำแหน่งพื้นผิว
        reticle = MeshBuilder.CreateTorus(
            "reticle",
            {
                diameter: 0.15,
                thickness: 0.008,
                tessellation: 32
            },
            scene
        );

        reticle.isVisible = false;
        reticle.rotationQuaternion = Quaternion.Identity();

        const reticleMaterial = new StandardMaterial(
            "reticleMaterial",
            scene
        );

        reticleMaterial.emissiveColor =
            new Color3(0, 1, 0);

        reticle.material = reticleMaterial;

        
// 4. โหลดโมเดล GLB ของสินค้า
        const result = await ImportMeshAsync(modelUrl, scene);

        if (!result.meshes || result.meshes.length === 0) {
            throw new Error("ไม่พบ Mesh ในโมเดล 3D");
        }

        // สร้าง Parent สำหรับควบคุมตำแหน่ง
        modelRoot = new TransformNode("productRoot", scene);

        // เชื่อม Root ของโมเดลเข้ากับ Parent
        result.meshes[0].parent = modelRoot;

        // คำนวณขอบเขตโมเดล
        modelRoot.computeWorldMatrix(true);

        const modelMeshes = result.meshes.filter(
            mesh => mesh.getTotalVertices() > 0
        );

        if (modelMeshes.length === 0) {
            throw new Error("โมเดลไม่มีข้อมูล Mesh");
        }

        let min = new Vector3(Infinity, Infinity, Infinity);
        let max = new Vector3(-Infinity, -Infinity, -Infinity);

        for (const mesh of modelMeshes) {

            mesh.computeWorldMatrix(true);

            const bounds = mesh.getBoundingInfo().boundingBox;

            min = Vector3.Minimize(min, bounds.minimumWorld);
            max = Vector3.Maximize(max, bounds.maximumWorld);

        }

        // คำนวณขนาดโมเดล
        const dimensions = max.subtract(min);

        const maxDimension = Math.max(
            dimensions.x,
            dimensions.y,
            dimensions.z
        );

        if (!Number.isFinite(maxDimension) || maxDimension <= 0) {
            throw new Error("ไม่สามารถคำนวณขนาดโมเดลได้");
        }

        // กำหนดขนาดสูงสุดเริ่มต้น 50 เซนติเมตร
        const targetSize = 0.5;

        const scaleFactor = targetSize / maxDimension;

        modelRoot.scaling.setAll(scaleFactor);

        // คำนวณตำแหน่งฐานหลังปรับขนาด
        modelRoot.computeWorldMatrix(true);

        min = new Vector3(Infinity, Infinity, Infinity);

        for (const mesh of modelMeshes) {

            mesh.computeWorldMatrix(true);

            const bounds = mesh.getBoundingInfo().boundingBox;

            min = Vector3.Minimize(min, bounds.minimumWorld);

        }

        modelGroundOffset = -min.y;

        // ซ่อนโมเดลไว้จนกว่าจะวางใน AR
        modelRoot.setEnabled(false);

        console.log("Model dimensions:", dimensions);
        console.log("Model scale:", scaleFactor);
        console.log("Ground offset:", modelGroundOffset);


        // 5. เปิดระบบ WebXR AR
        const xr = await scene.createDefaultXRExperienceAsync({

            uiOptions: {
                sessionMode: "immersive-ar",
                referenceSpaceType: "local-floor"
            },

            optionalFeatures: ["hit-test"]

        });

        const domOverlay =
            xr.baseExperience.featuresManager.enableFeature(
                WebXRDomOverlay,
                "latest",
                {
                    element: "#xr-overlay"
                },
                undefined,
                false
            );

        const hitTest =
            xr.baseExperience.featuresManager.enableFeature(
                WebXRHitTest,
                "latest"
            );

        // 6. ตรวจจับตำแหน่งพื้นผิว
        hitTest.onHitTestResultObservable.add((results) => {

            if (results.length > 0) {

                hasHit = true;

                reticle.isVisible = true;

                results[0].transformationMatrix.decompose(
                    reticle.scaling,
                    reticle.rotationQuaternion,
                    reticle.position
                );

            } else {

                hasHit = false;
                reticle.isVisible = false;

            }

        });

        // 7. แตะหน้าจอเพื่อวางโมเดลสินค้า
        xr.baseExperience.sessionManager.onXRSessionInit.add(
            (session) => {

                const controls =
                    document.querySelector("#rotate-controls");

                const rotateLeft =
                    document.querySelector("#rotate-left");

                const rotateRight =
                    document.querySelector("#rotate-right");

                // แสดงปุ่มเมื่อ DOM Overlay ใช้งานได้
                if (session.domOverlayState) {
                    controls.style.display = "flex";
                } else {
                    status.textContent =
                        "อุปกรณ์ไม่รองรับปุ่มควบคุมบนหน้าจอ AR";
                }

                // ป้องกันการกดปุ่มแล้วกลายเป็นคำสั่ง Select ของ WebXR
                controls.addEventListener("beforexrselect", (event) => {
                    event.preventDefault();
                });

                // ฟังก์ชันหมุนโมเดล
                function rotateModel(angle) {

                    if (!modelRoot.isEnabled()) {
                        status.textContent = "กรุณาวางสินค้าก่อนหมุน";
                        return;
                    }

                    const turn = Quaternion.RotationAxis(
                     Vector3.Up(),
                        angle
                    );

                    modelRoot.rotationQuaternion =
                        turn.multiply(modelRoot.rotationQuaternion);

                    status.textContent = "หมุนโมเดลเรียบร้อย";
                }

                // หมุนซ้าย 15 องศา
                rotateLeft.addEventListener("click", () => {
                    rotateModel(-Math.PI / 12);
                });

                // หมุนขวา 15 องศา
                rotateRight.addEventListener("click", () => {
                    rotateModel(Math.PI / 12);
                });

                // ซ่อนปุ่มเมื่อออกจาก AR
                session.addEventListener("end", () => {
                    controls.style.display = "none";
                });

                session.addEventListener("select", () => {

                    if (!hasHit) {
                        status.textContent =
                            "ยังไม่พบพื้นผิว กรุณาสแกนอีกครั้ง";
                        return;
                    }

                    modelRoot.position.copyFrom(
                        reticle.position
                    );

                    modelRoot.position.y += modelGroundOffset;

                    modelRoot.rotationQuaternion =
                        reticle.rotationQuaternion.clone();

                    modelRoot.setEnabled(true);

                    status.textContent =
                        `วาง ${product.name} สำเร็จ!`;

                });

            }
        );

        xr.baseExperience.onStateChangedObservable.add(
            (state) => {

                if (state === 3) {
                    status.textContent =
                        "กำลังใช้งาน AR - สแกนพื้นผิว";
                }

            }
        );

        engine.runRenderLoop(() => {
            scene.render();
        });

        window.addEventListener("resize", () => {
            engine.resize();
        });

        status.textContent =
            `พร้อมใช้งาน: ${product.name}`;

    } catch (error) {

        console.error("Babylon AR Error:", error);

        status.textContent =
            "เกิดข้อผิดพลาด: " + error.message;

    }
}
