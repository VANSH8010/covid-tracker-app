import React, { useEffect, useState } from 'react'
import { CardContent, FormControl, MenuItem, Select, Card } from '@mui/material'
import InfoBox from './InfoBox'
import Map from './Map'
import Table from './Table'
import { prettyPrintStat, sortData } from './util'
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css";
import "./App.css";



const App = () => {
  const [countries, setCountries] = useState([])
  // use another country code default value is worldwide..
  const [countryname, setCountry] = useState(["worldwide"])
  const [countryInfo, setCountryInfo] = useState([])
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");



  // fist useeffect use for showing some country name ....
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);


  useEffect(() => {
    // async is used to transfer the request to it and futher server will response it ......
    const getCountriesData = async () => {
      // fetch is used to detects country easily and futher wait for response
      await fetch("https://disease.sh/v3/covid-19/countries")
        // finally it will provide a response for a particular data 
        .then((response) => response.json())
        // data is finally shown...
        .then((data) => {
          // map function is used in array and it works as loops .... 
          // in this it will map all the countries name regularly. 
          const Countries = data.map((country) => (
            {
              name: country.country,//like united kingdom,united states
              value: country.countryInfo.iso2//like uk ,usa
            }));
          let sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(Countries);
          setMapCountries(data);
        });
    };

    getCountriesData();

  }, []);
// console.log(casesType);

  // using event to change  a particular country when tap by the user ...
  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    // console.log("hurray!!!", countryCode);
    // setCountry(countryCode);

    const url = countryCode === "Worldwide"
      ? "https://disease.sh/v3/covid-19/all"
      : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then(response => response.json())
      .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);

      });
  };
  // console.log("CountryInfo", countryInfo);

  return (
    <div className="App">
      <div className="App_left">
        <div className="app_header">
          <h2 className='Header'>COVID-19 TRACKER</h2>
          <FormControl className="app_dropdown">
            {/* use onchange method for changing a deafult value, when a person tap an another country 
       then it will change easily  */}
            <Select 
            variant="outlined" 
            onChange={onCountryChange} 
            value={countryname}
            >

            <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem key={country.value} value={country.value}>{country.name}</MenuItem>
              ))}
              {/* 
     <MenuItem value="worldwide">option 3 </MenuItem> */}
            </Select>
          </FormControl>
        </div>

        {/* Information about the cases that are left */}
        <div className="App_Box">
          <InfoBox
           onClick={(e) => setCasesType("cases")}
           title="CoronaVirus cases "
           isRed
          active={casesType === "cases"}
          cases={countryInfo.todayCases}
          total={prettyPrintStat(countryInfo.cases)} 
          />
          <InfoBox 
          onClick={(e) => setCasesType("recoverded")}
          title="Recovered "
          isRed
          active={casesType === "recovered"}
          cases={countryInfo.todayRecovered}
          total={prettyPrintStat(countryInfo.recovered)} 

          />

          <InfoBox 
          onClick={(e) => setCasesType("deaths")}
          title="Deaths"
          isRed
          active={casesType === "deaths"}
          cases={countryInfo.todayDeaths}
          total={prettyPrintStat(countryInfo.deaths)} 
                
          />

        </div>

        <Map
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
          casesType={casesType}
        />

      </div>
      <Card className="App_right">
        <CardContent>
          <h3>Cases by country</h3>

          <Table countries={tableData} />

          <h4 className='App_graphtitle'>Worldwide new {casesType}</h4>
          <LineGraph className="App_graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App