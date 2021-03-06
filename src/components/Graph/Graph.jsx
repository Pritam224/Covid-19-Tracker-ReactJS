import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";

// https://disease.sh/v3/covid-19/historical/all?lastdays=120
// three type of cases are deaths recoverd and total cases.
// this function help us to build the chart
// predefined this options
const options = {
  legend: {
    display: false,
  },
  elements: {
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: function (tooltipItem, data) {
        return numeral(tooltipItem.value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          parser: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
};

const Buildchart = (data, casesType = "cases") => {
  const chartData = []; //  temp empty array
  let lastDatapoint;

  for (let date in data.cases) {
    if (lastDatapoint) {
      const newDataPoint = {
        x: date,
        y: data[casesType][date] - lastDatapoint,
      };
      // console.log(newDataPoint.x);
      // console.log(newDataPoint.y);
      chartData.push(newDataPoint);
    }
    lastDatapoint = data[casesType][date];
  }
  return chartData;
};

function Graph({ casesType }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await fetch(`https://disease.sh/v3/covid-19/historical/all?lastdays=120`)
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          // console.log("from line graph");
          let chardata = Buildchart(data, casesType);
          setData(chardata);
        });
    };
    fetchData();
  }, [casesType]);

  return (
    <div className="graph">
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                backgroundColor: "rgba(204,16,52,0.5)",
                borderColor: "#CC1034",
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
  );
}

export default Graph;
