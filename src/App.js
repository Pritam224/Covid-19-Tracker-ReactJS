import React, { useState, useEffect } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./components/InfoBox/InfoBox.jsx";
import Map from "./components/Maps/Map.jsx";
import Table from "./components/Table/Table.jsx";
import Graph from "./components/Graph/Graph.jsx";
import { sortData, prettyPrintStat } from "./components/utils/util.jsx";
import "leaflet/dist/leaflet.css";
import "./app.css";

import icon from "./images/coronavirus.png";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("Worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 21.5937, lng: 76.9629 });
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    fetch(`https://disease.sh/v3/covid-19/all`)
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, // India United
            value: country.countryInfo.iso2, // IN , USA
          }));
          let sorteddata = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sorteddata);
        });
    };
    getCountriesData();
  }, []);

  // ---------------------------------------------------------------------------
  const onCountryChange = async (e) => {
    const CountryCode = e.target.value;
    const url =
      CountryCode === "Worldwide"
        ? `https://disease.sh/v3/covid-19/all `
        : `https://disease.sh/v3/covid-19/countries/${CountryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(CountryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(8);
        // console.log(data);
      });
  };

  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <div className="header__icon">
            <img src={icon} alt="icon_image" className="app_headerIcon" />
            <h1>COVID-19 TRACKER</h1>
          </div>

          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="Worldwide">Worldwide</MenuItem>

              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Title + select input dropdown field */}

        <div className="app_stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          ></InfoBox>
          <InfoBox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          ></InfoBox>
          <InfoBox
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          ></InfoBox>
        </div>

        {/* Map */}
        {/* {console.log(casesType)} */}
        <Map
          countries={mapCountries}
          casesType={casesType}
          position={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Live cases by Country</h3>
          <Table countries={tableData}></Table>
          <h3>Worldwide new {casesType}</h3>
          <Graph className="graph" casesType={casesType}></Graph>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
