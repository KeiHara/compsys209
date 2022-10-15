import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import React, { useEffect, createRef } from 'react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

const app = initializeApp({
  apiKey: "AIzaSyD1oL73rsUYtObQm0pPGAtPjS0rrFslDcc",
  authDomain: "compsys209-b17db.firebaseapp.com",
  projectId: "compsys209-b17db",
  storageBucket: "compsys209-b17db.appspot.com",
  messagingSenderId: "701805363223",
  appId: "1:701805363223:web:e8ac059e6fa718d9aa5c52",
  measurementId: "G-HTBNKYFQVS"
})

const db = getFirestore(app);

ChartJS.register(
  ChartDataLabels,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  legend: {
    position: 'top',
  },
  title: {
    display: true,
    text: 'Chart.js Line Chart',
  },
  plugins: {
    datalabels: {
      backgroundColor: function(context) {
        return context.dataset.backgroundColor;
      },
      borderRadius: 4,
      color: 'white',
      font: {
        weight: 'bold'
      },
      formatter: Math.round,
      padding: 6
    }
  }
}



export default function Home() {
  const chartRef = createRef()
  let graphData = {
    labels: [],
    datasets: [
      {
        label: 'Voltage',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.25,
        datalabels: {
          align: 'start',
          anchor: 'start'
        }
      },
      {
        label: 'Current',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.25,
        datalabels: {
          align: 'start',
          anchor: 'start'
        }
      },
      {
        label: 'Power',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.25,
        datalabels: {
          align: 'start',
          anchor: 'start'
        }
      },

    ]
  }
  // get real-time updates from the database
  useEffect(() => {
    const arduinoRef = collection(db, 'arduino');
    const q = query(arduinoRef, orderBy('timestamp', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      const date = new Date(data[0].timestamp * 1000)
      chartRef.current.data.labels.push(`${date.getMinutes()}:${date.getSeconds()}`)
      chartRef.current.data.datasets[0].data.push(data[0].voltage)
      chartRef.current.data.datasets[1].data.push(data[0].current)
      chartRef.current.data.datasets[2].data.push(data[0].power)
      chartRef.current.update();
      if (chartRef.current.data.labels.length >= 10) {
        chartRef.current.data.labels.shift();
        chartRef.current.data.datasets[0].data.shift();
        chartRef.current.data.datasets[1].data.shift();
        chartRef.current.data.datasets[2].data.shift();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Line options={options} ref={chartRef} data={graphData} />
    </div>
  )
}