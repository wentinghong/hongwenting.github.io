mapboxgl.accessToken =
  "pk.eyJ1IjoiaG9uZ3dlbnRpbmciLCJhIjoiY202NmozN3Y0MDB0ZjJqcXo4NWwwdDQ2aSJ9.p3HKvSnXtHRn0xexWACCbw";

// Default map centre
const defaultCenter = [118.0, 26.0];
const defaultZoom = 6.2;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11?language=en",
  center: [118.0, 26.0],
  zoom: 6.2
});

// Add map navigation controls
map.addControl(new mapboxgl.NavigationControl(), "top-left");

//**Add reset button**
document.getElementById("reset-button").addEventListener("click", () => {
  map.flyTo({ center: defaultCenter, zoom: defaultZoom });
});

//Filling the map
function addFujianBoundary() {
  if (!map.getSource("fujian-boundary")) {
    map.addSource("fujian-boundary", {
      type: "vector",
      url: "mapbox://hongwenting.7saxu4ta"
    });
    map.addLayer({
      id: "fujian-fill",
      type: "fill",
      source: "fujian-boundary",
      "source-layer": "Fujian_con-d5fpxv",
      paint: {
        "fill-color": "#A0C4FF",
        "fill-opacity": 0
      }
    });

    // **Default status: Points of interest map visible**
    let isSpotsVisible = true;

    // **Image mapping corresponding to urban areas**
    const cityImages = {
      Zhangzhou:
        "https://th.bing.com/th/id/R.991ae39a1f0a676a89732edf6b54f3af?rik=d5dY3g%2bmiyukMw&pid=ImgRaw&r=0",
      Fuzhou:
        "https://th.bing.com/th/id/OIP.AUrWshEv_fSq9WFzYODRaAHaE8?rs=1&pid=ImgDetMain",
      Xiamen:
        "https://tr-osdcp.qunarzz.com/tr-osd-tr-manager/img/7671fd3c5dca3d3d9e3fbab33d07f01f.jpg",
      Quanzhou:
        "https://th.bing.com/th/id/R.b9fc0f114c5a1a0b01891ebac510531b?rik=b3CH3I%2b1bY7XQw&pid=ImgRaw&r=0",
      Putian:
        "https://th.bing.com/th/id/R.d7b2a53596a5490e864f8d2d2be3ae4d?rik=qXGGO1iHastZ4A&riu=http%3a%2f%2fsohu-media.bjcnc.scs.sohucs.com%2fUAV%2ff06fb8647bb2098486330bbf735a3237.jpg&ehk=IRMPBPb%2bjmedYvUxYN4JfwPGH2p0nCHBt4o12KB8n7A%3d&risl=&pid=ImgRaw&r=0",
      Sanming:
        "https://x0.ifengimg.com/res/2020/FCA0EEE8D6809BC1FEC1202B00FA66E8B1719BFE_size561_w1270_h847.jpeg",
      Nanping:
        "https://th.bing.com/th/id/OIP.L-WSH06_JB9t16Szk6ARsgHaE7?rs=1&pid=ImgDetMain",
      Longyan:
        "https://youimg1.c-ctrip.com/target/fd/tg/g2/M08/8E/D6/CghzgFWxEJWAA__fAD-EwOqGdxg058_D_10000_1200.jpg?proc=autoorient",
      Ningde:
        "https://upload.wikimedia.org/wikipedia/commons/4/44/Ningde_City.jpg"
    };

    // **Pop-up details when clicking on downtown**
    map.on("click", (e) => {
      if (isSpotsVisible) return; // **No downtown clicks triggered when point is visible**

      const features = map.queryRenderedFeatures(e.point, {
        layers: ["fujian-fill"]
      });

      if (features.length > 0) {
        const city = features[0].properties;
        const cityName = city.name;

        // **Display pictures only if available**
        let imageHTML = "";
        if (cityImages[cityName]) {
          imageHTML = `<img src="${cityImages[cityName]}" alt="${cityName}" style="width: 100%; height: auto; border-radius: 8px; margin-top: 5px;">`;
        }

        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<div style="max-width: 300px; max-height: 350px; overflow-y: auto; padding-right: 5px;">
          <h3>${cityName}</h3>
          <p><strong>Adcode:</strong> ${city.adcode}</p>
          ${imageHTML} <!>
          <div style="max-height: 180px; overflow-y: auto; padding-right: 5px;">
            <p>${city.Intro}</p>
          </div>
        </div>`
          )
          .addTo(map);
      }
    });

    // **Toggle point layer**
    document.getElementById("toggle-spots").addEventListener("click", () => {
      isSpotsVisible = !isSpotsVisible;

      // **Toggle point layer visibility**
      if (map.getLayer("spots")) {
        map.setLayoutProperty(
          "spots",
          "visibility",
          isSpotsVisible ? "visible" : "none"
        );
      }

      document.getElementById("toggle-spots").textContent = isSpotsVisible
        ? "Hide Spots"
        : "Show Spots";

      // **Toggle downtown fill transparency**
      if (map.getLayer("fujian-fill")) {
        map.setPaintProperty(
          "fujian-fill",
          "fill-opacity",
          isSpotsVisible ? 0 : 0.3
        );
      }

      // **Highlight downtown on mouse hover (only works when point is hidden)**
      if (!isSpotsVisible) {
        map.on("mousemove", highlightCity);
      } else {
        map.off("mousemove", highlightCity);
        map.setPaintProperty("fujian-fill", "fill-color", "#A0C4FF"); // Restore default colours
      }
    });

    // **Highlight downtown area on mouse hover**
    function highlightCity(e) {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["fujian-fill"]
      });

      if (features.length > 0) {
        const cityName = features[0].properties.name;
        map.getCanvas().style.cursor = "pointer";

        // **Highlight current downtown area**
        map.setPaintProperty("fujian-fill", "fill-color", [
          "match",
          ["get", "name"],
          cityName,
          "#ff4d4d", // **Mouse over red **
          "#A0C4FF" // **Default light blue**
        ]);
      } else {
        map.getCanvas().style.cursor = "";
        map.setPaintProperty("fujian-fill", "fill-color", "#A0C4FF"); // Restore default colours
      }
    }

    // **Add boundary line**
    map.addLayer({
      id: "fujian-border",
      type: "line",
      source: "fujian-boundary",
      "source-layer": "Fujian_con-d5fpxv",
      paint: {
        "line-color": "#000000",
        "line-width": 1.5,
        "line-opacity": 0.8
      }
    });

    console.log("✅ ");
  }
}

// **Fujian border loaded after map loaded**
map.on("load", () => {
  console.log("✅");
  addFujianBoundary();
});

// **Fujian local time**
const timeDiv = document.getElementById("time-box");
function updateTime() {
  const now = new Date();
  const options = {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  };
  timeDiv.innerText =
    "Fujian Time: " + new Intl.DateTimeFormat("zh-CN", options).format(now);
}
setInterval(updateTime, 1000);
updateTime();

// **Load data for Fujian Attractions**
const data_url =
  "https://api.mapbox.com/datasets/v1/hongwenting/cm77vxgqb6yr41oocbmmmekv0/features?access_token=" +
  mapboxgl.accessToken;

let geojsonData = null;
let clickPopup = new mapboxgl.Popup({ closeButton: true, closeOnClick: true });
let hoverPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

async function fetchAndProcessData() {
  try {
    const response = await fetch(data_url);
    const data = await response.json();
    geojsonData = data;
    updateLayer("all");
    populateScenicList();
  } catch (error) {
    console.error("❌", error);
  }
}

// **Update map attraction layers**
function updateLayer(classA = "all") {
  if (!geojsonData) return;

  if (map.getLayer("spots")) {
    map.removeLayer("spots");
    map.removeSource("spots");
  }

  const filteredData = {
    type: "FeatureCollection",
    features:
      classA === "all"
        ? geojsonData.features
        : geojsonData.features.filter(
            (feature) => feature.properties["Class A"] === classA
          )
  };

  map.addSource("spots", { type: "geojson", data: filteredData });
  // make the points colorful
  map.addLayer({
    id: "spots",
    type: "circle",
    source: "spots",
    paint: {
      "circle-radius": 6,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#FFFFFF",
      "circle-color": [
        "match",
        ["get", "Class A"],
        "5A",
        "#FF5733",
        "4A",
        "#FFA500",
        "3A",
        "#FFD700",
        "2A",
        "#32CD32",
        "#007AFF"
      ]
    }
  });
  // **Mouse hover to display the name of the scenic spot**
  map.on("mouseenter", "spots", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    hoverPopup
      .setLngLat(coordinates)
      .setHTML(`<strong>${properties["Scenic area unit"]}</strong>`)
      .addTo(map);
  });

  map.on("mouseleave", "spots", () => {
    hoverPopup.remove();
  });

  // **Click on the attraction to display detailed information**
  map.on("click", "spots", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    const popupContent = `
      <div class="popup-content">
        <strong>${properties["Scenic area unit"]}</strong><br>
        Class A: ${properties["Class A"]}<br>
        Province: ${properties["provincial"]}<br>
        Address: ${properties["address"]}
      </div>
    `;

    clickPopup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
  });
}

// **Search function**
function updateSearchResults() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  const resultsList = document.getElementById("search-results");

  resultsList.innerHTML = "";
  if (!searchTerm || !geojsonData) {
    resultsList.style.display = "none";
    return;
  }

  const matchedSpots = geojsonData.features.filter((feature) =>
    feature.properties["Scenic area unit"].toLowerCase().includes(searchTerm)
  );

  if (matchedSpots.length > 0) {
    resultsList.style.display = "block";
    matchedSpots.forEach((spot) => {
      const listItem = document.createElement("li");
      listItem.textContent = spot.properties["Scenic area unit"];
      listItem.addEventListener("click", () => {
        showScenicSpot(spot);
        resultsList.style.display = "none";
      });
      resultsList.appendChild(listItem);
    });
  } else {
    resultsList.style.display = "none";
  }
}

// **Click on the search result to fly to the attraction**
function showScenicSpot(spot) {
  const coordinates = spot.geometry.coordinates;
  const properties = spot.properties;

  const popupContent = `
    <div class="popup-content">
      <strong>${properties["Scenic area unit"]}</strong><br>
      Class A: ${properties["Class A"]}<br>
      Province: ${properties["provincial"]}<br>
      Address: ${properties["address"]}
    </div>
  `;

  clickPopup.setLngLat(coordinates).setHTML(popupContent).addTo(map);
  map.flyTo({ center: coordinates, zoom: 12 });
}

// **Load the list of names of scenic spots**
function populateScenicList() {
  const listContainer = document.getElementById("scenic-list");
  listContainer.innerHTML = "";

  geojsonData.features.forEach((spot) => {
    const listItem = document.createElement("li");
    listItem.textContent = spot.properties["Scenic area unit"];
    listItem.addEventListener("click", () => {
      showScenicSpot(spot);
    });
    listContainer.appendChild(listItem);
  });
}

// **Listening to Class A selection**
document
  .getElementById("class-dropdown")
  .addEventListener("change", (event) => updateLayer(event.target.value));

// **Load data**
map.on("load", async () => {
  await fetchAndProcessData();
  document
    .getElementById("search-input")
    .addEventListener("input", updateSearchResults);

  // **Global variables**
  let startCoordinates = null;
  let endCoordinates = null;
  let selectedInput = null; // Record the currently selected input box

  const startInput = document.getElementById("start-input");
  const endInput = document.getElementById("end-input");
  const startResults = document.createElement("ul");
  const endResults = document.createElement("ul");

  startResults.classList.add("autocomplete-results");
  endResults.classList.add("autocomplete-results");

  startInput.parentNode.appendChild(startResults);
  endInput.parentNode.appendChild(endResults);

  // **Listen to the input box and show the matching attractions**
  function updateAutocomplete(input, resultsList) {
    const searchTerm = input.value.toLowerCase();
    resultsList.innerHTML = ""; // Clear old options

    if (!searchTerm || !geojsonData) return;

    const matchedSpots = geojsonData.features.filter((spot) =>
      spot.properties["Scenic area unit"].toLowerCase().includes(searchTerm)
    );

    if (matchedSpots.length > 0) {
      resultsList.style.display = "block";

      matchedSpots.forEach((spot) => {
        const listItem = document.createElement("li");
        listItem.textContent = spot.properties["Scenic area unit"];
        listItem.addEventListener("click", () => {
          input.value = spot.properties["Scenic area unit"];
          resultsList.style.display = "none"; // Hide when selected

          if (input === startInput) {
            startCoordinates = spot.geometry.coordinates;
          } else {
            endCoordinates = spot.geometry.coordinates;
          }
        });

        resultsList.appendChild(listItem);
      });
    }
  }

  // **Listening to input changes**
  startInput.addEventListener("input", () =>
    updateAutocomplete(startInput, startResults)
  );
  endInput.addEventListener("input", () =>
    updateAutocomplete(endInput, endResults)
  );

  // **Listening to map click events, allowing only scenic points to be selected as start or end points**
  map.on("click", (e) => {
    if (!geojsonData) return;

    // **Find the nearest point of interest to the clicked location**
    let closestSpot = null;
    let minDistance = Infinity;

    geojsonData.features.forEach((spot) => {
      const spotCoords = spot.geometry.coordinates;
      const distance = Math.sqrt(
        Math.pow(spotCoords[0] - e.lngLat.lng, 2) +
          Math.pow(spotCoords[1] - e.lngLat.lat, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestSpot = spot;
      }
    });

    // **Set a distance threshold to ensure that points must be within reasonable range**
    const distanceThreshold = 0.05; // Maximum distance allowed to select the nearest point
    if (closestSpot && minDistance < distanceThreshold) {
      const coordinates = closestSpot.geometry.coordinates;
      const spotName = closestSpot.properties["Scenic area unit"];

      if (selectedInput === "start") {
        startCoordinates = coordinates;
        startInput.value = `${spotName}`;
      } else if (selectedInput === "end") {
        endCoordinates = coordinates;
        endInput.value = `${spotName}`;
      }
    }
  });

  // **Select current input box**
  startInput.addEventListener("focus", () => (selectedInput = "start"));
  endInput.addEventListener("focus", () => (selectedInput = "end"));

  // **Calculation of the optimal route**
  async function getRoute() {
    if (!startCoordinates || !endCoordinates) {
      alert("Please select both a start and an end location.");
      return;
    }

    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

    try {
      const response = await fetch(directionsUrl);
      const data = await response.json();

      if (data.routes.length === 0) {
        alert("No route found!");
        return;
      }

      const route = data.routes[0].geometry;
      const distance = data.routes[0].distance / 1000;
      const duration = data.routes[0].duration / 60;

      if (map.getSource("route")) {
        map.removeLayer("route-layer");
        map.removeSource("route");
      }

      map.addSource("route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: route }
      });

      map.addLayer({
        id: "route-layer",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#007AFF", "line-width": 5, "line-opacity": 0.8 }
      });

      map.fitBounds([startCoordinates, endCoordinates], { padding: 50 });

      //**Display of route information at the starting point**
      new mapboxgl.Popup()
        .setLngLat(startCoordinates)
        .setHTML(
          `
        <div style="max-width: 250px;">
          <h3>Route Information</h3>
          <p><strong>Distance:</strong> ${distance.toFixed(2)} km</p>
          <p><strong>Estimated Time:</strong> ${duration.toFixed(2)} min</p>
        </div>
      `
        )
        .addTo(map);

      // **Automatic clearing of input boxes**
      setTimeout(() => {
        startInput.value = "";
        endInput.value = "";
        startCoordinates = null;
        endCoordinates = null;
      }, 60000);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  }

  // **Clear all inputs and routes**
  function clearRoute() {
    startInput.value = "";
    endInput.value = "";
    startCoordinates = null;
    endCoordinates = null;

    if (map.getSource("route")) {
      map.removeLayer("route-layer");
      map.removeSource("route");
    }
  }

  // **Listen for the ‘Get Route’ button **
  document.getElementById("get-route").addEventListener("click", getRoute);

  // **Listening for the ‘Clear’ button**
  document.getElementById("clear-route").addEventListener("click", clearRoute);
});