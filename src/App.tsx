import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  scales: {
    y: {
      max: 100,
    },
  },
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Report Products in Percent",
    },
  },
};

interface ReportProduct {
  report_id: number;
  store_id: number;
  area_id: number;
  area_name: string;
  compliance: number;
  tanggal: string;
}

interface StoreArea {
  area_id: number;
  area_name: string;
}

function App() {
  const [products, setProducts] = useState<ReportProduct[]>([]);
  const [storeArea, setStoreArea] = useState<StoreArea[]>([]);
  const [storeAreaLabel, setStoreAreaLabel] = useState<StoreArea[]>([]);
  const [productsLabel, setProductsLabel] = useState<StoreArea[]>([]);
  const [startDate, setStartDate] = useState<any>();
  const [endDate, setEndDate] = useState<any>();

  useEffect(() => {
    axios
      .get("http://localhost:8090/api/store-area")
      .then((res) => {
        setStoreArea(res.data.data);
        setStoreAreaLabel(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:8090/api/report-products")
      .then((res) => {
        const filterReport = res.data.data.filter(
          (x: any) => x.compliance === 1
        );
        setProducts(filterReport);
        setProductsLabel(filterReport);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const filterByArea = (area?: string) => {
    if (products !== undefined) {
      const filterArea = productsLabel?.filter((x: any) => {
        return x.area_name === area;
      });
      const sumPercentage = (filterArea?.length / productsLabel?.length) * 100;

      return sumPercentage;
    } else {
      return 0;
    }
  };

  const labels = storeAreaLabel?.map((store) => store.area_name);

  const data = {
    labels,
    datasets: [
      {
        label: "Penjualan",
        data: storeAreaLabel?.map((store) => filterByArea(store.area_name)),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const onChangeSelectData = (e: any) => {
    if (e.currentTarget.value !== "empty" && e.currentTarget.value !== "all") {
      const filter = storeArea.filter(
        (x: any) => x.area_id === parseInt(e.currentTarget.value)
      );

      console.log(
        storeAreaLabel?.map((store) => filterByArea(store.area_name))
      );
      setStoreAreaLabel(filter);
    } else {
      setStoreAreaLabel(storeArea);
    }
  };

  const onClickFilter = () => {
    const filterByDate = products.filter((x) => {
      const date = new Date(x.tanggal);
      return date >= startDate && date <= endDate;
    });

    setProductsLabel(filterByDate);
  };

  return (
    <div>
      <select onChange={(e) => onChangeSelectData(e)}>
        <option value="empty">Choose Area</option>
        <option value="all">Show All</option>
        {storeArea?.map((store, index) => {
          return (
            <option key={store.area_id} value={store.area_id}>
              {store.area_name}
            </option>
          );
        })}
      </select>

      <input
        type="date"
        onChange={(e) => setStartDate(new Date(e.currentTarget.value))}
      />
      <input
        type="date"
        onChange={(e) => setEndDate(new Date(e.currentTarget.value))}
      />
      <button onClick={onClickFilter}>Filter</button>
      <Bar data={data} options={options} />
    </div>
  );
}

export default App;
