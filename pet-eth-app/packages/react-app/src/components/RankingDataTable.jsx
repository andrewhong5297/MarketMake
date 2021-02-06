import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import {
  Tab,
  Tabs,
  Card,
  Table,
  Spinner,
} from "react-bootstrap";

export const RankingDataTable = (props) => {
    const [error, setError] = useState(null)
    const [isLoading, setLoading] = useState(true)
    const [data, setData] = useState();
    // table header and data here with useState (if columns are static then just define a constant

    const fetchData = async () => {
        // start showing spinner
        setLoading(true);
        try {
        // remote fetch to api even graphql
        const response = await props.onFetchAll()
        console.log(response)
        setData(response);
        } catch (e) {
        setError(e)
        }
        // hide spinner and show error or data
        setLoading(false)
        setError(null)
    }

    useEffect(() => {
    // fetch data
    fetchData()
    }, [])

    const createMapping = () => {
        const arr = [1,1,2,3,4,5,6]
        //this is key for getting to totals for each person. Try to get the distance sum first. 
        console.log(
            arr.reduce((sum,d)=>{
            return sum + d //d is each element of arr
            }, 0)
        ) // sum = 0
    }
    
  return (
    <Card>
    <Card.Body className="customCard">
    <Card.Title className="customCardTitle">Walker Rankings Based on Lifetime Totals</Card.Title>
        <div class="container">
            <div class="row">
            <div class="col-md">
                <Tabs className="justify-content-center" defaultActiveKey="distances" 
                        id="controlled-tab-example">
                    <Tab eventKey="distances" title="Distance Walked">
                        <div style={{ marginTop: `12px` }}>
                        <Table striped bordered hover>
                            <thead>
                            <tr>
                                <th>Dog Name</th>
                                <th>Distance Walked</th>
                                <th>Walker Eth Address</th>
                                <th>Walker Name</th>
                            </tr>
                            </thead>
                            {
                            isLoading
                            ? <Spinner animation="border" variant="dark" />
                            : 
                            <tbody>
                                {data.map((row, index) => (
                                    <tr id={index}>
                                        <td id={index}>{row["Dog_Name"]}</td>
                                        <td id={index}>{row["Distance_Walked"]}</td>
                                        <td id={index}><a href={"https://kovan.etherscan.io/address/" + row['Walker_Address']}>{row["Walker_Address"]}</a></td>
                                        <td id={index}>{row["Walker_Name"]}</td>
                                    </tr>
                                ))}
                            </tbody>
                            }
                        </Table>
                        </div>
                    </Tab>
                    <Tab eventKey="times" title="Time Walked">
                    </Tab>
                    <Tab eventKey="dogs" title="Dogs Walked">
                    </Tab>
                    <Tab eventKey="contact" title="Badges">
                        {/* should query all badges and show top levels */}
                    </Tab>
                </Tabs>                    
            </div>
            </div>
        </div>
    </Card.Body>
    </Card>
  )
}