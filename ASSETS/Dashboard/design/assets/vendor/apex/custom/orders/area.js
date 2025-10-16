var options = {
  series: [{
    name: 'Visitors',
    data: [70, 80, 90, 80, 90, 80, 90, 80, 90, 80, 90, 80]
  }, {
    name: 'Orders',
    data: [60, 70, 80, 70, 80, 70, 80, 70, 80, 70, 80, 70]
  }],
  chart: {
    height: 350,
    type: 'area',
    toolbar: {
      show: false
    },
    sparkline: {
      enabled: false,
    },
  },
  colors: [
    "#297372",
    "#17b04f",
    "#8FE6E4"],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  yaxis: {
    show: true,
    labels: {
      show: true,
      minWidth: 19,
      maxWidth: 19,
      offsetX: -5,
    },
  },
  legend: {
    show: true,
    offsetY: 10,
    itemMargin: {
      horizontal: 10,
      vertical: 10,
    },
  },
  xaxis: {
    labels: {
      minHeight: 22,
      maxHeight: 22,
      show: true,
    },
    lines: {
      show: false,
    },
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  grid: {
    show: false,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: "vertical",
      shadeIntensity: 0,
      gradientToColors: undefined,
      inverseColors: true,
      opacityFrom: .4,
      opacityTo: .1,
      stops: [0, 50, 80],
      colors: [
        "#297372",
        "#17b04f",
        "#8FE6E4"]
    }
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

var chart = new ApexCharts(document.querySelector("#orders"), options);

chart.render();