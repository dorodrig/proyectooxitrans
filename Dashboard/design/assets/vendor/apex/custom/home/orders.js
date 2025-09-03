var options = {
  chart: {
    height: 232,
    type: "bar",
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "40px",
      distributed: true,
      borderRadius: 2,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 1,
    colors: ["#297372",
      "#368180",
      "#43908F",
      "#4F9E9D",
      "#5CADAB",
      "#69BBB9",
      "#76C9C8",
      "#82D8D6",
      "#8FE6E4"],
  },
  series: [
    {
      name: "New",
      data: [5000, 4000, 3000, 2000],
    },
  ],
  legend: {
    show: false,
  },
  xaxis: {
    categories: ["Sales", "Visits", "Income", "Revenue"],
  },
  yaxis: {
    show: false,
  },
  fill: {
    opacity: 1,
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return +val;
      },
    },
  },
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
      left: 0,
    },
  },
  colors: ["#297372",
    "#368180",
    "#43908F",
    "#4F9E9D",
    "#5CADAB",
    "#69BBB9",
    "#76C9C8",
    "#82D8D6",
    "#8FE6E4"],
};
var chart = new ApexCharts(document.querySelector("#ordersData"), options);
chart.render();
