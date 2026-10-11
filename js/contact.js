/* =========================================
   HEADER — HIDE / REVEAL ON SCROLL
========================================= */

const header = document.querySelector(".site-header");

let lastScrollY = window.scrollY;
let ticking = false;


function updateHeader() {

    const currentScrollY = window.scrollY;

    if (!header) return;


    if (currentScrollY <= 10) {

        header.classList.remove("is-hidden");
        header.classList.remove("is-scrolled");

    } else {

        header.classList.add("is-scrolled");


        if (
            currentScrollY > lastScrollY &&
            currentScrollY > 100
        ) {

            header.classList.add("is-hidden");

        } else if (currentScrollY < lastScrollY) {

            header.classList.remove("is-hidden");

        }

    }


    lastScrollY = currentScrollY;
    ticking = false;
}


window.addEventListener(
    "scroll",
    () => {

        if (!ticking) {

            window.requestAnimationFrame(updateHeader);

            ticking = true;

        }

    },
    { passive: true }
);



/* =========================================
   PROJECT TYPE — MULTI SELECT
========================================= */

const projectSelect = document.querySelector("#projectSelect");

const projectTrigger = projectSelect?.querySelector(
    ".multi-select-trigger"
);

const projectValue = projectSelect?.querySelector(
    ".multi-select-value"
);

const projectOptions = projectSelect?.querySelectorAll(
    'input[name="project"]'
);


if (
    projectSelect &&
    projectTrigger &&
    projectValue &&
    projectOptions
) {

    projectTrigger.addEventListener("click", () => {

        const isOpen =
            projectSelect.classList.contains("is-open");


        projectSelect.classList.toggle(
            "is-open",
            !isOpen
        );

        projectTrigger.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

    });


    projectOptions.forEach((option) => {

        option.addEventListener("change", () => {

            const selected = Array.from(
                projectOptions
            )
                .filter((option) => option.checked)
                .map((option) => option.value);


            if (selected.length === 0) {

                projectValue.textContent =
                    "Pick one or more";

                projectSelect.classList.remove(
                    "has-selection"
                );

            } else if (selected.length === 1) {

                projectValue.textContent =
                    selected[0];

                projectSelect.classList.add(
                    "has-selection"
                );

            } else {

                projectValue.textContent =
                    `${selected.length} selected`;

                projectSelect.classList.add(
                    "has-selection"
                );

            }

        });

    });


    /*
     * Close the dropdown when clicking outside it.
     */

    document.addEventListener("click", (event) => {

        if (!projectSelect.contains(event.target)) {

            projectSelect.classList.remove(
                "is-open"
            );

            projectTrigger.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });

}


/* =========================================
   CONTACT MODE — ENQUIRY / MEETING
========================================= */

const contactModeButtons = document.querySelectorAll(".contact-mode-button");
const enquiryPanel = document.querySelector("#enquiryPanel");
const meetingPanel = document.querySelector("#meetingPanel");

let calInitialized = false;
let calLoading = false;


function initializeCalBooking() {

    if (calInitialized || calLoading) {
        return;
    }

    calLoading = true;


    /*
     * This is Cal.com's official embed loader pattern.
     * We create the Cal function first, then load
     * Cal.com's embed script.
     */

    const C = window;
    const A = "https://app.cal.com/embed/embed.js";
    const L = "init";


    C.Cal = C.Cal || function () {

        let cal = C.Cal;
        let args = arguments;

        if (!cal.loaded) {

            cal.ns = {};
            cal.q = cal.q || [];

            const script = document.createElement("script");

            script.src = A;

            document.head.appendChild(script);

            cal.loaded = true;
        }


        if (args[0] === L) {

            const api = function () {
                api.q.push(arguments);
            };

            const namespace = args[1];

            api.q = api.q || [];


            if (typeof namespace === "string") {

                cal.ns[namespace] =
                    cal.ns[namespace] || api;

                cal.ns[namespace].q =
                    cal.ns[namespace].q || [];

                api.q.push(args);

                cal.q.push([
                    "initNamespace",
                    namespace
                ]);

            } else {

                cal.q.push(args);

            }

            return;
        }


        cal.q.push(args);

    };


    /*
     * Initialise your 30-minute Cal.com event.
     */

    Cal("init", "30min", {
        origin: "https://app.cal.com"
    });


    /*
     * Forward URL query parameters.
     */

    Cal.config = Cal.config || {};

    Cal.config.forwardQueryParams = true;


    /*
     * Create the inline calendar.
     */

    Cal.ns["30min"]("inline", {

        elementOrSelector: "#my-cal-inline-30min",

        config: {
            layout: "month_view",
            useSlotsViewOnSmallScreen: "true"
        },

        calLink: "studio41/30min"

    });


    /*
     * Cal.com UI settings.
     */

    Cal.ns["30min"]("ui", {

        hideEventTypeDetails: false,
        layout: "month_view"

    });


    calInitialized = true;
    calLoading = false;


    /*
     * Give Cal a moment to render after the
     * booking panel becomes visible.
     */

    setTimeout(() => {

        window.dispatchEvent(new Event("resize"));

    }, 300);

}



/* =========================================
   SWITCH BETWEEN ENQUIRY / MEETING
========================================= */

function setContactMode(mode) {

    const showMeeting = mode === "meeting";


    /*
     * Update active button
     */

    contactModeButtons.forEach((button) => {

        const isActive =
            button.dataset.mode === mode;

        button.classList.toggle(
            "is-active",
            isActive
        );

        button.setAttribute(
            "aria-selected",
            String(isActive)
        );

    });


    /*
     * Show the correct panel
     */

    enquiryPanel.hidden = showMeeting;
    meetingPanel.hidden = !showMeeting;


    /*
     * Load Cal.com the first time
     * someone opens Book a meeting.
     */

    if (showMeeting) {

        initializeCalBooking();

    }

}



/* =========================================
   BUTTON EVENTS
========================================= */

contactModeButtons.forEach((button) => {

    button.addEventListener("click", () => {

        setContactMode(button.dataset.mode);

    });

});



/* =========================================
   CONTACT FORM — WEB3FORMS
========================================= */

const contactForm = document.querySelector("#contactForm");

const formSuccess = document.querySelector("#formSuccess");


if (contactForm && formSuccess) {

    contactForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            /*
             * Let the browser handle required-field
             * validation first.
             */

            if (!contactForm.checkValidity()) {

                contactForm.reportValidity();

                return;

            }


            /*
             * Make sure at least one project
             * type has been selected.
             */

            const selectedProjects =
                Array.from(
                    contactForm.querySelectorAll(
                        'input[name="project"]:checked'
                    )
                ).map(
                    (checkbox) => checkbox.value
                );


            if (selectedProjects.length === 0) {

                projectSelect?.classList.add(
                    "is-open"
                );

                projectTrigger?.setAttribute(
                    "aria-expanded",
                    "true"
                );

                return;

            }


            const submitButton =
                contactForm.querySelector(
                    ".form-submit button"
                );


            if (!submitButton) return;


            const originalButtonContent =
                submitButton.innerHTML;


            /*
             * Prevent duplicate submissions.
             */

            submitButton.disabled = true;

            submitButton.innerHTML = `
                Sending...
                <span>↗</span>
            `;


            /*
             * Build FormData.
             */

            const formData =
                new FormData(contactForm);


            /*
             * Web3Forms Access Key
             *
             * Replace YOUR_ACCESS_KEY_HERE
             * with your actual Access Key.
             */

            formData.append(
                "access_key",
                "62e3f06d-299c-4d21-8493-7e5393221131"
            );


            /*
             * Convert the multiple project
             * selections into a comma-separated
             * value for Web3Forms.
             */

            formData.set(
                "project",
                selectedProjects.join(", ")
            );


            /*
             * Email subject.
             */

            formData.append(
                "subject",
                "New Studio 41 enquiry"
            );


            /*
             * The user's email field is named
             * "email", so Web3Forms will use it
             * automatically as Reply-To.
             */


            try {

                const response = await fetch(
                    "https://api.web3forms.com/submit",
                    {
                        method: "POST",
                        body: formData,
                        headers: {
                            "Accept": "application/json"
                        }
                    }
                );


                const result =
                    await response.json();


                if (!result.success) {

                    throw new Error(
                        result.message ||
                        "Submission failed."
                    );

                }


                /*
                 * SUCCESS
                 *
                 * Hide the form and show the
                 * Studio 41 success message.
                 */

                contactForm.hidden = true;

                formSuccess.hidden = false;


                /*
                 * Reset the form in the background
                 * so it is clean if we ever show it again.
                 */

                contactForm.reset();


                /*
                 * Reset the project selector.
                 */

                projectValue.textContent =
                    "Pick one or more";

                projectSelect.classList.remove(
                    "has-selection",
                    "is-open"
                );

                projectTrigger.setAttribute(
                    "aria-expanded",
                    "false"
                );


            } catch (error) {

                console.error(
                    "Web3Forms submission error:",
                    error
                );


                /*
                 * Something went wrong.
                 */

                submitButton.disabled = false;

                submitButton.innerHTML = `
                    Something went wrong
                    <span>↗</span>
                `;


                setTimeout(() => {

                    submitButton.innerHTML =
                        originalButtonContent;

                }, 4000);

            }

        }
    );

}

/* =========================================
   COPY EMAIL
========================================= */

const copyEmail = document.querySelector(".copy-email");
const copyFeedback = document.querySelector(".copy-feedback");

if (copyEmail && copyFeedback) {

    copyEmail.addEventListener("click", async (event) => {

        event.preventDefault();

        const email = copyEmail.dataset.email;

        try {

            await navigator.clipboard.writeText(email);

            copyFeedback.classList.add("is-visible");

            setTimeout(() => {
                copyFeedback.classList.remove("is-visible");
            }, 1800);

        } catch (error) {

            console.error("Unable to copy email:", error);

        }

    });

}