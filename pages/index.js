import {initializeApp} from 'firebase/app';
import {getFirestore, collection, onSnapshot, query, orderBy, limit} from 'firebase/firestore';
import React, {useEffect, createRef} from 'react';
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
import {Line} from 'react-chartjs-2';

const app = initializeApp({
    apiKey: "AIzaSyC8c2aceapQj5tFeCa2oSTtheQyyZ3weDQ",
    authDomain: "ee209-tracker.firebaseapp.com",
    databaseURL: "https://ee209-tracker-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ee209-tracker",
    storageBucket: "ee209-tracker.appspot.com",
    messagingSenderId: "870740457918",
    appId: "1:870740457918:web:681fdbc9198844b594a1ef",
    measurementId: "G-QW24NWCENE"
})

const db = getFirestore(app);

ChartJS.register(
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
    interaction: {
        mode: "index",
        intersect: false
    },
    stacked: false,
    plugins: {
        title: {
            display: true,
            text: "Energy Monitor - COMPSYS 209 Project - 2022",
        }
    },
    scales: {
        y: {
            type: "linear",
            display: true,
            position: "left",
            suggestedMin: -20000,
            suggestedMax: 20000,
        },
        y1: {
            type: "linear",
            display: true,
            position: "right",
            suggestedMax: 1000,
            suggestedMin: -1000
        },
        y2: {
            type: "linear",
            display: false,
            position: "left",
            suggestedMax: 20000,
            suggestedMin: -20000
        }
    }
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

export default function Home() {

    const chartRef = createRef()
    let data = {
        labels,
        datasets: [
            {
                label: 'Voltage',
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Current',
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4,
                yAxisID: 'y1'
            },
            {
                label: 'Power',
                borderColor: 'rgb(255, 205, 86)',
                backgroundColor: 'rgba(255, 205, 86, 0.5)',
                tension: 0.4,
                yAxisID: 'y2'
            }
        ],
    };

    useEffect(() => {
        const arduinoRef = collection(db, 'arduino');
        const q = query(arduinoRef, orderBy('timestamp', 'desc'), limit(1));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))

            // if (data[0]['raw-voltage'].length < 20 || data[0]['raw-current'].length < 100) {
            //   return;
            // }

            console.log(data)

            // update the power variable
            document.getElementById('power').innerHTML = data[0]['power'];
            // voltage
            document.getElementById('voltage').innerHTML = data[0]['voltage'];
            // current
            document.getElementById('current').innerHTML = data[0]['current'];


            // split raw-voltage into a array by character ^
            // labels 1 to 40
            chartRef.current.data.labels = [...Array(data[0]["raw-voltage"].split("^").length).keys()].map((i) => i + 1)

            chartRef.current.data.datasets[0].data = (data[0]["raw-voltage"].split("^"))
            chartRef.current.data.datasets[1].data = (data[0]["raw-current"].split("^"))
            // multiply raw voltage by current and divide by 1000 to get power with rounding
            chartRef.current.data.datasets[2].data = (data[0]["raw-voltage"].split("^").map((voltage, index) => Math.round((voltage * data[0]["raw-current"].split("^")[index]) / 1000)))

            console.log((data[0]["raw-voltage"].split("^")))
            chartRef.current.update();
        });
        return () => unsubscribe();
    }, []);

    return (
        <div>
            <Line options={options} data={data} ref={chartRef}/>
            <div>
               <div style={{textAlign: "center"}}>
                 <h1> Average Power: <span id={"power"}></span> mW </h1>
                   <h1> RMS Voltage: <span id={"voltage"}></span> mV </h1>
                <h1> RMS Current: <span id={"current"}></span> mA </h1>
             </div>

            </div>
        </div>
    );
}
