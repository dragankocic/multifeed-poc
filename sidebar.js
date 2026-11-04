// sidebar.js (Glavni/Root folder)
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    // Čitamo data atribute iz HTML-a
    const rootPath = container.getAttribute("data-root") || ".";

    // Pomoćna funkcija za generisanje ispravnih linkova
    const link = (path) => `${rootPath}/${path}`;
    const isCurrent = (path) => window.location.pathname.endsWith(`/${path}`);
    const activeClassFor = (paths) => paths.some(isCurrent) ? 'active' : '';

    const sportDataManagementPages = [
        'sports/hermes_sports.html',
        'sports/view_hermes_sport.html',
        'sports/map_sport.html'
    ];
    const categoryDataManagementPages = [
        'categories/category.html',
        'categories/create_category.html',
        'categories/view_category.html',
        'categories/map_category.html'
    ];
    const tournamentDataManagementPages = [
        'tournaments/tournament.html',
        'tournaments/create_tournament.html',
        'tournaments/view_tournament.html',
        'tournaments/map_tournament.html'
    ];
    const competitorDataManagementPages = [
        'competitors/competitor.html',
        'competitors/create_competitor.html',
        'competitors/view_competitor.html',
        'competitors/map_competitor.html'
    ];
    const marketDataManagementPages = [
        'hermes_markets.html',
        'create_market/create_market.html',
        'create_market/specifiers.html',
        'create_market/extended_specifiers.html',
        'view_hermes_market.html',
        'mapping/mapping.html',
        'view_market.html'
    ];
    const sportMappingPages = [
        'sports/map_sport.html'
    ];
    const eventPages = [
        'multifeed/messages/messages.html'
    ];
    const feedProviderSettingsPages = [
        'settings/feed_providers.html'
    ];
    const consumerSettingsPages = [
        'settings/consumers.html'
    ];
    const dataManagementPages = [
        ...sportDataManagementPages,
        ...categoryDataManagementPages,
        ...tournamentDataManagementPages,
        ...competitorDataManagementPages,
        ...marketDataManagementPages
    ];
    const mappingPages = [
        ...sportMappingPages
    ];
    const primaryPages = [
        ...dataManagementPages,
        ...mappingPages,
        ...eventPages,
        ...feedProviderSettingsPages,
        ...consumerSettingsPages
    ];
    const primaryNav = `
            <div class="sidebar-nav-group" data-section="events">
                <button type="button" class="sidebar-section-toggle" aria-expanded="true">
                    <span>Events</span>
                    <span class="sidebar-toggle-icon">▾</span>
                </button>
                <ul class="sidebar-menu">
                    <li><a href="${link('multifeed/messages/messages.html')}" class="${activeClassFor(eventPages)}">View Events</a></li>
                </ul>
            </div>

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
                    <li><a href="${link('hermes_markets.html')}" class="${activeClassFor(marketDataManagementPages)}">Market</a></li>
                </ul>
            </div>

    `;
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-brand">MULTIFEED</div>
            ${primaryNav}
            <div class="sidebar-settings-entry">
                <a href="${link('settings/feed_providers.html')}" class="${activeClassFor([...feedProviderSettingsPages, ...consumerSettingsPages])}">Settings</a>
            </div>
        </aside>
    `;

    container.innerHTML = sidebarHTML;
    container.querySelectorAll('a.active').forEach(anchor => anchor.setAttribute('aria-current', 'page'));
    const main = document.querySelector('.main-content');
    if (main) {
        main.id = main.id || 'main-content'; main.tabIndex = -1;
        const skip = document.createElement('a'); skip.className = 'skip-content'; skip.href = '#' + main.id; skip.textContent = 'Skip to content';
        document.body.prepend(skip);
    }

    container.querySelectorAll('.sidebar-nav-group').forEach(group => {
        const sectionKey = group.dataset.section;
        const toggle = group.querySelector('.sidebar-section-toggle');
        let storedState; try { storedState = localStorage.getItem(`sidebar:${sectionKey}`); } catch {}
        const containsActivePage = !!group.querySelector('a.active');
        const shouldCollapse = storedState === 'collapsed' && !containsActivePage;

        group.classList.toggle('collapsed', shouldCollapse);
        toggle.setAttribute('aria-expanded', String(!shouldCollapse));

        toggle.addEventListener('click', () => {
            const isCollapsed = group.classList.toggle('collapsed');
            toggle.setAttribute('aria-expanded', String(!isCollapsed));
            try { localStorage.setItem(`sidebar:${sectionKey}`, isCollapsed ? 'collapsed' : 'expanded'); } catch {}
        });
    });
});

// Keep data failures visible and make existing dialog close controls keyboard reachable.
window.addEventListener('error', event => {
    if (!/Saved mappings|Tournament data could not be read/.test(event.message || '')) return;
    const main=document.querySelector('.main-content');
    if(main&&!document.getElementById('mappingReadError')){const notice=document.createElement('p');notice.id='mappingReadError';notice.className='form-feedback';notice.setAttribute('role','alert');notice.textContent=event.message;main.prepend(notice);}
});
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal').forEach((modal,index) => {
        modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
        const title=modal.querySelector('h3,h2');if(title){title.id=title.id||'dialog-title-'+index;modal.setAttribute('aria-labelledby',title.id);}
        modal.querySelectorAll('span.close-modal').forEach(close => {close.tabIndex=0;close.setAttribute('role','button');close.setAttribute('aria-label','Close');close.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();close.click();}});});
    });
});
