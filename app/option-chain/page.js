"use client"

import { getOptionChainData, root } from "@/utils/apis";
import { twMerge } from 'tailwind-merge'

import React, { useCallback, useEffect, useState } from "react";
import TableComponent from "../../components/table";

export function formatIndianNumber(number, options = {}) {
  // Default options for Indian number format
  const defaultOptions = {
    style: 'decimal',
    useGrouping: true,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
    minimumIntegerDigits: 1,
    notation: 'standard',
    currency: 'INR',
    currencyDisplay: 'symbol',
  };

  // Merge the default options with any custom options provided
  const mergedOptions = { ...defaultOptions, ...options };

  // Format the number using the merged options
  return number.toLocaleString('en-IN', mergedOptions);
}

const cellRenderer = ({ row, column }) => {
  let className = "relative text-right"
  const isAtTheMoneyCell = (row.strikePrice) <= (row.underlyingValue) && (row.strikePrice + 50) >= row.underlyingValue

  const isCE = column.accessor.startsWith("ce")

  if (isCE && row.strikePrice + 50 <= roundToNearest50(row.underlyingValue)) {
    className += " bg-amber-50"
  }
  if (!isCE && row.strikePrice + 50 > roundToNearest50(row.underlyingValue)) {
    className += " bg-amber-50"
  }

  if (isAtTheMoneyCell) {
    className += " border-b-1 bordr-red-200"
  }

  if (column.accessor === "strikePrice") {
    className += " text-center"
  }

  switch (column.accessor) {
    case "ceVolume": {
      if (row[column.accessor] === row.highestCEVolume) {
        className += " bg-green-500"
      }
      if (row[column.accessor] === row.secondHighestCEVolume) {
        className += " bg-yellow-500"

      }
      break;
    }
    case "peVolume": {
      if (row[column.accessor] === row.highestPEVolume) {
        className += " bg-green-500"
      }
      if (row[column.accessor] === row.secondHighestPEVolume) {
        className += " bg-yellow-500"

      }
      break;
    }
    case "ceSelllQnty": {
      if (row[column.accessor] === row.highestCESelllQnty) {
        className += " bg-green-500"
      }
      if (row[column.accessor] === row.secondHighestCESelllQnty) {
        className += " bg-yellow-500"

      }
      break;
    }
    case "peSelllQnty": {
      if (row[column.accessor] === row.highestPESelllQnty) {
        className += " bg-green-500"
      }
      if (row[column.accessor] === row.secondHighestPESelllQnty) {
        className += " bg-yellow-500"

      }
      break;
    }
    case "ceOI": {
      if (row[column.accessor] === row.highestCEOI) {
        className += " bg-green-500"
      }
      if (row[column.accessor] === row.secondHighestCEOI) {
        className += " bg-yellow-500"

      }
      break;
    }
    case "peOI": {
      if (row[column.accessor] === row.highestPEOI) {
        className += " bg-green-500"
      }
      if (row[column.accessor] === row.secondHighestPEOI) {
        className += " bg-yellow-500"

      }
      break;
    }
    default: {
      break
    }
  }

  return <div className={twMerge(className)}>
    {isAtTheMoneyCell && <div className="absolute border-b-2 border-solid border-red-500 w-full"></div>}
    {formatIndianNumber(row[column.accessor]) || "-"}
  </div>
}

const columns = [
  [
    { header: "CALLS", colSpan: 7 },
    { header: "", colSpan: 1 },
    { header: "PUTS", colSpan: 7 },
  ],
  [
    // { header: "IV", accessor: "ceIV", renderer: cellRenderer },
    { header: "OI Chg", accessor: "ceOIChg", renderer: cellRenderer },
    { header: "OI", accessor: "ceOI", renderer: cellRenderer },
    { header: "Volume", accessor: "ceVolume", renderer: cellRenderer },
    // { header: "Total Buy Qty", accessor: "ceBuyQnty", renderer: cellRenderer },
    { header: "Total Sell Qty", accessor: "ceSelllQnty", renderer: cellRenderer },
    // { header: "Chg Pts", accessor: "ceChgPts", renderer: cellRenderer },
    { header: "LTP", accessor: "ceLTP", renderer: cellRenderer },
    { header: "Strike Price", accessor: "strikePrice", renderer: cellRenderer },
    { header: "LTP", accessor: "peLTP", renderer: cellRenderer },
    // { header: "Chg Pts", accessor: "peChgPts", renderer: cellRenderer },
    { header: "Total Sell Qty", accessor: "peSelllQnty", renderer: cellRenderer },
    // { header: "Total Buy Qty", accessor: "peBuyQnty", renderer: cellRenderer },
    { header: "Volume", accessor: "peVolume", renderer: cellRenderer },
    { header: "OI", accessor: "peOI", renderer: cellRenderer },
    { header: "OI Chg", accessor: "peOIChg", renderer: cellRenderer },
    // { header: "IV", accessor: "peIV", renderer: cellRenderer },
  ],
];

function useOptionChainData() {
  const [data, setData] = useState({});
  const [count, setCount] = useState(0)

  const forceUpdate = useCallback(function forceUpdate() {
    setCount(count => count + 1)
  }, [])


  useEffect(() => {
    setCount(count => count + 1)
    const interval = setInterval(() => {
      setCount(count => count + 1)
    }, 60000)
    return () => {
      clearInterval(interval);
    }
  }, [])

  useEffect(() => {
    if (count > 0) {
      fetch("http://localhost:8080/api").then(async res => {
        const data = await res.json();
        setData(data)
      })
    }
  }, [count])

  return [data, forceUpdate]
}

function formatNumber(number) {
  if (Number.isInteger(number)) {
    return number; // Display as a whole number
  } else {
    return Number(number.toFixed(2)); // Display with two decimal places
  }
}

function roundToNearest50(number) {
  return Math.round(number / 50) * 50;
}

function formatOptionChainData(data = {}, totalNearStrikes) {
  const filteredData = (data?.filtered?.data || []).filter(item => {
    const lowerLimit = roundToNearest50(item.PE.underlyingValue) - (50 * totalNearStrikes)
    const upperLimit = roundToNearest50(item.PE.underlyingValue) + (50 * totalNearStrikes)
    return item.strikePrice >= lowerLimit && item.strikePrice <= upperLimit
  });
  const ceVolume = [];
  const peVolume = [];
  const ceSelllQnty = [];
  const peSelllQnty = [];
  const ceOI = [];
  const peOI = [];

  filteredData.forEach(item => {
    ceVolume.push(formatNumber(item.CE.totalTradedVolume))
    peVolume.push(formatNumber(item.PE.totalTradedVolume))
    ceSelllQnty.push(formatNumber(item.CE.totalSellQuantity))
    peSelllQnty.push(formatNumber(item.PE.totalSellQuantity))
    ceOI.push(formatNumber(item.CE.openInterest))
    peOI.push(formatNumber(item.PE.openInterest))
  })

  const highestCEVolume = Math.max(...ceVolume)
  const secondHighestCEVolume = Math.max(...ceVolume.filter(n => n !== highestCEVolume))
  const highestPEVolume = Math.max(...peVolume)
  const secondHighestPEVolume = Math.max(...peVolume.filter(n => n !== highestPEVolume))
  const highestCESelllQnty = Math.max(...ceSelllQnty)
  const secondHighestCESelllQnty = Math.max(...ceSelllQnty.filter(n => n !== highestCESelllQnty))
  const highestPESelllQnty = Math.max(...peSelllQnty)
  const secondHighestPESelllQnty = Math.max(...peSelllQnty.filter(n => n !== highestPESelllQnty))
  const highestCEOI = Math.max(...ceOI)
  const secondHighestCEOI = Math.max(...ceOI.filter(n => n !== highestCEOI))
  const highestPEOI = Math.max(...peOI)
  const secondHighestPEOI = Math.max(...peOI.filter(n => n !== highestPEOI))

  return filteredData.map(item => {
    return {
      ceBuyQnty: formatNumber(item.CE.totalBuyQuantity),
      ceSelllQnty: formatNumber(item.CE.totalSellQuantity),
      ceIV: formatNumber(item.CE.impliedVolatility),
      ceOIChg: formatNumber(item.CE.pchangeinOpenInterest),
      ceOI: formatNumber(item.CE.openInterest),
      ceVolume: formatNumber(item.CE.totalTradedVolume),
      ceChgPts: formatNumber(item.CE.change),
      ceLTP: formatNumber(item.CE.lastPrice),
      strikePrice: formatNumber(item.strikePrice),
      underlyingValue: formatNumber(item.PE.underlyingValue),
      peLTP: formatNumber(item.PE.lastPrice),
      peChgPts: formatNumber(item.PE.change),
      peVolume: formatNumber(item.PE.totalTradedVolume),
      peOI: formatNumber(item.PE.openInterest),
      peOIChg: formatNumber(item.PE.pchangeinOpenInterest),
      peIV: formatNumber(item.PE.impliedVolatility),
      peSelllQnty: formatNumber(item.PE.totalSellQuantity),
      peBuyQnty: formatNumber(item.PE.totalBuyQuantity),

      highestCEVolume,
      secondHighestCEVolume,

      highestPEVolume,
      secondHighestPEVolume,

      highestCESelllQnty,
      secondHighestCESelllQnty,

      highestPESelllQnty,
      secondHighestPESelllQnty,

      highestCEOI,
      secondHighestCEOI,

      highestPEOI,
      secondHighestPEOI,

      __item: item
    }
  })
}

function App() {

  const [optionChainData] = useOptionChainData();
  console.log("optionChainData", optionChainData)

  if (!optionChainData) {
    return null
  }
  const data = formatOptionChainData(optionChainData, 15);
  return (
    <div className="App">
      <h1>Table Example</h1>
      <TableComponent columns={columns} data={data} />
    </div>
  );
}

export default App;
