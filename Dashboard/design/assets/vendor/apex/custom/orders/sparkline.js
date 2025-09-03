// Sparkline 1
var options1 = {
  series: [
    {
      name: "Sales",
      data: [0, 25, 10, 40, 25, 55, 30, 65],
    },
  ],
  chart: {
    type: "line",
    height: 90,
    parentHeightOffset: 0,
    sparkline: {
      enabled: true,
    },
    toolbar: {
      show: !1
    },
  },
  stroke: {
    width: 3,
  },
  colors: ["#17b04f"],
  grid: {
    borderColor: "#eeeeee",
    strokeDashArray: 6,
    xaxis: {
      lines: {
        show: !0,
        colors: "#000"
      }
    },
    yaxis: {
      lines: {
        show: !1
      }
    },
    padding: {
      top: -10,
      left: 0,
      right: 0,
      bottom: -10
    },
  },
  markers: {
    size: 3.5,
    fillColor: "#333333",
    strokeColors: "transparent",
    strokeWidth: 3.2,
    discrete: [{
      seriesIndex: 0,
      dataPointIndex: 5,
      fillColor: "#FFFFFF",
      strokeColor: "#17b04f",
      size: 5,
      shape: "circle"
    }],
    hover: {
      size: 5.5
    }
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val;
      },
    },
  },
};
var chart1 = new ApexCharts(document.querySelector("#sparkline1"), options1);
chart1.render();

// Sparkline 2
var options2 = {
  series: [
    {
      name: "Revenue",
      data: [1, 2, 3, 4, 5],
    }
  ],
  chart: {
    type: "bar",
    height: 90,
    sparkline: {
      enabled: true,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: "7",
      borderRadius: 6,
    },
  },
  colors: ["#17b04f", "#ffffff"],
  stroke: {
    width: 0,
  },
  tooltip: {
    fixed: {
      enabled: false,
    },
    x: {
      show: false,
    },
    marker: {
      show: false,
    },
  },
  xaxis: {
    type: "day",
    categories: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val + "K";
      },
    },
  },
};
var chart2 = new ApexCharts(document.querySelector("#sparkline2"), options2);
chart2.render();

// Sparkline 3
var options3 = {
  series: [
    {
      name: "This Week",
      data: [0, 20, 15, 19, 14, 25, 30],
    },
    {
      name: "Last Week",
      data: [0, 8, 19, 13, 26, 16, 25],
    }
  ],
  chart: {
    height: 90,
    type: "line",
    toolbar: {
      show: false,
    },
    sparkline: {
      enabled: true,
    },
  },
  colors: ["#297372", "#17b04f"],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 3,
    colors: ["#297372", "#17b04f"],
  },
  grid: {
    show: false,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return val;
      },
    },
    theme: 'dark',
  },
};

var chart3 = new ApexCharts(document.querySelector("#sparkline3"), options3);
chart3.render();