// Morris Donut
Morris.Donut({
  element: "donutColors",
  data: [
    { value: 30, label: "foo" },
    { value: 15, label: "bar" },
    { value: 10, label: "baz" },
    { value: 5, label: "A really really long label" },
  ],
  labelColor: "#507D0C",
  colors: ["#006445",
    "#107052",
    "#207D60",
    "#30896D",
    "#3F957A",
    "#4FA288",
    "#5FAE95"],
  resize: true,
  hideHover: "auto",
  gridLineColor: "#ccd2da",
  formatter: function (x) {
    return x + "%";
  },
});
