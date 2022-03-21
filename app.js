
mapboxgl.accessToken = 'pk.eyJ1IjoiamFja3JlaWNoIiwiYSI6ImNrdnlyMThpcGEyY3gyb3ExaWp6aWZoZnQifQ.h5lp-DoUuRpv9XtedzXMKQ';

const loadOverlay = document.querySelector(".load-overlay");
const getSidebar = document.querySelector(".sidebar");
const getInfoMenu = document.querySelector("#info-menu");
const getMap = document.querySelector(".map");
const infoCtn = document.querySelector('aside');
const infoCross = document.querySelector(".info-dec img");
const resetBtn = document.querySelector("#reset-btn");




infoCross.addEventListener("click", function(){
  infoCtn.style.display = "none";
})



const defaulPinImg = {
  name:'blue-icon',
  path: './img/logos/BCH_Icon_Colour_RGB.png'
}



let clusterView = false;


// Filtering map markers
const layerIDs = []; // This array will contain a list used to filter against.
const searchbox = document.querySelector('input[name="search"]');
const mapContainer = document.querySelector('.map');
const sidebarContainer = document.querySelector('.sidebar');
const clusterBtn = document.querySelector('#cluster-btn');



/**
 * Add the map to the page
 */
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
    center: [-127.647621, 53.726669], // starting position [lng, lat]
    zoom: 5 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());


const fund1 = ['match', ['get', 'fundingProgram'], 'Affordable Rental Housing', true, false];
const fund2 = ['match', ['get', 'fundingProgram'], 'Columbia Basin Trust', true, false];
const fund3 = ['match', ['get', 'fundingProgram'], 'Community Housing Fund', true, false];
const fund4 = ['match', ['get', 'fundingProgram'], 'Deepening Affordability Fund', true, false];
const fund5 = ['match', ['get', 'fundingProgram'], 'HousingHub', true, false];
const fund6 = ['match', ['get', 'fundingProgram'], 'Indigenous Housing Fund', true, false];
const fund7 = ['match', ['get', 'fundingProgram'], 'Rapid Response to Homelessness', true, false];
const fund8 = ['match', ['get', 'fundingProgram'], 'Regional Housing First Program', true, false];
const fund9 = ['match', ['get', 'fundingProgram'], 'Student Housing Loan Program', true, false];
const fund10 = ['match', ['get', 'fundingProgram'], 'Supportive Housing Fund', true, false];


// colors to use for the categories
const colors = ['rgba(0, 112, 95, 1)', 'rgba(99, 105, 209, 1)', 'rgba(239, 71, 111, 1)', 'rgba(66, 217, 200, 1)', 'rgba(255, 238, 242, 1)', 'rgb(159, 61, 149)', 'rgba(251, 175, 0, 1)', 'rgba(194, 232, 18, 1)', 'rgba(46, 192, 249, 1)','rgb(131, 164, 56)'];

async function getHomesData(){

const testData = await fetch (`https://api.mapbox.com/datasets/v1/jackreich/ckvzs4z2x2hka28nz88oijx2i/features?access_token=pk.eyJ1IjoiamFja3JlaWNoIiwiYSI6ImNrdnlyNDFzbzZncXUybm51aGR4dmViN2wifQ.ZKSMNm2U-vs95ClInj5muA`);
// const testData = await fetch ('./features.geojson');
 
const retreivedData = await testData.json();
return retreivedData;
}


map.on('load', () => {
      getHomesData().then(homes =>{     
    const stores = homes;
    stores.features.forEach((store, i) => {
        store.properties.id = i;
        store.properties.searchName = cleanInput(store.properties.name);
      });

      sidebarContainer.style.opacity = "1";
      mapContainer.style.opacity = "1";
    

    
        map.loadImage(defaulPinImg.path, (error, image) => {
          if (error) {
            throw error
          }
          map.addImage(defaulPinImg.name, image, { 'sdf': false }); 
        }); 



    map.addSource('places', {
                'type': 'geojson',
                'data': stores,
                // cluster: true,
                // clusterMaxZoom: 14, // Max zoom to cluster points on
                // clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
              });

              for (const feature of stores.features) {
const name = cleanInput(feature.properties.name);
const layerID = name;
 
// Add a layer for this symbol type if it hasn't been added already.
if (!map.getLayer(layerID)) {
map.addLayer({
'id': layerID,
'type': 'symbol',
'source': 'places',

'layout': {
  'icon-image': [
    'match',
    ['get', 'fundingProgram'],
    'Affordable Rental Housing',
    'blue-icon',
    // 'Columbia Basin Trust',
    // 'red-icon',
    // 'Community Housing Fund',
    // 'green-icon',
    'blue-icon'
  ],
  'icon-size': 0.3,
  // "icon-image": "accessible",
  'icon-allow-overlap': true
 
  },  
'filter': ['==', 'searchName', name]  
});
layerIDs.push(layerID);
}
}

if(layerIDs){
  loadOverlay.style.display = "none";
  infoCtn.style.transform = "translateY(-500px)";
  resetBtn.addEventListener("click", function(e){
    resetSearch(e);
  });
}

map.addSource('clustered-places', {
  'type': 'geojson',
  'data': stores,
  'cluster': true,
  'clusterRadius': 80,
  'clusterProperties': {
  // keep separate counts for each magnitude category in a cluster
  'fund1': ['+', ['case', fund1, 1, 0]],
  'fund2': ['+', ['case', fund2, 1, 0]],
  'fund3': ['+', ['case', fund3, 1, 0]],
  'fund4': ['+', ['case', fund4, 1, 0]],
  'fund5': ['+', ['case', fund5, 1, 0]],
  'fund6': ['+', ['case', fund6, 1, 0]],
  'fund7': ['+', ['case', fund7, 1, 0]],
  'fund8': ['+', ['case', fund8, 1, 0]],
  'fund9': ['+', ['case', fund9, 1, 0]],
  'fund10': ['+', ['case', fund10, 1, 0]],
}
});

map.addLayer({
  'id': 'clusters',
  'type': 'circle',
  'source': 'clustered-places',
  'layout': {
    // Make the layer visible by default.
    'visibility': 'none',
    },
  'filter': ['!=', 'cluster', true],
  'paint': {
  'circle-color': [
  'case',
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
  colors[0]
  ],
  // 'circle-opacity': 0.6,
  // 'circle-radius': 12
  }
  });

  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'clustered-places',
    layout: {
      // Make the layer visible by default.
      'visibility': 'none',
      },
      'filter': ['!=', 'cluster', true],
    paint: {
    'circle-color': '#11b4da',
    'circle-radius': 4,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff'
    }
    });
  


// objects for caching and keeping track of HTML marker objects (for performance)
const markers = {};
let markersOnScreen = {};
 
function updateMarkers() {
const newMarkers = {};
const features = map.querySourceFeatures('clustered-places');
 
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
element: el
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
map.on('render', () => {
if (!map.isSourceLoaded('clustered-places')) return;
updateMarkers();
});

/***** Clustering Layer ******/
function displayClusters(e, layerIDs){
  e.preventDefault();
  e.stopPropagation();

  if(clusterView === false){
    clusterView = true;
  for (const layerID of layerIDs) {
    map.setLayoutProperty(
    layerID,
    'visibility',
    'none'  
    );
    }
    map.setLayoutProperty(
      'clusters',
      'visibility',
      'visible'
      );
    map.setLayoutProperty(
      'unclustered-point',
      'visibility',
      'visible'
      );
      clusterBtn.textContent = "Uncluster";

    } else{
      clusterView = false;
      for (const layerID of layerIDs) {
        map.setLayoutProperty(
        layerID,
        'visibility',
        'visible'  
        );
        }
        map.setLayoutProperty(
          'clusters',
          'visibility',
          'none'
          );
        map.setLayoutProperty(
          'unclustered-point',
          'visibility',
          'none'
          );
          clusterBtn.textContent = "Cluster";
       

    }
 }       
    
            // clustering toggle
  clusterBtn.addEventListener('click', function(e){
  displayClusters(e, layerIDs);
});


          const sortedHomesArray =  stores.features.sort((a, b) => a.properties.name > b.properties.name ? 1 : -1);
            buildSearchResult(sortedHomesArray);     
    /**
     * Add a listing for each store to the sidebar.
     **/
     function buildSearchResult(matchList) {
    
      let getListContainer = document.querySelector('#listings');
      if(getListContainer){
          getListContainer.remove();
      }
      let listDiv = document.createElement("div");
      listDiv.classList.add("listings")
      listDiv.setAttribute("id", "listings");
      getSidebar.appendChild(listDiv);
        for (const store of matchList) {        
          displayHomesList(store)
        }
        
        // Calculate search result projects & homes totals
        document.querySelector("#projects-total").textContent = `${matchList.length}`;
        const homeTotal = matchList.reduce((a,b) => {
         let currentVal = parseInt(b.properties.numHomes);
         return isNaN(currentVal) ?  a : a + currentVal;
        }, 0)
        document.querySelector("#homes-total").textContent = `${homeTotal.toLocaleString('en-US')}`;
    }



    function addMarkers(layerIDs, searchValue, matchList){
      let matchArray = [];
      matchList.forEach(match => {
        matchArray.push(cleanInput(match.properties.name));
      })
  
      for (const layerID of layerIDs) {
      map.setLayoutProperty(
      layerID,
      'visibility',
      'none'  
      );
      }

      for (const match of matchArray) {
        map.setLayoutProperty(
          match,
        'visibility',
        match.includes(searchValue) ? 'visible' : 'none'
        );
        }
    }

    function getSearchParams(){
      let searchValue =  cleanInput(searchbox.value);
     let searchMatches = sortedHomesArray.filter(matchedHome => {
       let regex = new RegExp(`${searchValue}`, 'gi');
       let cleanNames = cleanName(matchedHome.properties.name);
       return cleanNames.match(regex);
     })
     let regionFilter = regionSelct.options[regionSelct.selectedIndex].getAttribute('data-region');
     let fundFilter = fundSelct.options[fundSelct.selectedIndex].getAttribute('data-fund');
     let clientFilter = clientSelct.options[clientSelct.selectedIndex].getAttribute('data-client');
     let matchList = [];
     for (const store of searchMatches) {           
      /* Add a new listing section to the sidebar. */
     let lowerCaseFund = store.properties.fundingProgram.trim().toLowerCase(); 
     let lowerCaseRegion = store.properties.region.trim().toLowerCase();   
     let lowerCaseClients = store.properties.clientsServed.trim().toLowerCase();   


  if(lowerCaseFund === fundFilter && !regionFilter && !clientFilter ) {
        matchList.push(store)
  } 
  else if(!fundFilter && !clientFilter && lowerCaseRegion === regionFilter ) {
    matchList.push(store) 
  } 
  else if(!fundFilter && !regionFilter && lowerCaseClients === clientFilter ) {
    matchList.push(store) 
  } 
  else if(lowerCaseFund === fundFilter && lowerCaseRegion === regionFilter && !clientFilter){
     matchList.push(store)
  }
  else if(lowerCaseFund === fundFilter && lowerCaseClients === clientFilter && !regionFilter){
     matchList.push(store)
  }
  else if(lowerCaseRegion === regionFilter && lowerCaseClients === clientFilter && !fundFilter){
     matchList.push(store)
  } 
  else if(!fundFilter && !regionFilter && !clientFilter){
      matchList.push(store)
  } 
  
    }

     buildSearchResult(matchList); 
     addMarkers(layerIDs,searchValue, matchList); 
   
    }

function displayHomesList(store){
        //   const listings = document.getElementById('listings');
        const listing = listings.appendChild(document.createElement('div'));
        /* Assign a unique `id` to the listing. */
        listing.id = `listing-${store.properties.id}`;
        /* Assign the `item` class to each listing for styling. */
        listing.className = 'item';
       
    
        /* Add the link to the individual listing created above. */
        const link = listing.appendChild(document.createElement('a'));
        link.href = '#';
        link.className = 'title';
      //   link.dataset.fund = `${store.properties.fundingProgram}`  
        link.id = `link-${store.properties.id}`;
        link.innerHTML = `<h3>${store.properties.name}</h3><p class="black">${store.properties.fundingProgram}</p>`;

        /* Add details to the individual listing. */
      //   const details = listing.appendChild(document.createElement('div'));
      //   details.innerHTML = `${store.properties.city}`;
      //   if (store.properties.phone) {
      //     details.innerHTML += ` &middot; ${store.properties.phoneFormatted}`;
      //   }
    
        /**
         * Listen to the element and when it is clicked, do four things:
         * 1. Update the `currentFeature` to the store associated with the clicked link
         * 2. Fly to the point
         * 3. Close all other popups and display popup for clicked store
         * 4. Highlight listing in sidebar (and remove highlight for all other listings)
         **/
        link.addEventListener('click', function () {
          for (const feature of stores.features) {
            if (this.id === `link-${feature.properties.id}`) {
              flyToStore(feature);
              createPopUp(feature);
            }
          }
          const activeItem = document.getElementsByClassName('active');
          if (activeItem[0]) {
            activeItem[0].classList.remove('active');
          }
          this.parentNode.classList.add('active');
          
        });
}


    const fundSelct = document.querySelector("#fund-selct")
    const regionSelct = document.querySelector("#region-selct")
    const clientSelct = document.querySelector("#client-selct")

    fundSelct.addEventListener("change", function(){
    getSearchParams(); 
    })
    regionSelct.addEventListener("change", function(){
      getSearchParams();  
    })
    clientSelct.addEventListener("change", function(){
      getSearchParams();  
    })
    searchbox.addEventListener("keyup", function(e){
      getSearchParams();
  })

  

  function cleanInput(val){
  val = val.toLowerCase().trim();
    if(val.includes("?")){
      val = val.replace(/\?/g, "\\\?");
    } else if (val.includes("-") || val.includes(" ")){
      val = val.replace(/[\- ]/g, "");
    }
    return val;
  }

  function cleanName(name){
   name = name.replace(/[^a-zA-Z0-9\?]/g, "");
    return name;
  }

  // Reset search filters

  function resetSearch(e){
    e.preventDefault();
    e.stopPropagation();
    document.querySelectorAll("form select").forEach(select => select.selectedIndex = 0);
    searchbox.value = "";
    getSearchParams();
  }
   

                 
    // // inspect a cluster on click
    map.on('click', 'clusters', (e) => {
  const features = map.queryRenderedFeatures(e.point, {
    layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('clustered-places').getClusterExpansionZoom(
    clusterId,
    (err, zoom) => {
    if (err) return;
      
    map.easeTo({
    center: features[0].geometry.coordinates,
    zoom: zoom
    });
    }
    );
    });

                
    
// inspect a cluster on click
map.on('click', 'clusters', (e) => {
    const features = map.queryRenderedFeatures(e.point, {
    layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    map.getSource('clustered-places').getClusterExpansionZoom(
    clusterId,
    (err, zoom) => {
    if (err) return;
     
    map.easeTo({
    center: features[0].geometry.coordinates,
    zoom: zoom
    });
    }
    );
});
     
    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
map.on('click', layerIDs, (e) => {
    createPopUp(e.features[0]);
    flyToStore(e.features[0]);
});
     
map.on('mouseenter', layerIDs, () => {
  map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', layerIDs, () => {
  map.getCanvas().style.cursor = '';
});
map.on('mouseenter', 'unclustered-point', () => {
  map.getCanvas().style.cursor = 'pointer';
  });
map.on('mouseleave', 'unclustered-point', () => {
  map.getCanvas().style.cursor = 'pointer';
  });

  });

            /**
     * Use Mapbox GL JS's `flyTo` to move the camera smoothly
     * a given center point.
     **/
    function flyToStore(currentFeature) { 
      if(map.getZoom() < 11){
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 11
      });
    }else {
      map.flyTo({
        center: currentFeature.geometry.coordinates
      });
    }
    }


    function createPopUp(currentFeature) {
      const popUps = document.getElementsByClassName('mapboxgl-popup');
      if (popUps[0]) popUps[0].remove();
      const popup = new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(
      `<div class="pop-title-ctn"><h3>${currentFeature.properties.name}</h3></div><div class="pop-img-ctn"><img class="pop-img" src="./500-robert-nicklin-place.jpg"><div class="pop-home-ctn"><div><span class="home-num">${currentFeature.properties.numHomes}</span><span>Homes</span></div></div></div><div class="pop-location-ctn"><h4><span class="green">Address:</span><br>${currentFeature.properties.address}</h4><h4><span class="green">Region:</span><br>${currentFeature.properties.region}</h4></div><h4><span class="green">Funding Program:</span><br>${currentFeature.properties.fundingProgram}</h4><h4><span class="green">Housing Operator:</span><br>${currentFeature.properties.housingOperator}</h4><h4><span class="green">Clients Served:</span><br>${currentFeature.properties.clientsServed}</h4>`
      )
      .addTo(map);
    }
  

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
  const r =
  total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
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
   
  const el = document.createElement('div');
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





});










