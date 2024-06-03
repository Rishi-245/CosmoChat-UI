import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Import Chart.js CSS

const calculateMessageLengthStatistics = (messages) => {
  const messageLengths = messages.map(msg => msg.message.length);
  const totalMessages = messageLengths.length;
  const averageMessageLength = messageLengths.reduce((acc, len) => acc + len, 0) / totalMessages;
  const shortestMessage = messages.reduce((shortest, msg) => msg.message.length < shortest.message.length ? msg : shortest, messages[0]);
  const longestMessage = messages.reduce((longest, msg) => msg.message.length > longest.message.length ? msg : longest, messages[0]);

  return {
    totalMessages,
    averageMessageLength,
    shortestMessage,
    longestMessage
  };
};

const Statistics = ({ userMessageCount, chatGPTMessageCount, messages }) => {
  const {
    totalMessages,
    averageMessageLength,
    shortestMessage,
    longestMessage,
  } = calculateMessageLengthStatistics(messages);

  const messageCountData = {
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

  return (
    <div className="statistics">
      <h2>Chat Session Statistics</h2>
      <div className="chart-container">
        <Bar data={messageCountData} />
      </div>
      <div>
        <p>Total Messages: {totalMessages}</p>
        <p>Average Message Length: {averageMessageLength.toFixed(2)} characters</p>
        <p>Shortest Message: "{shortestMessage.message}" ({shortestMessage.message.length} characters)</p>
        <p>Longest Message: "{longestMessage.message}" ({longestMessage.message.length} characters)</p>
      </div>
    </div>
  );
};

export default Statistics;
