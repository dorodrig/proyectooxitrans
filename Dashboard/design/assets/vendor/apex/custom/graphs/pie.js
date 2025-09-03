var options = {
  chart: {
    width: 300,
    type: "pie",
  },
  labels: ["Team A", "Team B", "Team C", "Team D", "Team E"],
  series: [20, 20, 20, 20, 20],
  legend: {
    position: "bottom",
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 0,
  },
  colors: ["#006445",
    "#107052",
    "#207D60",
    "#30896D",
    "#3F957A",
    "#4FA288",
    "#5FAE95"],
};
var chart = new ApexCharts(document.querySelector("#pie"), options);
chart.render();
