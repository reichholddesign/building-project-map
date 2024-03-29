mapboxgl.accessToken =
  "pk.eyJ1IjoiamFja3JlaWNoIiwiYSI6ImNrdnlyMThpcGEyY3gyb3ExaWp6aWZoZnQifQ.h5lp-DoUuRpv9XtedzXMKQ";

// Loading elements
const loadOverlay = document.querySelector(".load-overlay");

// Sidebar elements
const getSidebar = document.querySelector(".sidebar");
const searchbox = document.querySelector('input[name="search"]');
const resetBtn = document.querySelector("#reset-btn");

// Info panel (top right) elements
const markerSelect = document.querySelector("#marker-select");
const dataBtn = document.querySelector("#data-btn");
const dataBtnCtn = document.querySelector("#data-btn-ctn");
const dataCtn = document.querySelector("#data-ctn");
let clusterView = false;
let chartControl = false;

// mobile elements
const menuToggleBtn = document.querySelector("#menu-btn")

// Map elements
const getMap = document.querySelector(".map");
const getInfoMenu = document.querySelector("#info-menu");
const welcomeMsgCtn = document.querySelector("aside");
const welcomeMsgClose = document.querySelector(".welcome-dec img");
const layerIDs = []; // This array will contain a list used to filter against


// Init map
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  // style: "mapbox://styles/jackreich/cllrjdr95004801of02o94tmc",
  center: [-127.647621, 53.726669], // starting position [lng, lat]
  zoom: 5, // starting zoom
});

// Add zoom/navigation controls
map.addControl(new mapboxgl.NavigationControl());

// Fund counts
const fund1 = [
  "match",
  ["get", "fundingProgram"],
  "Affordable Rental Housing",
  true,
  false,
];
const fund2 = [
  "match",
  ["get", "fundingProgram"],
  "Columbia Basin Trust",
  true,
  false,
];
const fund3 = [
  "match",
  ["get", "fundingProgram"],
  "Community Housing Fund",
  true,
  false,
];
const fund4 = [
  "match",
  ["get", "fundingProgram"],
  "Deepening Affordability Fund",
  true,
  false,
];
const fund5 = ["match", ["get", "fundingProgram"], "HousingHub", true, false];
const fund6 = [
  "match",
  ["get", "fundingProgram"],
  "Indigenous Housing Fund",
  true,
  false,
];
const fund7 = [
  "match",
  ["get", "fundingProgram"],
  "Rapid Response to Homelessness",
  true,
  false,
];
const fund8 = [
  "match",
  ["get", "fundingProgram"],
  "Regional Housing First ",
  true,
  false,
];
const fund9 = [
  "match",
  ["get", "fundingProgram"],
  "Student Housing Loan Program",
  true,
  false,
];
const fund10 = [
  "match",
  ["get", "fundingProgram"],
  "Supportive Housing Fund",
  true,
  false,
];

// colors to use for the categories
const colors = [
  "rgba(206, 21, 21, 1)",
  "rgba(99, 105, 209, 1)",
  "rgba(239, 71, 111, 1)",
  "rgba(66, 217, 200, 1)",
  "rgba(214, 179, 187, 1)",
  "rgb(159, 61, 149)",
  "rgba(251, 175, 0, 1)",
  "rgba(194, 232, 18, 1)",
  "rgba(46, 192, 249, 1)",
  "rgb(131, 164, 56)",
];

// Request GeoJSON data from mapbox
async function getHomesData() {
  const homesData = await fetch(
    `https://api.mapbox.com/datasets/v1/jackreich/ckvzs4z2x2hka28nz88oijx2i/features?access_token=pk.eyJ1IjoiamFja3JlaWNoIiwiYSI6ImNrdnlyNDFzbzZncXUybm51aGR4dmViN2wifQ.ZKSMNm2U-vs95ClInj5muA`
  );
  const retreivedData = await homesData.json();
  return retreivedData;
}


// Map properties and functionality
map.on("load", () => {
  getHomesData().then((data) => {
    const projects = data;
    projects.features.forEach((project, i) => {
      project.properties.id = i;
      project.properties.searchName = cleanInput(project.properties.name);
    });

    // load map data source
    map.addSource("places", {
      type: "geojson",
      data: projects,
    });
    
    // Load map marker image
    map.loadImage('./img/icons/house.png', (error, image) => {
      if (error) {
        throw error;
      }
      map.addImage('house-icon', image, { sdf: true });
    });
    
    for (const feature of projects.features) {
      const name = cleanInput(feature.properties.name);
      const layerID = name;

      // Add a layer for this symbol type if it hasn't been added already.
      if (!map.getLayer(layerID)) {
        map.addLayer({
          id: layerID,
          type: "symbol",
          source: "places",
          layout: {
            'icon-image': 'house-icon',
            'icon-size': 0.8,
            // "icon-image": "accessible",
            "icon-allow-overlap": true,
            "visibility": 'visible',
          },
          filter: ["==", "searchName", name],
          paint: {
            'icon-color': [
            'match', 
            ['get', 'fundingProgram'], 
            fund1[2],
            colors[0],
            fund2[2],
            colors[1],
            fund3[2],
            colors[2],
            fund4[2],
            colors[3],
            fund5[2],
            colors[4],
            fund6[2],
            colors[5],
            fund7[2],
            colors[6],
            fund8[2],
            colors[7],
            fund9[2],
            colors[8],
            fund10[2],
            colors[9],
            '#FF0000' // any other store type
            ]
            },
        });
        layerIDs.push(layerID);
      }
    }

  
    // Once map objects are loaded, hide loading overlay and display map elemets 
    if (layerIDs) {
      getSidebar.style.opacity = "1";
      getMap.style.opacity = "1";
      loadOverlay.style.display = "none";
      welcomeMsgCtn.style.transform = "translateY(-500px)";
      welcomeMsgClose.addEventListener("click", function () {welcomeMsgCtn.style.display = "none";});
      resetBtn.addEventListener("click", function (e) {resetSearch(e);});
    }

    // objects for caching and keeping track of HTML marker objects (for performance)
    const markers = {};
    let markersOnScreen = {};
    const sortedHomesArray = projects.features.sort((a, b) =>a.properties.name > b.properties.name ? 1 : -1);

    buildSearchResult(sortedHomesArray);
    
    
    /**
     * Add a listing for each project to the sidebar.
     **/
    function buildSearchResult(matchList) {
      // save marker properties for retrival when building graphs
      sessionStorage.setItem('search-data', JSON.stringify(matchList));

      let getListContainer = document.querySelector("#listings");
      if (getListContainer) getListContainer.remove();
      let listDiv = document.createElement("div");
      listDiv.classList.add("listings");
      listDiv.setAttribute("id", "listings");
      getSidebar.appendChild(listDiv);
      for (const project of matchList) {
        displayHomesList(project);
      }
      // Calculate search result projects & homes totals
      document.querySelector(
        "#projects-total"
      ).textContent = `${matchList.length}`;
      const homeTotal = matchList.reduce((a, b) => {
        let currentVal = parseInt(b.properties.numHomes);
        return isNaN(currentVal) ? a : a + currentVal;
      }, 0);
      document.querySelector(
        "#homes-total"
      ).textContent = `${homeTotal.toLocaleString("en-US")}`;
    }

    function addMarkers(layerIDs, searchValue, matchList) {
      let matchArray = [];
      matchList.forEach((match) => {
        matchArray.push(cleanInput(match.properties.name));
      });

      for (const layerID of layerIDs) {
        map.setLayoutProperty(layerID, "visibility", "none");
      }

      for (const match of matchArray) {
        map.setLayoutProperty(
          match,
          "visibility",
          match.includes(searchValue) ? "visible" : "none"
        );
      }
    }

    function getSearchParams() {
      let searchValue = cleanInput(searchbox.value);
      let searchMatches = sortedHomesArray.filter((matchedHome) => {
        let regex = new RegExp(`${searchValue}`, "gi");
        let cleanNames = cleanName(matchedHome.properties.name);
        return cleanNames.match(regex);
      });
      let regionFilter =
        regionSelct.options[regionSelct.selectedIndex].getAttribute(
          "data-region"
        );
      let fundFilter =
        fundSelct.options[fundSelct.selectedIndex].getAttribute("data-fund");
      let clientFilter =
        clientSelct.options[clientSelct.selectedIndex].getAttribute(
          "data-client"
        );
      let matchList = [];
      for (const project of searchMatches) {
        /* Add a new listing section to the sidebar. */
        let lowerCaseFund = project.properties.fundingProgram
          .trim()
          .toLowerCase();
        let lowerCaseRegion = project.properties.region.trim().toLowerCase();
        let lowerCaseClients = project.properties.clientsServed
          .trim()
          .toLowerCase();

        if (lowerCaseFund === fundFilter && !regionFilter && !clientFilter) {
          matchList.push(project);
        } else if (
          !fundFilter &&
          !clientFilter &&
          lowerCaseRegion === regionFilter
        ) {
          matchList.push(project);
        } else if (
          !fundFilter &&
          !regionFilter &&
          lowerCaseClients === clientFilter
        ) {
          matchList.push(project);
        } else if (
          lowerCaseFund === fundFilter &&
          lowerCaseRegion === regionFilter &&
          !clientFilter
        ) {
          matchList.push(project);
        } else if (
          lowerCaseFund === fundFilter &&
          lowerCaseClients === clientFilter &&
          !regionFilter
        ) {
          matchList.push(project);
        } else if (
          lowerCaseRegion === regionFilter &&
          lowerCaseClients === clientFilter &&
          !fundFilter
        ) {
          matchList.push(project);
        } else if (!fundFilter && !regionFilter && !clientFilter) {
          matchList.push(project);
        }
      }

      buildSearchResult(matchList);
      addMarkers(layerIDs, searchValue, matchList);
    }

    function displayHomesList(project) {
      //   const listings = document.getElementById('listings');
      const listing = listings.appendChild(document.createElement("div"));
      /* Assign a unique `id` to the listing. */
      listing.id = `listing-${project.properties.id}`;
      /* Assign the `item` class to each listing for styling. */
      listing.className = "item";

      /* Add the link to the individual listing created above. */
      const link = listing.appendChild(document.createElement("a"));
      link.href = "#";
      link.className = "title";
      //   link.dataset.fund = `${project.properties.fundingProgram}`
      link.id = `link-${project.properties.id}`;
      let bgColor = "";
      switch (project.properties.fundingProgram) {
        case fund1[2]:
          bgColor = colors[0];
          break;
        case fund2[2]:
          bgColor = colors[1];
          break;
        case fund3[2]:
          bgColor = colors[2];
          break;
        case fund4[2]:
          bgColor = colors[3];
          break;
        case fund5[2]:
          bgColor = colors[4];
          break;
        case fund6[2]:
          bgColor = colors[5];
          break;
        case fund7[2]:
          bgColor = colors[6];
          break;
        case fund8[2]:
          bgColor = colors[7];
          break;
        case fund9[2]:
          bgColor = colors[8];
          break;
        case fund10[2]:
          bgColor = colors[9];
          break;       
      }
    
      link.innerHTML = `<h3>${project.properties.name}</h3><div class="fund-ctn"><div class="fund-colour" style="background:${bgColor}"></div> <p class="black">${project.properties.fundingProgram}</p></div`;

  
      link.addEventListener("click", function () {
        for (const feature of projects.features) {
          if (this.id === `link-${feature.properties.id}`) {
            if(window.innerWidth < 769){
              toggleMobMenu()
            }
            flyToproject(feature);
            createPopUp(feature);
           
          }
        }
        const activeItem = document.getElementsByClassName("active");
        if (activeItem[0]) {
          activeItem[0].classList.remove("active");
        }
        this.parentNode.classList.add("active");
      });
    }

    const fundSelct = document.querySelector("#fund-selct");
    const regionSelct = document.querySelector("#region-selct");
    const clientSelct = document.querySelector("#client-selct");

    fundSelct.addEventListener("change", function () {
      getSearchParams();
    });
    regionSelct.addEventListener("change", function () {
      getSearchParams();
    });
    clientSelct.addEventListener("change", function () {
      getSearchParams();
    });
    searchbox.addEventListener("keyup", function (e) {
      getSearchParams();
    });

    function cleanInput(val) {
      val = val.toLowerCase().trim();
      if (val.includes("?")) {
        val = val.replace(/\?/g, "\\?");
      } else if (val.includes("-") || val.includes(" ")) {
        val = val.replace(/[\- ]/g, "");
      }
      return val;
    }

    function cleanName(name) {
      name = name.replace(/[^a-zA-Z0-9\?]/g, "");
      return name;
    }

    // Reset search filters

    function resetSearch(e) {
      e.preventDefault();
      e.stopPropagation();
      document
        .querySelectorAll("form select")
        .forEach((select) => (select.selectedIndex = 0));
      searchbox.value = "";
      getSearchParams();
    }


    
  /**
   * Use Mapbox GL JS's `flyTo` to move the camera smoothly
   * a given center point.
   **/
  function flyToproject(currentFeature) {
    if (map.getZoom() < 11) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 11,
      });
    } else {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
      });
    }
  }

  function createPopUp(currentFeature) {
    const popUps = document.getElementsByClassName("mapboxgl-popup");
    if (popUps[0]) popUps[0].remove();
    const popup = new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(
        `<div class="pop-title-ctn"><h3>${currentFeature.properties.name}</h3></div><div class="pop-img-ctn"><img class="pop-img" src="./img/500-robert-nicklin-place.jpg"><div class="pop-home-ctn"><div><span class="home-num">${currentFeature.properties.numHomes}</span><span>Homes</span></div></div></div><div class="pop-location-ctn"><h4><span class="green">Address:</span><br>${currentFeature.properties.address}</h4><h4><span class="green">Region:</span><br>${currentFeature.properties.region}</h4></div><h4 class="popup-bottom"><span class="green">Funding Program:</span><br>${currentFeature.properties.fundingProgram}</h4>`
      )
      .addTo(map);

      console.log(currentFeature.geometry.coordinates)

  }


 /******  START of clustering layer ********/

 function updateMarkers() {
  const newMarkers = {};
  const features = map.querySourceFeatures("clustered-places");

  // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
  // and add it to the map if it's not there already
  for (const feature of features) {
    const coords = feature.geometry.coordinates;
    const props = feature.properties;
    if (!props.cluster) continue;
    const id = props.cluster_id;

    let marker = markers[id];
    if (!marker) {
      const el = createDonutChart(props);
      marker = markers[id] = new mapboxgl.Marker({
        element: el,
      }).setLngLat(coords);
    }
    newMarkers[id] = marker;

    if (!markersOnScreen[id]) marker.addTo(map);
  }
  // for every marker we've added previously, remove those that are no longer visible
  for (const id in markersOnScreen) {
    if (!newMarkers[id]) markersOnScreen[id].remove();
  }
  markersOnScreen = newMarkers;
}

// after the GeoJSON data is loaded, update markers on the screen on every frame
  map.addSource("clustered-places", {
    type: "geojson",
    data: projects,
    cluster: true,
    clusterRadius: 80,
    clusterProperties: {
      // keep separate counts for each magnitude category in a cluster
      fund1: ["+", ["case", fund1, 1, 0]],
      fund2: ["+", ["case", fund2, 1, 0]],
      fund3: ["+", ["case", fund3, 1, 0]],
      fund4: ["+", ["case", fund4, 1, 0]],
      fund5: ["+", ["case", fund5, 1, 0]],
      fund6: ["+", ["case", fund6, 1, 0]],
      fund7: ["+", ["case", fund7, 1, 0]],
      fund8: ["+", ["case", fund8, 1, 0]],
      fund9: ["+", ["case", fund9, 1, 0]],
      fund10: ["+", ["case", fund10, 1, 0]],
    },
  });


  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "clustered-places",
    // source: "places",
    layout: {
      // Make the layer visible by default.
      visibility: "none",
    },
    filter: ["!=", "cluster", true],
    paint: {
      "circle-color": [
        "case",
        fund1,
        colors[1],
        fund2,
        colors[6],
        fund3,
        colors[2],
        fund4,
        colors[8],
        fund5,
        colors[3],
        fund6,
        colors[7],
        fund7,
        colors[4],
        fund8,
        colors[9],
        fund9,
        colors[5],
        fund10,
        colors[0],
        colors[0],
      ],
      // 'circle-opacity': 0.6,
      // 'circle-radius': 12
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "clustered-places",
    layout: {
      // Make the layer visible by default.
      visibility: "none",
    },
    filter: ["!=", "cluster", true],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  map.on("render", () => {
    if (!map.isSourceLoaded("clustered-places")) return;
    updateMarkers();
  });



function layerControl(layerIDs) {

  if (clusterView === false) {
    clusterView = true;
    for (const layerID of layerIDs) {
      map.setLayoutProperty(layerID, "visibility", "none");
    }
    map.setLayoutProperty("clusters", "visibility", "visible");
    map.setLayoutProperty("unclustered-point", "visibility", "visible");
  } else {
    clusterView = false;
    for (const layerID of layerIDs) {
      map.setLayoutProperty(layerID, "visibility", "visible");
    }
    map.setLayoutProperty("clusters", "visibility", "none");
    map.setLayoutProperty("unclustered-point", "visibility", "none");
  }
}

let menuToggleActive = false;

function toggleMobMenu() {
  showHideSidebar(menuToggleActive)
  menuToggleActive = !menuToggleActive
}

menuToggleBtn.addEventListener("click", ()=>{
  toggleMobMenu()
})


function showHideSidebar(bool){
(bool) ? getSidebar.style.transform = "translateX(-100%)" : getSidebar.style.transform = "translateX(0)"
}


function setMarkerOverlap(overlapBool) {
  for (const feature of projects.features) {
    const name = cleanInput(feature.properties.name);
    const layerID = name;
  map.setLayoutProperty(layerID, "icon-allow-overlap", overlapBool);
  }
  
}

// clustering toggle
markerSelect.addEventListener("change", function (e) {
  const markerVal = markerSelect.value
  const disabledSidebar = document.querySelector(".disabled-sidebar");
  if(markerVal === "all"){
    if(clusterView === true){
      layerControl(layerIDs);
      showHideSidebar(false);
    }
    setMarkerOverlap(true);
  } else if(markerVal === "hide"){
    if(clusterView === true){
      layerControl(layerIDs);
      showHideSidebar(false);
    }
    setMarkerOverlap(false);

  } else if(markerVal === "cluster"){
    layerControl(layerIDs);
    showHideSidebar(true);

  }
});



    // When a click event occurs on a feature in
    // the default layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on("click", layerIDs, (e) => {
      createPopUp(e.features[0]);
      flyToproject(e.features[0]);
    });
  
    map.on("mouseenter", layerIDs, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerIDs, () => {
      map.getCanvas().style.cursor = "";
    });

    // interactions for unclustered-point layer

    map.on("click", "unclustered-point", (e) => {
      createPopUp(e.features[0]);
      flyToproject(e.features[0]);
    });

    map.on("mouseenter", "unclustered-point", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "unclustered-point", () => {
      map.getCanvas().style.cursor = "";
    });
  });

  // code for creating an SVG donut chart from feature properties
  function createDonutChart(props) {
    const offsets = [];
    const counts = [
      props.fund1,
      props.fund2,
      props.fund3,
      props.fund4,
      props.fund5,
      props.fund6,
      props.fund7,
      props.fund8,
      props.fund9,
      props.fund10,
    ];
    let total = 0;
    for (const count of counts) {
      offsets.push(total);
      total += count;
    }
    const fontSize =
      total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
    const r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
    const r0 = Math.round(r * 0.6);
    const w = r * 2;

    let html = `<div>
  <svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`;

    for (let i = 0; i < counts.length; i++) {
      html += donutSegment(
        offsets[i] / total,
        (offsets[i] + counts[i]) / total,
        r,
        r0,
        colors[i]
      );
    }
    html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
  <text dominant-baseline="central" transform="translate(${r}, ${r})">
  ${total.toLocaleString()}
  </text>
  </svg>
  </div>`;

    const el = document.createElement("div");
    el.innerHTML = html;
    return el.firstChild;
  }

  function donutSegment(start, end, r, r0, color) {
    if (end - start === 1) end -= 0.00001;
    const a0 = 2 * Math.PI * (start - 0.25);
    const a1 = 2 * Math.PI * (end - 0.25);
    const x0 = Math.cos(a0),
      y0 = Math.sin(a0);
    const x1 = Math.cos(a1),
      y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;

    // draw an SVG path
    return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
      r + r * y0
    } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
      r + r0 * x1
    } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
      r + r0 * y0
    }" fill="${color}" />`;
  }

/******   End of clustering layer ********/


/******   Start of data display ********/
function prepChartData(){
  
  const mapData = JSON.parse(sessionStorage.getItem('search-data'))

  let funds = {
  "affordablerentalhousing" : 0,
  "columbiabasintrust" : 0,
  "communityhousingfund" : 0,
  "deepeningaffordabilityfund" : 0,
  "housinghub" : 0,
  "indigenoushousingfund" : 0,
  "rapidresponsetohomelessness" : 0,
  "regionalhousingfirst" : 0,
  "studenthousingloanprogram" : 0,
  "supportivehousingfund" : 0,
  }
  let clients = {
    "middle-income" : 0,
    "low-tomoderate-income" : 0,
    "verylow-income" : 0,
    "students" : 0,
  }
  let homes = {
  "0-20": 0,
  "21-40": 0,
  "41-60": 0,
  "60+": 0,
  }

  let fundingCount = [];
  let clientCount = [];
  let homeCount = [];

  mapData.forEach((project, i) => {
  fundingCount.push(cleandata(project.properties.fundingProgram));
  clientCount.push(cleandata(project.properties.clientsServed));
  homeCount.push(cleandata(project.properties.numHomes));
  })

  // Count totals in funds
  fundingCount.forEach(el =>{
    for(fund in funds){
      if(fund === el){
      funds[fund] += 1;
      }
    }
  })
  // Count totals in clients
  clientCount.forEach(el =>{
    for(client in clients){
      if(client === el){
      clients[client] += 1;
      }
    }
  })
  // Count totals in homes
  homeCount.forEach(el =>{
    const val = parseInt(el);
    if(val <= 20)homes["0-20"] +=1;
    else if(el > 20 && el <= 40) homes["21-40"] +=1;
    else if(el > 40 && el <= 60) homes["41-60"] +=1;
    else homes["60+"] +=1;
  })
  buildCharts(funds,clients,homes)
}

function buildCharts(funds,clients,homes){


  Chart.defaults.color = "white";
  console.log(Chart.overrides["doughnut"].plugins.legend)
  const fundLabels = [
    'Affordable Rental Housing',
    'Columbia Basin Trust',
    'Community Housing Fund',
    'Deepening Affordability Fund',
    'HousingHub',
    'Indigenous Housing Fund',
    'Rapid Response to Homelessness',
    'Regional Housing First',
    'Student Housing Loan Program',
    'Supportive Housing Fund',
  ];

  const clientLabels = [
    'Middle-income',
    'Low- to moderate-income',
    'Very low-income',
    'Students',
  ];


  const homesLabels = [
    '1-20 Homes',
    '21-40 Homes',
    '41-60 Homes',
    '60+ Homes',
  ];


  const fundData = {
    labels: fundLabels,
    datasets: [{
      label: 'Fund breakdown',
      backgroundColor: '#fff',
      backgroundColor: [
        colors[0],
        colors[1],
        colors[2],
        colors[3],
        colors[4],
        colors[5],
        colors[6],
        colors[7],
        colors[8],
        colors[9],
      ],
      data: [funds['affordablerentalhousing'], funds['columbiabasintrust'],funds['communityhousingfund'],funds['deepeningaffordabilityfund'],funds['housinghub'],funds['indigenoushousingfund'],funds['rapidresponsetohomelessness'],funds['regionalhousingfirst'],funds['studenthousingloanprogram'],funds['supportivehousingfund'], ],
    }]
  };

  const clientData = {
    labels: clientLabels,
    datasets: [{
      label: 'Fund breakdown',
      backgroundColor: '#fff',
      backgroundColor: [
        colors[0],
        colors[1],
        colors[2],
        colors[3],
      ],
      data: [clients['middle-income'], clients['low-tomoderate-income'],clients['verylow-income'],clients['students'], ],
    }]
  };

  const homesData = {
    labels: homesLabels,
    datasets: [{
      backgroundColor: '#fff',
      backgroundColor: [
        colors[0],
        colors[1],
        colors[2],
        colors[3],
      ],
      data: [homes['0-20'], homes['21-40'],homes['41-60'],homes['60+'], ],
    }]
  };

  const fundconfig = {
    type: 'doughnut',
    data: fundData,
    options: {
      plugins: { legend: { display: false }, },
     maintainAspectRatio: false,
   },
  };

  const clientConfig = {
    type: 'doughnut',
    data: clientData,
    options: {
       plugins: { legend: { display: false }, },
      maintainAspectRatio: false,
    },

  };

  const homesConfig = {
    type: 'bar',
    data: homesData,
    options: {
      plugins: { legend: { display: false }, },
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'probability'
          }
        }]
      }
    },
  };



  dataCtn.innerHTML = `
  

  <div class="chart-ctn">
  <span class="chart-title">Funding Programs</span>
  <canvas id="fundChart"></canvas>
</div>
<div class="chart-ctn">
<span class="chart-title">Income Levels</span>
  <canvas id="clientChart"></canvas>
  </div>
  <div class="chart-ctn bar-chart">
  <span class="chart-title">No. of homes</span>
  <canvas id="homesChart"></canvas>
</div>
`


  const fundChart = new Chart(
    document.getElementById('fundChart'),
    fundconfig
  );


  const clientChart = new Chart(
    document.getElementById('clientChart'),
    clientConfig
  );

  const homesChart = new Chart(
    document.getElementById('homesChart'),
    homesConfig
  );

}


dataBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
   initCharts()
}) 


function initCharts(e){
  if(e){
    prepChartData();
    dataBtnCtn.classList.add("border-highlight")

  }
  else if(chartControl === true){
    toggleChartElements()    
    chartControl = false
    dataBtnCtn.classList.remove("border-highlight")
 
  } else{
    toggleChartElements()  
        dataBtnCtn.classList.add("border-highlight") 
    chartControl = true 
    prepChartData();
  }
}

function toggleChartElements(){
  chartControl ? dataCtn.style.display = "none" : dataCtn.style.display = "flex";
  }

function cleandata(str){
  return str.toLowerCase().replace(/ /g,'')
}


});


