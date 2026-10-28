/* ========================================
   LIQUID GLASS — INTERACTIVE EXPERIENCE
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    ).matches;

    /* =====================================
       1. SCROLL PROGRESS
       ===================================== */

    const progressBar = $("#scrollProgress");

    let scrollTicking = false;

    function updateScroll() {
        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = scrollableHeight > 0
            ? (window.scrollY / scrollableHeight) * 100
            : 0;

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        const navbar = $(".navbar");

        if (navbar) {
            navbar.classList.toggle("scrolled", window.scrollY > 30);
        }

        scrollTicking = false;
    }

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateScroll);
            scrollTicking = true;
        }
    }, { passive: true });

    updateScroll();


  /* =====================================
   2. SCROLL REVEAL — INFINITE REPLAY
   Animasi berjalan saat scroll ke bawah
   maupun scroll ke atas.
   ===================================== */

const revealElements = $$(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(element => {
        element.classList.add("is-visible");
    });
} else {
    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                const element = entry.target;

                if (entry.isIntersecting) {
                    // Elemen masuk layar: jalankan animasi.
                    element.classList.add("is-visible");
                } else {
                    // Elemen keluar layar: reset animasi.
                    // Saat masuk lagi, animasi berjalan kembali.
                    element.classList.remove("is-visible");
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        }
    );

    revealElements.forEach((element, index) => {
        const parent = element.parentElement;

        if (parent && parent.classList.contains("feature-grid")) {
            element.style.setProperty(
                "--reveal-delay",
                `${(index % 3) * 100}ms`
            );
        }

        revealObserver.observe(element);
    });
}

    /* =====================================
       3. GOOGLE SEARCH
       ===================================== */

    const searchForm = $("#searchForm");
    const searchInput = $("#searchInput");
    const suggestionButtons = $$("[data-query]");

    if (searchInput) {
        suggestionButtons.forEach(button => {
            button.addEventListener("click", () => {
                searchInput.value = button.dataset.query || "";
                searchInput.focus();
            });
        });
    }

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", event => {
            const query = searchInput.value.trim();

            if (!query) {
                event.preventDefault();
                searchInput.focus();
                showToast("Masukkan kata yang ingin kamu cari.");
            }
        });
    }


    /* =====================================
       4. MOBILE NAVIGATION
       ===================================== */

    const menuButton = $("#menuButton");
    const navLinks = $("#navLinks");

    function closeMenu() {
        if (!menuButton || !navLinks) return;

        menuButton.classList.remove("open");
        navLinks.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
    }

    if (menuButton && navLinks) {
        menuButton.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuButton.classList.toggle("open", isOpen);
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });

        $$(".nav-link", navLinks).forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", event => {
            if (
                !menuButton.contains(event.target) &&
                !navLinks.contains(event.target)
            ) {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 720) {
                closeMenu();
            }
        });
    }


    /* =====================================
       5. ACTIVE NAVIGATION
       ===================================== */

    const sections = $$("main section[id]");
    const navigationLinks = $$(".nav-link");

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    navigationLinks.forEach(link => {
                        const isActive =
                            link.getAttribute("href") ===
                            `#${entry.target.id}`;

                        link.classList.toggle("active", isActive);
                    });
                });
            },
            {
                rootMargin: "-35% 0px -55% 0px",
                threshold: 0
            }
        );

        sections.forEach(section => sectionObserver.observe(section));
    }


    /* =====================================
       6. PARALLAX SCROLL EFFECT
       ===================================== */

    const parallaxElements = [
        $(".hero-visual"),
        $(".glass-sphere"),
        $(".orbit-one"),
        $(".orbit-two")
    ].filter(Boolean);

    if (!reducedMotion) {
        parallaxElements.forEach((element, index) => {
            element.classList.add("parallax-element");

            element.dataset.parallaxSpeed = [
                "0.045",
                "-0.065",
                "0.025",
                "-0.035"
            ][index];
        });

        let parallaxTicking = false;

        function updateParallax() {
            if (canHover) {
                parallaxElements.forEach(element => {
                    const speed = Number(element.dataset.parallaxSpeed);
                    const rect = element.getBoundingClientRect();

                    const elementCenter = rect.top + rect.height / 2;
                    const viewportCenter = window.innerHeight / 2;

                    const distance = elementCenter - viewportCenter;
                    const offset = Math.max(
                        -35,
                        Math.min(35, -distance * speed)
                    );

                    element.style.setProperty(
                        "--parallax-y",
                        `${offset}px`
                    );
                });
            }

            parallaxTicking = false;
        }

        window.addEventListener("scroll", () => {
            if (!parallaxTicking) {
                requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        }, { passive: true });

        updateParallax();
    }


    /* =====================================
       7. MOUSE LIGHT EFFECT
       ===================================== */

    const lightCards = $$(".feature-card, .experience-panel");

    lightCards.forEach(card => {
        card.classList.add("pointer-light");
    });

    if (canHover && !reducedMotion) {
        lightCards.forEach(card => {
            card.addEventListener("pointermove", event => {
                const rect = card.getBoundingClientRect();

                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                card.style.setProperty("--mouse-x", `${x}px`);
                card.style.setProperty("--mouse-y", `${y}px`);
            });
        });
    }


    /* =====================================
       8. 3D GLASS SPHERE
       ===================================== */

    const heroVisual = $("#heroVisual");
    const glassSphere = $("#glassSphere");

    if (heroVisual && glassSphere && canHover && !reducedMotion) {
        let targetRotateX = 0;
        let targetRotateY = 0;
        let currentRotateX = 0;
        let currentRotateY = 0;
        let animationFrame = null;
        let pointerInside = false;

        function animateSphere() {
            const ease = 0.075;

            currentRotateX += (targetRotateX - currentRotateX) * ease;
            currentRotateY += (targetRotateY - currentRotateY) * ease;

            glassSphere.style.setProperty(
                "--sphere-rotate-x",
                `${currentRotateX}deg`
            );

            glassSphere.style.setProperty(
                "--sphere-rotate-y",
                `${currentRotateY}deg`
            );

            glassSphere.style.transform =
                `perspective(900px) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`;

            if (
                pointerInside ||
                Math.abs(currentRotateX) > 0.1 ||
                Math.abs(currentRotateY) > 0.1
            ) {
                animationFrame = requestAnimationFrame(animateSphere);
            } else {
                glassSphere.style.transform = "";
                animationFrame = null;
            }
        }

        heroVisual.addEventListener("pointermove", event => {
            const rect = heroVisual.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width;
            const y = (event.clientY - rect.top) / rect.height;

            targetRotateY = (x - 0.5) * 24;
            targetRotateX = (0.5 - y) * 20;

            pointerInside = true;

            if (!animationFrame) {
                animationFrame = requestAnimationFrame(animateSphere);
            }
        });

        heroVisual.addEventListener("pointerleave", () => {
            targetRotateX = 0;
            targetRotateY = 0;
            pointerInside = false;

            if (!animationFrame) {
                animationFrame = requestAnimationFrame(animateSphere);
            }
        });
    }


    /* =====================================
       9. MAGIC BUTTON
       ===================================== */

    const magicButton = $("#magicButton");

    if (magicButton) {
        magicButton.addEventListener("click", () => {
            document.body.classList.toggle("magic-active");

            const isActive =
                document.body.classList.contains("magic-active");

            magicButton.innerHTML = isActive
                ? 'Deactivate magic <span>✧</span>'
                : 'Activate the magic <span>✦</span>';

            showToast(
                isActive
                    ? "Liquid magic activated ✨"
                    : "Kembali ke tampilan normal."
            );
        });
    }


    /* =====================================
       10. TOAST NOTIFICATION
       ===================================== */

    let toastTimeout;

    function showToast(message) {
        const toast = $("#toast");
        const toastMessage = $("#toastMessage");

        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimeout);

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
    }


    /* =====================================
       11. BUTTON RIPPLE
       ===================================== */

    $$(".button-primary, .search-button").forEach(button => {
        button.addEventListener("click", event => {
            if (reducedMotion) return;

            const rect = button.getBoundingClientRect();

            const ripple = document.createElement("span");

            ripple.className = "button-ripple";

            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;

            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 650);
        });
    });


    /* =====================================
       12. SMOOTH ANCHOR NAVIGATION
       ===================================== */

    $$('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = $(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: reducedMotion ? "auto" : "smooth",
                block: "start"
            });
        });
    });


    /* =====================================
       13. INITIALIZE
       ===================================== */

    document.body.classList.add("page-ready");

    console.log(
        "%c LIQUID GLASS ",
        "background: linear-gradient(90deg,#9281ff,#73caff); color:#fff; padding:8px 14px; border-radius:8px; font-weight:bold;"
    );

    console.log("Website berhasil dimuat.");
});
/* =========================================
   14. DARK / LIGHT MODE — LIQUID GLASS WAVE
========================================= */

(() => {
    const toggle = document.getElementById("themeToggle");
    const icon = document.getElementById("themeIcon");
    const label = document.getElementById("themeLabel");
    const root = document.documentElement;

    if (!toggle || !icon || !label) return;

    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem("pael-theme") || "dark";
    } catch (error) {}

    function applyTheme(theme) {
        const light = theme === "light";

        root.classList.toggle("light-mode", light);

        icon.textContent = light ? "☾" : "☀";
        label.textContent = light ? "Dark" : "Light";

        toggle.setAttribute(
            "aria-label",
            light ? "Aktifkan dark mode" : "Aktifkan light mode"
        );

        const meta = document.querySelector(
            'meta[name="theme-color"]'
        );

        if (meta) {
            meta.content = light ? "#edf1fa" : "#080b18";
        }

        try {
            localStorage.setItem("pael-theme", theme);
        } catch (error) {}
    }

    applyTheme(savedTheme);

    let changing = false;

    toggle.addEventListener("click", () => {
        if (changing) return;

        changing = true;

        const nextTheme = root.classList.contains("light-mode")
            ? "dark"
            : "light";

        const rect = toggle.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const maxDistance = Math.max(
            Math.hypot(x, y),
            Math.hypot(innerWidth - x, y),
            Math.hypot(x, innerHeight - y),
            Math.hypot(innerWidth - x, innerHeight - y)
        );

        const wave = document.createElement("div");

        wave.className = "theme-wave";

        wave.style.setProperty("--wave-x", `${x}px`);
        wave.style.setProperty("--wave-y", `${y}px`);

        // Lingkaran awal berdiameter 80px.
        wave.style.setProperty(
            "--wave-scale",
            (maxDistance * 2.15) / 80
        );

        wave.style.setProperty(
            "--wave-tint",
            nextTheme === "light"
                ? "rgba(190, 210, 255, 0.28)"
                : "rgba(100, 125, 220, 0.28)"
        );

        document.body.appendChild(wave);

        toggle.classList.remove("wave-start");
        void toggle.offsetWidth;
        toggle.classList.add("wave-start");

        // Ubah tema saat gelombang mulai menutupi layar.
        const switchTimer = setTimeout(() => {
            applyTheme(nextTheme);
        }, 550);

        // Bersihkan setelah animasi selesai.
        const cleanupTimer = setTimeout(() => {
            wave.remove();
            toggle.classList.remove("wave-start");
            changing = false;
        }, 1250);

        wave.addEventListener("animationcancel", () => {
            clearTimeout(switchTimer);
            clearTimeout(cleanupTimer);

            wave.remove();
            toggle.classList.remove("wave-start");

            changing = false;
        }, { once: true });
    });
})();


/* =========================================
   15. QUICK SEARCH
   Ketik dari mana saja tanpa klik input.
========================================= */

(() => {
    const input = document.getElementById("searchInput");
    const form = document.getElementById("searchForm");

    if (!input || !form) return;

    let highlightTimer;

    function highlightSearch() {
        form.classList.add("quick-search-active");

        clearTimeout(highlightTimer);

        highlightTimer = setTimeout(() => {
            form.classList.remove("quick-search-active");
        }, 700);
    }

    input.addEventListener("focus", highlightSearch);

    document.addEventListener("keydown", event => {
        if (
            event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
        ) {
            return;
        }

        const target = event.target;

        if (!(target instanceof HTMLElement)) return;

        if (
            target.isContentEditable ||
            target.matches(
                "textarea, select, button, a, [role='button']"
            ) ||
            (target.matches("input") && target !== input)
        ) {
            return;
        }

        // Tekan "/" untuk langsung membuka pencarian.
        if (event.key === "/" && target !== input) {
            event.preventDefault();
            input.focus();
            highlightSearch();
            return;
        }

        // Jangan mengambil alih tombol khusus.
        if (event.key.length !== 1 || target === input) {
            return;
        }

        event.preventDefault();

        input.focus();

        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;

        input.setRangeText(event.key, start, end, "end");

        highlightSearch();
    });

    document.querySelectorAll("[data-query]").forEach(button => {
        button.addEventListener("click", () => {
            input.value = button.dataset.query || "";
            input.focus();
            highlightSearch();
        });
    });
})();


/* =========================================
   16. MAGIC MODE — ON / OFF
========================================= */

(() => {
    const button = document.getElementById("magicButton");
    const panel = document.querySelector(".experience-panel");

    if (!button) return;

    let active = document.body.classList.contains("magic-active");
    let animationTimer;

    function showMagicToast(message) {
        const toast = document.getElementById("toast");
        const messageElement = document.getElementById("toastMessage");

        if (!toast || !messageElement) return;

        messageElement.textContent = message;
        toast.classList.add("show");

        clearTimeout(toast._magicTimer);

        toast._magicTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    function updateMagic() {
        document.body.classList.toggle("magic-active", active);

        button.classList.toggle("magic-button-active", active);

        button.setAttribute("aria-pressed", String(active));

        button.innerHTML = active
            ? 'Deactivate the magic <span>✦</span>'
            : 'Activate the magic <span>✦</span>';

        if (panel) {
            panel.classList.remove("magic-transition");

            void panel.offsetWidth;

            panel.classList.add("magic-transition");

            clearTimeout(animationTimer);

            animationTimer = setTimeout(() => {
                panel.classList.remove("magic-transition");
            }, 700);
        }

        showMagicToast(
            active
                ? "✨ Liquid Magic activated!"
                : "Magic deactivated."
        );
    }

    button.addEventListener("click", () => {
        active = !active;
        updateMagic();
    });

    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("magic-button-active", active);
})();

/* =========================================
   2. QUICK SEARCH
   Ketik tanpa mengeklik kolom pencarian
========================================= */

(() => {
    const searchInput = document.getElementById("searchInput");
    const searchBox = document.getElementById("searchForm");

    if (!searchInput || !searchBox) return;

    let highlightTimer;

    function highlightSearch() {
        searchBox.classList.add("quick-search-active");

        clearTimeout(highlightTimer);

        highlightTimer = setTimeout(() => {
            searchBox.classList.remove("quick-search-active");
        }, 700);
    }

    // Saat kolom pencarian diklik atau difokuskan
    searchInput.addEventListener("focus", highlightSearch);

    // Tangkap ketikan saat pengguna tidak sedang mengetik di elemen lain
    document.addEventListener("keydown", (event) => {
        if (event.defaultPrevented) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;

        const target = event.target;

        // Jangan mengganggu input atau kontrol interaktif lain
        if (
            target instanceof HTMLElement &&
            (
                target.isContentEditable ||
                target.matches(
                    "textarea, select, button, a, [role='button']"
                ) ||
                (
                    target.matches("input") &&
                    target !== searchInput
                )
            )
        ) {
            return;
        }

        // Esc mengosongkan pencarian ketika kolom sedang aktif
        if (event.key === "Escape" && target === searchInput) {
            searchInput.value = "";
            highlightSearch();
            return;
        }

        // Lewati tombol khusus seperti Shift, Ctrl, Tab, dan panah
        if (
            event.key.length !== 1 ||
            event.key === " " && !searchInput.value
        ) {
            if (event.key === "/" && target !== searchInput) {
                event.preventDefault();
                searchInput.focus();
                highlightSearch();
            }

            return;
        }

        // Jangan mengambil alih ketikan saat pengguna memilih teks
        // atau sedang berada di kolom pencarian.
        if (target === searchInput) return;

        event.preventDefault();

        searchInput.focus();

        // Masukkan karakter yang baru diketik
        const start = searchInput.selectionStart ?? searchInput.value.length;
        const end = searchInput.selectionEnd ?? searchInput.value.length;

        searchInput.setRangeText(event.key, start, end, "end");

        highlightSearch();
    });

    // Tombol saran pencarian tetap dapat dipakai
    document.querySelectorAll("[data-query]").forEach((button) => {
        button.addEventListener("click", () => {
            searchInput.value = button.dataset.query || "";
            searchInput.focus();
            highlightSearch();
        });
    });
})();


/* =========================================
   3. MAGIC MODE — ANIMASI ON / OFF
========================================= */

(() => {
    const magicButton = document.getElementById("magicButton");
    const experiencePanel = document.querySelector(".experience-panel");
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!magicButton) return;

    let magicEnabled = document.body.classList.contains("magic-active");
    let toastTimer;
    let animationTimer;

    function showMagicToast(message) {
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.classList.add("show", "toast-visible");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show", "toast-visible");
        }, 2200);
    }

    function updateMagicState() {
        document.body.classList.toggle("magic-active", magicEnabled);

        magicButton.classList.toggle(
            "magic-button-active",
            magicEnabled
        );

        magicButton.setAttribute(
            "aria-pressed",
            String(magicEnabled)
        );

        magicButton.innerHTML = magicEnabled
            ? 'Deactivate the magic <span>✦</span>'
            : 'Activate the magic <span>✦</span>';

        if (experiencePanel) {
            experiencePanel.classList.remove("magic-transition");

            // Memulai ulang animasi transisi
            void experiencePanel.offsetWidth;

            experiencePanel.classList.add("magic-transition");

            clearTimeout(animationTimer);

            animationTimer = setTimeout(() => {
                experiencePanel.classList.remove("magic-transition");
            }, 700);
        }

        showMagicToast(
            magicEnabled
                ? "✨ Magic activated!"
                : "Magic deactivated."
        );
    }

    // Satu klik untuk menyalakan atau mematikan Magic
    magicButton.addEventListener("click", () => {
        magicEnabled = !magicEnabled;
        updateMagicState();
    });

    // Sinkronkan tampilan awal
    magicButton.setAttribute("aria-pressed", String(magicEnabled));
    magicButton.classList.toggle("magic-button-active", magicEnabled);
})();
/* =========================================
   14. DARK / LIGHT MODE — LIQUID GLASS WAVE
========================================= */

(() => {
    const toggle = document.getElementById("themeToggle");
    const icon = document.getElementById("themeIcon");
    const label = document.getElementById("themeLabel");
    const root = document.documentElement;

    if (!toggle || !icon || !label) return;

    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem("pael-theme") || "dark";
    } catch (error) {}

    function applyTheme(theme) {
        const light = theme === "light";

        root.classList.toggle("light-mode", light);

        icon.textContent = light ? "☾" : "☀";
        label.textContent = light ? "Dark" : "Light";

        toggle.setAttribute(
            "aria-label",
            light ? "Aktifkan dark mode" : "Aktifkan light mode"
        );

        const meta = document.querySelector(
            'meta[name="theme-color"]'
        );

        if (meta) {
            meta.content = light ? "#edf1fa" : "#080b18";
        }

        try {
            localStorage.setItem("pael-theme", theme);
        } catch (error) {}
    }

    applyTheme(savedTheme);

    let changing = false;

    toggle.addEventListener("click", () => {
        if (changing) return;

        changing = true;

        const nextTheme = root.classList.contains("light-mode")
            ? "dark"
            : "light";

        const rect = toggle.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const maxDistance = Math.max(
            Math.hypot(x, y),
            Math.hypot(innerWidth - x, y),
            Math.hypot(x, innerHeight - y),
            Math.hypot(innerWidth - x, innerHeight - y)
        );

        const wave = document.createElement("div");

        wave.className = "theme-wave";

        wave.style.setProperty("--wave-x", `${x}px`);
        wave.style.setProperty("--wave-y", `${y}px`);

        // Lingkaran awal berdiameter 80px.
        wave.style.setProperty(
            "--wave-scale",
            (maxDistance * 2.15) / 80
        );

        wave.style.setProperty(
            "--wave-tint",
            nextTheme === "light"
                ? "rgba(190, 210, 255, 0.28)"
                : "rgba(100, 125, 220, 0.28)"
        );

        document.body.appendChild(wave);

        toggle.classList.remove("wave-start");
        void toggle.offsetWidth;
        toggle.classList.add("wave-start");

        // Ubah tema saat gelombang mulai menutupi layar.
        const switchTimer = setTimeout(() => {
            applyTheme(nextTheme);
        }, 550);

        // Bersihkan setelah animasi selesai.
        const cleanupTimer = setTimeout(() => {
            wave.remove();
            toggle.classList.remove("wave-start");
            changing = false;
        }, 1250);

        wave.addEventListener("animationcancel", () => {
            clearTimeout(switchTimer);
            clearTimeout(cleanupTimer);

            wave.remove();
            toggle.classList.remove("wave-start");

            changing = false;
        }, { once: true });
    });
})();


/* =========================================
   15. QUICK SEARCH
   Ketik dari mana saja tanpa klik input.
========================================= */

(() => {
    const input = document.getElementById("searchInput");
    const form = document.getElementById("searchForm");

    if (!input || !form) return;

    let highlightTimer;

    function highlightSearch() {
        form.classList.add("quick-search-active");

        clearTimeout(highlightTimer);

        highlightTimer = setTimeout(() => {
            form.classList.remove("quick-search-active");
        }, 700);
    }

    input.addEventListener("focus", highlightSearch);

    document.addEventListener("keydown", event => {
        if (
            event.defaultPrevented ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
        ) {
            return;
        }

        const target = event.target;

        if (!(target instanceof HTMLElement)) return;

        if (
            target.isContentEditable ||
            target.matches(
                "textarea, select, button, a, [role='button']"
            ) ||
            (target.matches("input") && target !== input)
        ) {
            return;
        }

        // Tekan "/" untuk langsung membuka pencarian.
        if (event.key === "/" && target !== input) {
            event.preventDefault();
            input.focus();
            highlightSearch();
            return;
        }

        // Jangan mengambil alih tombol khusus.
        if (event.key.length !== 1 || target === input) {
            return;
        }

        event.preventDefault();

        input.focus();

        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;

        input.setRangeText(event.key, start, end, "end");

        highlightSearch();
    });

    document.querySelectorAll("[data-query]").forEach(button => {
        button.addEventListener("click", () => {
            input.value = button.dataset.query || "";
            input.focus();
            highlightSearch();
        });
    });
})();


/* =========================================
   16. MAGIC MODE — ON / OFF
========================================= */

(() => {
    const button = document.getElementById("magicButton");
    const panel = document.querySelector(".experience-panel");

    if (!button) return;

    let active = document.body.classList.contains("magic-active");
    let animationTimer;

    function showMagicToast(message) {
        const toast = document.getElementById("toast");
        const messageElement = document.getElementById("toastMessage");

        if (!toast || !messageElement) return;

        messageElement.textContent = message;
        toast.classList.add("show");

        clearTimeout(toast._magicTimer);

        toast._magicTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    function updateMagic() {
        document.body.classList.toggle("magic-active", active);

        button.classList.toggle("magic-button-active", active);

        button.setAttribute("aria-pressed", String(active));

        button.innerHTML = active
            ? 'Deactivate the magic <span>✦</span>'
            : 'Activate the magic <span>✦</span>';

        if (panel) {
            panel.classList.remove("magic-transition");

            void panel.offsetWidth;

            panel.classList.add("magic-transition");

            clearTimeout(animationTimer);

            animationTimer = setTimeout(() => {
                panel.classList.remove("magic-transition");
            }, 700);
        }

        showMagicToast(
            active
                ? "✨ Liquid Magic activated!"
                : "Magic deactivated."
        );
    }

    button.addEventListener("click", () => {
        active = !active;
        updateMagic();
    });

    button.setAttribute("aria-pressed", String(active));
    button.classList.toggle("magic-button-active", active);
})();