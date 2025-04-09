export const qs = (selector, parent = document) => parent.querySelector(selector);

export function renderWithTemplate(template, parentElement, data, callback) {
    parentElement.innerHTML = template;
    if (callback) callback(data);
}

export async function loadTemplate(path) {
    const res = await fetch(path);
    const template = await res.text();
    return template;
}

function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

export async function loadHeaderFooter() {
    const headerTemplate = await loadTemplate("../partials/header.html");
    renderWithTemplate(headerTemplate, qs("#main-header"));

    const footerTemplate = await loadTemplate("../partials/footer.html");
    renderWithTemplate(footerTemplate, qs("#main-footer"));

    setupMobileMenu();
}