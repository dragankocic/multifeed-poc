document.addEventListener("DOMContentLoaded", () => {
  const marketsTableBody = document.getElementById("marketsTableBody");
  const providerSelect = document.getElementById("providerSelect");
  const sportSelect = document.getElementById("sportSelect");
  const statusSelect = document.getElementById("statusSelect");
  const searchInput = document.getElementById("searchInput");

  // Mock podaci (bez feed propertija, dodat 'Partially mapped' status za testiranje)
  const providerMarkets = [
    { id: "-", name: "1X2", sport: "Soccer", status: "Mapped", provider: "ExeFeed" },
    { id: "-", name: "TOTAL_GOALS", sport: "Soccer", status: "Partially mapped", provider: "ExeFeed" },
    { id: "-", name: "TOTAL_GOALS_15_MIN", sport: "Soccer", status: "Unmapped", provider: "SportRadar" },
    { id: "-", name: "TOTAL_GOALS_20_MIN", sport: "Soccer", status: "Unmapped", provider: "SportRadar" },
    { id: "-", name: "ANY_GOAL_SCORER", sport: "Soccer", status: "Mapped", provider: "Bet Genius" },
    { id: "-", name: "NEXT_GOAL_SCORER", sport: "Soccer", status: "Unmapped", provider: "IMG Arena" },
    { id: "-", name: "MATCH_WINNER", sport: "Basketball", status: "Mapped", provider: "SportRadar" }
  ];

  // Funkcija za renderovanje i filtriranje tabele
  function renderMarkets() {
    marketsTableBody.innerHTML = ""; 

    const providerVal = providerSelect.value;
    const sportVal = sportSelect.value;
    const statusVal = statusSelect.value;
    const searchVal = searchInput.value.toLowerCase();

    // Prolazak kroz sve podatke i primena filtera
    const filteredMarkets = providerMarkets.filter(market => {
      const matchesProvider = providerVal === 'all' || market.provider === providerVal;
      // Vraćena provera za "all" sportove
      const matchesSport = sportVal === 'all' || market.sport.toLowerCase() === sportVal.toLowerCase();
      const matchesStatus = statusVal === 'all' || market.status.toLowerCase() === statusVal;
      const matchesSearch = market.name.toLowerCase().includes(searchVal);

      return matchesProvider && matchesSport && matchesStatus && matchesSearch;
    });

    // Ako nema rezultata nakon filtriranja
    if (filteredMarkets.length === 0) {
      marketsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #888; font-style: italic;">No markets found matching the filters.</td></tr>';
      return;
    }

    // Isrtavanje redova
    filteredMarkets.forEach((market) => {
      const row = document.createElement("tr");

      // Definišemo boje za sva tri statusa
      let badgeStyle = "";
      if (market.status === "Mapped") {
          badgeStyle = "background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;"; // Zeleno
      } else if (market.status === "Partially mapped") {
          badgeStyle = "background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;"; // Žuto
      } else {
          badgeStyle = "background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;"; // Crveno
      }

      row.innerHTML = `
                <td style="font-weight: 500; color: #6c757d;">${market.id}</td>
                <td class="market-name">${market.name}</td>
                <td><strong style="color: #444;">${market.provider}</strong></td>
                <td>${market.sport}</td>
                <td>
                    <span class="status-badge" style="${badgeStyle}">${market.status}</span>
                </td>
                <td style="text-align: right;">
                    <a href="view_market.html?id=${encodeURIComponent(market.id)}&market=${encodeURIComponent(market.name)}&sport=${encodeURIComponent(market.sport)}" class="btn-action" style="margin-right: 8px; background-color: #007bff; text-decoration: none; display: inline-block;">View</a>
                    <a href="mapping/mapping.html?market=${encodeURIComponent(market.name)}&sport=${encodeURIComponent(market.sport)}" class="btn-action" style="text-decoration: none; display: inline-block;">Map</a>
                </td>
            `;

      marketsTableBody.appendChild(row);
    });
  }

  // Slušači događaja na filterima za uživo osvežavanje
  providerSelect.addEventListener('change', renderMarkets);
  sportSelect.addEventListener('change', renderMarkets);
  statusSelect.addEventListener('change', renderMarkets);
  searchInput.addEventListener('input', renderMarkets);

  // Inicijalno pokretanje prilikom učitavanja stranice
  renderMarkets();
});