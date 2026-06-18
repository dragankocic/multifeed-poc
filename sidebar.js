// sidebar.js (Glavni/Root folder)
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    // Čitamo data atribute iz HTML-a
    const rootPath = container.getAttribute("data-root") || ".";
    const activeItem = container.getAttribute("data-active");
    const service = container.getAttribute("data-service") || (activeItem && activeItem.startsWith("multifeed") ? "multifeed" : "sportsbook");

    // Pomoćna funkcija za generisanje ispravnih linkova
    const link = (path) => `${rootPath}/${path}`;

    const serviceName = service === "multifeed" ? "Multifeed" : "Sportsbook Masterdata";
    const serviceNav = service === "multifeed" ? `
            <div class="sidebar-section">Multifeed</div>
            <ul class="sidebar-menu">
                <li><a href="${link('multifeed/messages/messages.html')}" class="${activeItem === 'multifeed-messages' ? 'active' : ''}">Messages</a></li>
            </ul>
    ` : `
            <div class="sidebar-section">Markets</div>
            <ul class="sidebar-menu">
                <li><a href="${link('sportsbook_masterdata.html')}" class="${activeItem === 'markets-mapping' ? 'active' : ''}">Mappings</a></li>
                <li><a href="${link('hermes_markets.html')}" class="${activeItem === 'markets-management' ? 'active' : ''}">Management</a></li>
            </ul>

            <div class="sidebar-section">Sports</div>
            <ul class="sidebar-menu">
                <li><a href="${link('sports/sports_mapping.html')}" class="${activeItem === 'sports-mapping' ? 'active' : ''}">Mappings</a></li>
                <li><a href="${link('sports/hermes_sports.html')}" class="${activeItem === 'sports-management' ? 'active' : ''}">Management</a></li>
            </ul>

            <div class="sidebar-section">Publish</div>
            <ul class="sidebar-menu">
                <li><a href="${link('publish/publish.html')}" class="${activeItem === 'publish-management' ? 'active' : ''}">Release Mappings</a></li>
            </ul>

            <hr class="sidebar-divider">

            <div class="sidebar-section sidebar-review-note">NOT PREPARED FOR REVIEW</div>

            <div class="sidebar-section">Feeds</div>
            <ul class="sidebar-menu">
                <li><a href="${link('feeds/feeds.html')}" class="${activeItem === 'feeds-management' ? 'active' : ''}">Management</a></li>
            </ul>
    `;

    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-brand">HERMES POC</div>
            <div class="sidebar-service">
                <div class="sidebar-service-label">Active service</div>
                <div class="sidebar-service-name">${serviceName}</div>
            </div>
            <div class="sidebar-switch">
                <a href="${link('index.html')}">Change service</a>
            </div>
            ${serviceNav}
        </aside>
    `;

    container.innerHTML = sidebarHTML;
});
