// Europe
$(function () {
	$("#mapEurope").vectorMap({
		map: "europe_mill",
		zoomOnScroll: false,
		series: {
			regions: [
				{
					values: gdpData,
          scale: ["#297372", "#333333"],
					normalizeFunction: "polynomial",
				},
			],
		},
		backgroundColor: "transparent",
	});
});
