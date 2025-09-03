var options = {
  series: [
    {
      name: "Sales",
      type: "area",
      data: [70, 80, 90, 80, 90, 80, 90, 80, 90, 80, 90, 80],
    },
    {
      name: "Income",
      type: "line",
      data: [60, 70, 80, 70, 80, 70, 80, 70, 80, 70, 80, 70],
    },
  ],
  chart: {
    height: 320,
    type: "area",
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  stroke: {
    width: [0, 4],
    curve: "smooth",
  },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1],
  },
  labels: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ],
  grid: {
    borderColor: "#ccd2da",
    strokeDashArray: 3,
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: false,
      },
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 30,
    },
  },
  colors: ["#9bcecd", "#297372"],
  xaxis: {
    type: "day",
  },
};

var chart = new ApexCharts(document.querySelector("#salesIncome"), options);
chart.render();
