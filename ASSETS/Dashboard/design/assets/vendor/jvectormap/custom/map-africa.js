// Africa
$(function () {
  $("#mapAfrica").vectorMap({
    map: "africa_mill",
    backgroundColor: "transparent",
    scaleColors: ["#297372", "#333333"],
    zoomOnScroll: false,
    zoomMin: 1,
    hoverColor: true,
    series: {
      regions: [
        {
          values: gdpData,
          scale: ["#297372", "#333333"],
          normalizeFunction: "polynomial",
        },
      ],
    },
  });
});
