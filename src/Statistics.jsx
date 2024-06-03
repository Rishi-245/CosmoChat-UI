import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js CSS

const Statistics = ({ userMessageCount, chatGPTMessageCount }) => {
  const data = {
    labels: ['User Messages', 'ChatGPT Messages'],
    datasets: [
      {
        label: 'Message Count',
        backgroundColor: ['#536dfe', '#ff4081'],
        borderColor: ['#536dfe', '#ff4081'],
        borderWidth: 1,
        hoverBackgroundColor: ['#536dfe', '#ff4081'],
        hoverBorderColor: ['#536dfe', '#ff4081'],
        data: [userMessageCount, chatGPTMessageCount],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
            precision: 0,
          },
        },
      ],
    },
  };

  return (
    <div className="statistics">
      <h2>Chat Session Statistics</h2>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Statistics;
