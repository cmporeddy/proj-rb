import { useMemo, useState } from "react";

const sampleResults = [
  {
    operator: "RedBus",
    route: "Bangalore → Chennai",
    busType: "AC Sleeper",
    departure: "21:30",
    duration: "6h 45m",
    baseFare: 950,
    taxes: 85,
    totalFare: 1035,
    seatsAvailable: 14,
    rating: 4.4,
  },
  {
    operator: "SRS Travels",
    route: "Bangalore → Chennai",
    busType: "Non-AC Seater",
    departure: "22:00",
    duration: "7h 10m",
    baseFare: 720,
    taxes: 65,
    totalFare: 785,
    seatsAvailable: 8,
    rating: 4.1,
  },
  {
    operator: "VRL",
    route: "Bangalore → Chennai",
    busType: "AC Seater",
    departure: "23:15",
    duration: "6h 55m",
    baseFare: 880,
    taxes: 80,
    totalFare: 960,
    seatsAvailable: 12,
    rating: 4.3,
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const toIsoDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export default function App() {
  const [fromCity, setFromCity] = useState("Bangalore");
  const [toCity, setToCity] = useState("Chennai");
  const [travelDate, setTravelDate] = useState(toIsoDate(new Date()));
  const [minSeats, setMinSeats] = useState(1);
  const [useSample, setUseSample] = useState(true);
  const [results, setResults] = useState(sampleResults);
  const [status, setStatus] = useState("");
  const [endpointPath, setEndpointPath] = useState("/price-comparison");

  const apiBaseUrl =
    import.meta.env.VITE_REDBUS_API_BASE_URL ?? "http://api.seatseller.travel";
  const consumerKey = import.meta.env.VITE_REDBUS_CONSUMER_KEY ?? "";
  const consumerSecret = import.meta.env.VITE_REDBUS_CONSUMER_SECRET ?? "";

  const seatFilteredResults = useMemo(() => {
    return results.filter((item) => item.seatsAvailable >= Number(minSeats));
  }, [results, minSeats]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("Fetching competitor pricing...");

    if (useSample) {
      setResults(
        sampleResults.map((item) => ({
          ...item,
          route: `${fromCity} → ${toCity}`,
        }))
      );
      setStatus("Showing sample data. Disable sample mode to call the API.");
      return;
    }

    if (!apiBaseUrl) {
      setStatus("Add VITE_REDBUS_API_BASE_URL to call the API.");
      return;
    }

    try {
      const baseUrl = apiBaseUrl.replace(/\/+$/, "");
      const path = endpointPath.startsWith("/")
        ? endpointPath
        : `/${endpointPath}`;
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Consumer-Key": consumerKey,
          "X-Consumer-Secret": consumerSecret,
        },
        body: JSON.stringify({
          fromCity,
          toCity,
          travelDate,
          minSeats: Number(minSeats),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results ?? []);
      setStatus("Live pricing loaded successfully.");
    } catch (error) {
      setStatus(
        `Unable to fetch live pricing. ${error.message}. Try sample mode.`
      );
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">REDBUS Seatseller</p>
          <h1>Competitor Price Comparison</h1>
          <p className="subtitle">
            Track competitor fares, availability, and seat counts for any route
            in one view.
          </p>
        </div>
        <div className="hero-card">
          <h2>Quick Insights</h2>
          <ul>
            <li>Compare base fares, taxes, and final prices.</li>
            <li>Filter by seat availability before publishing your fare.</li>
            <li>Export-ready table for operators and analysts.</li>
          </ul>
        </div>
      </header>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fromCity">From city</label>
            <input
              id="fromCity"
              type="text"
              value={fromCity}
              onChange={(event) => setFromCity(event.target.value)}
              placeholder="e.g., Bangalore"
            />
          </div>
          <div className="field">
            <label htmlFor="toCity">To city</label>
            <input
              id="toCity"
              type="text"
              value={toCity}
              onChange={(event) => setToCity(event.target.value)}
              placeholder="e.g., Chennai"
            />
          </div>
          <div className="field">
            <label htmlFor="travelDate">Travel date</label>
            <input
              id="travelDate"
              type="date"
              value={travelDate}
              onChange={(event) => setTravelDate(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="minSeats">Min seats</label>
            <input
              id="minSeats"
              type="number"
              min="1"
              value={minSeats}
              onChange={(event) => setMinSeats(event.target.value)}
            />
          </div>
          <div className="field checkbox">
            <label htmlFor="useSample">
              <input
                id="useSample"
                type="checkbox"
                checked={useSample}
                onChange={(event) => setUseSample(event.target.checked)}
              />
              Use sample data
            </label>
          </div>
          <div className="field">
            <label htmlFor="endpointPath">Endpoint path</label>
            <input
              id="endpointPath"
              type="text"
              value={endpointPath}
              onChange={(event) => setEndpointPath(event.target.value)}
              placeholder="/price-comparison"
            />
          </div>
          <button className="primary" type="submit">
            Compare prices
          </button>
        </form>
        <div className="status" role="status">
          {status || "Submit a route to load pricing."}
        </div>
        <div className="config-hint">
          <h3>API configuration</h3>
          <p>
            Set <code>VITE_REDBUS_API_BASE_URL</code>,
            <code>VITE_REDBUS_CONSUMER_KEY</code>, and
            <code>VITE_REDBUS_CONSUMER_SECRET</code> in a local <code>.env</code>
            file to enable live comparisons. Keep credentials out of source
            control and consider proxying requests through your backend for
            production.
          </p>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="table-header">
          <h2>Price comparison</h2>
          <p>
            Showing {seatFilteredResults.length} operators with at least
            {" "}
            {minSeats} seats.
          </p>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Operator</th>
                <th>Route</th>
                <th>Bus type</th>
                <th>Departure</th>
                <th>Duration</th>
                <th>Base fare</th>
                <th>Taxes</th>
                <th>Total fare</th>
                <th>Seats</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {seatFilteredResults.map((item) => (
                <tr key={`${item.operator}-${item.departure}`}>
                  <td>{item.operator}</td>
                  <td>{item.route}</td>
                  <td>{item.busType}</td>
                  <td>{item.departure}</td>
                  <td>{item.duration}</td>
                  <td>{formatCurrency(item.baseFare)}</td>
                  <td>{formatCurrency(item.taxes)}</td>
                  <td className="total">{formatCurrency(item.totalFare)}</td>
                  <td>{item.seatsAvailable}</td>
                  <td>{item.rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
