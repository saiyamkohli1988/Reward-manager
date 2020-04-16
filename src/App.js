import React, { useState, useEffect } from "react";
import fetch from './resource/dataService';
import ReactTable from 'react-table';
import "./App.css";
import "./react-table.css";
import _ from 'lodash';

function calculateResults(incomingData) {
 
 const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsPerTransaction = incomingData.map(transaction => {
    let points = 0;
    let over100 = transaction.amt - 100;

    if (over100 > 0) {
      points += (over100 * 2);
    }
    if (transaction.amt > 50) {
      points += 50;
    }
    const month = new Date(transaction.transactionDt).getMonth();
    return { ...transaction, points, month };
  });

  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let { custid, name, month, points } = pointsPerTransaction;
    if (!byCustomer[custid]) {
      byCustomer[custid] = [];
    }
    if (!totalPointsByCustomer[custid]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[custid][month]) {
      byCustomer[custid][month].points += points;
      byCustomer[custid][month].monthNumber = month;
      byCustomer[custid][month].numTransactions++;
    }
    else {

      byCustomer[custid][month] = {
        custid,
        name,
        monthNumber: month,
        month: months[month],
        numTransactions: 1,
        points
      }
    }
  });
  let tot = [];
  for (var custKey in byCustomer) {
    byCustomer[custKey].forEach(cRow => {
      tot.push(cRow);
    });
  }

  let totByCustomer = [];
  for (custKey in totalPointsByCustomer) {
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey]
    });
  }
  return {
    summaryByCustomer: tot,
    pointsPerTransaction,
    totalPointsByCustomer: totByCustomer
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);

  const columns = [
    {
      Header: 'Reward Customer',
      accessor: 'name'
    },
    {
      Header: 'Month',
      accessor: 'month'
    },
    {
      Header: "Number of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header: 'Total Reward Points',
      accessor: 'points'
    }
  ];
  const totalsByColumns = [
    {
      Header: 'Reward Customer',
      accessor: 'name'
    },
    {
      Header: 'Earning Points',
      accessor: 'points'
    }
  ]

  function getIndividualTransactions(row) {
    let byCustMonth = _.filter(transactionData.pointsPerTransaction, (tRow) => {
      return row.original.custid === tRow.custid && row.original.monthNumber === tRow.month;
    });
    return byCustMonth;
  }

  useEffect(() => {
    fetch().then((data) => {
      const results = calculateResults(data);
      setTransactionData(results);
    });
  }, []);

  if (transactionData == null) {
    return <div>Loading...</div>;
  }

  return transactionData == null ?
    <div>Loading...</div>
    :
    <div style={{ marginTop: "10px", marginBottom: "50px", }}>

      <div style={{ marginBottom: "30px", }}>
        <div className="col-12" className="header">
          <paper>Rewards manager totals by customer months</paper>
        </div>

        <div  >
          <div className="col-12">
            <ReactTable className="-striped -highlight" showPagination={false} resizable={false} data={transactionData.summaryByCustomer} defaultPageSize={5} columns={columns}
              SubComponent={row => {
                return (
                  <div>

                    {getIndividualTransactions(row).map(tran => {
                      return <div className="container">
                        <div className="row">
                          <div className="col-12">
                            <strong>Transaction Date:</strong> {tran.transactionDt} - <strong>$</strong>{tran.amt} - <strong>Points: </strong>{tran.points}
                          </div>
                        </div>
                      </div>
                    })}

                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>

      <div >
        <div className="col-12" className="header">
          <paper>Rewards manager totals by customer</paper>
        </div>

        <div>
          <div className="col-12">
            <ReactTable className="-striped -highlight" showPagination={false} data={transactionData.totalPointsByCustomer} columns={totalsByColumns} defaultPageSize={5}
            />
          </div>
        </div>
      </div>
    </div>
    ;
}

export default App;
