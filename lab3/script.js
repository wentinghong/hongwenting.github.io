// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoiaG9uZ3dlbnRpbmciLCJhIjoiY202NmozN3Y0MDB0ZjJqcXo4NWwwdDQ2aSJ9.p3HKvSnXtHRn0xexWACCbw";

const map = new mapboxgl.Map({
  container: "map", // container element id
  style: "mapbox://styles/mapbox/light-v10",
  center: [-0.089932, 51.514442],
  zoom: 14
});

const data_url =
  "https://api.mapbox.com/datasets/v1/hongwenting/cm6glkmki08bm1nn2pcxv2fcl/features?access_token=pk.eyJ1IjoiaG9uZ3dlbnRpbmciLCJhIjoiY202NmozN3Y0MDB0ZjJqcXo4NWwwdDQ2aSJ9.p3HKvSnXtHRn0xexWACCbw";

// Everything will go into this map.on()
map.on("load", () => {
  map.addLayer({
    id: "crimes",
    type: "circle",
    source: {
      type: "geojson",
      data: data_url
    },
    paint: {
      "circle-radius": 10,
      "circle-color": "#eb4d4b",
      "circle-opacity": 0.9
    }
  });

  // Create a popup for displaying crime information
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // Hover interaction: Show popup on mouseenter
  map.on("mouseenter", "crimes", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["crimes"]
    });

    if (!features.length) return;

    const feature = features[0];

    // Set the content of the popup
    popup
      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `<strong>Crime Type:</strong> ${feature.properties["Crime type"]}<br>
         <strong>Month:</strong> ${feature.properties["Month"]}`
      )
      .addTo(map);
  });

  // Hide popup on mouseleave
  map.on("mouseleave", "crimes", () => {
    popup.remove();
  });

  // Slider interaction code
  let filterType = ["!=", ["get", "Crime type"], "placeholder"];
  let filterMonth = ["!=", ["get", "Month"], "2023-01"];

  map.setFilter("crimes", ["all", filterMonth, filterType]);

  document.getElementById("slider").addEventListener("input", (event) => {
    // Get the month value from the slider
    const month = parseInt(event.target.value);

    // Get the correct format for the data
    const formatted_month = "2023-" + ("0" + month).slice(-2);

    // Create a new filter for the month
    filterMonth = ["==", ["get", "Month"], formatted_month];

    // Set the new filter on the map
    map.setFilter("crimes", ["all", filterMonth, filterType]);

    // Update the text in the UI
    document.getElementById("active-month").innerText = month;
  });

  // Radio button interaction code
  document.getElementById("filters").addEventListener("change", (event) => {
    const type = event.target.value;
    console.log(type);

    // Update the map filter based on the selected crime type
    if (type == "all") {
      filterType = ["!=", ["get", "Crime type"], "placeholder"];
    } else if (type == "shoplifting") {
      filterType = ["==", ["get", "Crime type"], "Robbery"];
    } else if (type == "drugs") {
      filterType = ["==", ["get", "Crime type"], "Drugs"];
    } else {
      console.log("error");
    }

    // Apply the filter to the map
    map.setFilter("crimes", ["all", filterMonth, filterType]);
  });
});