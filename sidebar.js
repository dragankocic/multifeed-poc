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
    const isCurrent = (path) => window.location.pathname.endsWith(`/${path}`);
    const activeClass = (path) => isCurrent(path) ? 'active' : '';
    const activeClassFor = (paths) => paths.some(isCurrent) ? 'active' : '';

    const serviceName = service === "multifeed" ? "Multifeed" : "Sportsbook Masterdata";
    const sportDataManagementPages = [
        'sports/hermes_sports.html',
        'sports/create_sport.html',
        'sports/view_hermes_sport.html'
    ];
    const categoryDataManagementPages = [
        'categories/category.html',
        'categories/create_category.html',
        'categories/view_category.html'
    ];
    const tournamentDataManagementPages = [
        'tournaments/tournament.html',
        'tournaments/create_tournament.html',
        'tournaments/view_tournament.html'
    ];
    const competitorDataManagementPages = [
        'competitors/competitor.html',
        'competitors/create_competitor.html',
        'competitors/view_competitor.html'
    ];
    const playerDataManagementPages = [
        'players/player.html',
        'players/create_player.html',
        'players/view_player.html'
    ];
    const marketDataManagementPages = [
        'hermes_markets.html',
        'create_market/create_market.html',
        'create_market/specifiers.html',
        'create_market/extended_specifiers.html',
        'view_hermes_market.html'
    ];
    const sportMappingPages = [
        'sports/sports_mapping.html',
        'sports/map_sport.html'
    ];
    const categoryMappingPages = [
        'categories/category_mapping.html',
        'categories/map_category.html'
    ];
    const tournamentMappingPages = [
        'tournaments/tournament_mapping.html',
        'tournaments/map_tournament.html'
    ];
    const competitorMappingPages = [
        'competitors/competitor_mapping.html',
        'competitors/map_competitor.html'
    ];
    const playerMappingPages = [
        'players/player_mapping.html',
        'players/map_player.html'
    ];
    const marketMappingPages = [
        'sportsbook_masterdata.html',
        'mapping/mapping.html',
        'view_market.html'
    ];
    const eventPages = [
        'multifeed/messages/messages.html'
    ];
    const dataManagementPages = [
        ...sportDataManagementPages,
        ...categoryDataManagementPages,
        ...tournamentDataManagementPages,
        ...competitorDataManagementPages,
        ...playerDataManagementPages,
        ...marketDataManagementPages
    ];
    const mappingPages = [
        ...marketMappingPages,
        ...sportMappingPages,
        ...categoryMappingPages,
        ...tournamentMappingPages,
        ...competitorMappingPages,
        ...playerMappingPages
    ];
    const primaryPages = [
        ...dataManagementPages,
        ...mappingPages,
        ...eventPages
    ];
    const primaryNav = `
            <div class="sidebar-nav-group" data-section="data-management">
                <button type="button" class="sidebar-section-toggle" aria-expanded="true">
                    <span>Data Management</span>
                    <span class="sidebar-toggle-icon">▾</span>
                </button>
                <ul class="sidebar-menu">
                    <li><a href="${link('sports/hermes_sports.html')}" class="${activeClassFor(sportDataManagementPages)}">Sport</a></li>
                    <li><a href="${link('categories/category.html')}" class="${activeClassFor(categoryDataManagementPages)}">Category</a></li>
                    <li><a href="${link('tournaments/tournament.html')}" class="${activeClassFor(tournamentDataManagementPages)}">Tournament</a></li>
                    <li><a href="${link('competitors/competitor.html')}" class="${activeClassFor(competitorDataManagementPages)}">Competitor</a></li>
                    <li><a href="${link('players/player.html')}" class="${activeClassFor(playerDataManagementPages)}">Player</a></li>
                    <li><a href="${link('hermes_markets.html')}" class="${activeClassFor(marketDataManagementPages)}">Market</a></li>
                </ul>
            </div>

            <div class="sidebar-nav-group" data-section="mapping">
                <button type="button" class="sidebar-section-toggle" aria-expanded="true">
                    <span>Mapping</span>
                    <span class="sidebar-toggle-icon">▾</span>
                </button>
                <ul class="sidebar-menu">
                    <li><a href="${link('sportsbook_masterdata.html')}" class="${activeClassFor(marketMappingPages)}">Market Mapping</a></li>
                    <li><a href="${link('sports/sports_mapping.html')}" class="${activeClassFor(sportMappingPages)}">Sport Mapping</a></li>
                    <li><a href="${link('categories/category_mapping.html')}" class="${activeClassFor(categoryMappingPages)}">Category Mapping</a></li>
                    <li><a href="${link('tournaments/tournament_mapping.html')}" class="${activeClassFor(tournamentMappingPages)}">Tournament Mapping</a></li>
                    <li><a href="${link('competitors/competitor_mapping.html')}" class="${activeClassFor(competitorMappingPages)}">Competitor Mapping</a></li>
                    <li><a href="${link('players/player_mapping.html')}" class="${activeClassFor(playerMappingPages)}">Player Mapping</a></li>
                </ul>
            </div>

            <div class="sidebar-nav-group" data-section="events">
                <button type="button" class="sidebar-section-toggle" aria-expanded="true">
                    <span>Events</span>
                    <span class="sidebar-toggle-icon">▾</span>
                </button>
                <ul class="sidebar-menu">
                    <li><a href="${link('multifeed/messages/messages.html')}" class="${activeClassFor(eventPages)}">View Events</a></li>
                </ul>
            </div>
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
            ${primaryNav}
        </aside>
    `;

    container.innerHTML = sidebarHTML;

    container.querySelectorAll('.sidebar-nav-group').forEach(group => {
        const sectionKey = group.dataset.section;
        const toggle = group.querySelector('.sidebar-section-toggle');
        const storedState = localStorage.getItem(`sidebar:${sectionKey}`);
        const containsActivePage = !!group.querySelector('a.active');
        const shouldCollapse = storedState === 'collapsed' && !containsActivePage;

        group.classList.toggle('collapsed', shouldCollapse);
        toggle.setAttribute('aria-expanded', String(!shouldCollapse));

        toggle.addEventListener('click', () => {
            const isCollapsed = group.classList.toggle('collapsed');
            toggle.setAttribute('aria-expanded', String(!isCollapsed));
            localStorage.setItem(`sidebar:${sectionKey}`, isCollapsed ? 'collapsed' : 'expanded');
        });
    });
});
