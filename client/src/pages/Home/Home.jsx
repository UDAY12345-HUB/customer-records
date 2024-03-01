import React, { useEffect, useState } from 'react';
import './home.css'
import axios from 'axios';

export default function Home() {
  const [data, setData] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc'); // Initial sorting order is ascending
  const [sortCriterion, setSortCriterion] = useState('date'); // Initial sorting criterion is date
  const recordsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, [currentPage, searchValue]); // Fetch data on initial component mount and when currentPage or searchValue changes

  const fetchData = async () => {
    try {
      const url = searchValue.trim() !== '' ? `http://localhost:9002/getdata/search?search=${searchValue}` : 'http://localhost:9002/getdata';
      const response = await axios.get(url);
      setData(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  // Sort data based on name or time column
  const sortData = () => {
    const sortedData = data.slice().sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
  
      if (sortCriterion === 'date') {
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortCriterion === 'time') {
        const timeA = dateA.getHours() * 60 + dateA.getMinutes();
        const timeB = dateB.getHours() * 60 + dateB.getMinutes();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return 0;
    });
  
    setData(sortedData);
  };
  
  // Calculate index of the first and last records of the current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = data.slice(indexOfFirstRecord, indexOfLastRecord);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Extract time from datetime string
  const getTimeFromDate = (dateTimeString) => {
    const dateObject = new Date(dateTimeString);
    return dateObject.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Extract date from datetime string
  const getDateFromDate = (dateTimeString) => {
    const dateObject = new Date(dateTimeString);
    return dateObject.toLocaleDateString();
  };

  return (
    <>
      <div className="home">
        <div>
          <h1>CUSTOMER RECORDS</h1>
          <div className='search'>
            <h2>search : <input type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)} />  <button type='submit' onClick={fetchData}>Submit</button>
              <select value={sortCriterion} onChange={(e) => setSortCriterion(e.target.value)}>
                <option value="date">Sort by Date</option>
                <option value="time">Sort by Time</option>
              </select>
              <button onClick={sortData} className='sort'>Sort</button></h2>
          </div>
          <div className='mainTable'>
            <table>
              <thead>
                <tr>
                  <th>Sno</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((row, index) => (
                  <tr key={index}>
                    <td>{row.sno}</td>
                    <td>{row.name}</td>
                    <td>{row.age}</td>
                    <td>{row.phone}</td>
                    <td>{row.location}</td>
                    <td>{getDateFromDate(row.created_at)}</td>
                    <td>{getTimeFromDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
            <button onClick={() => paginate(currentPage + 1)} disabled={indexOfLastRecord >= data.length}>Next</button>
          </div>
        </div>
      </div>
    </>
  );
}
