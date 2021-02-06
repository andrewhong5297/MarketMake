import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../index.css";
import {
  Container,
  Row,
  Col,
  Button,
  Tab,
  Tabs,
  Card,
  Table,
  Modal,
} from "react-bootstrap";

export const RankingDataTable = (props) => {
    const [data, setData] = useState();
    const [table , setTable] = useState(
    <div>
        <Table striped bordered hover>
            <thead>
            <tr>
                <th>null</th>
                <th>null</th>
                <th>null</th>
                <th>null</th>
            </tr>
            </thead>
        </Table>
    </div>)

    React.useEffect(() => {
        props.onFetchAll().then(response=>setData(response));
    }, []);

    //should load after setData() has changed... not on click
    const createMapping = () => {
        const arr = [1,1,2,3,4,5,6]

        //this is key for getting to totals for each person. Try to get the distance sum first. 
        console.log(
            arr.reduce((sum,d)=>{
            return sum + d //d is each element of arr
            }, 0)
        ) // sum = 0

        //console.log(data.reduce(...)) //take distance sum if name is "Emily"

        //take unique set of names
        //get dictionary of sums based on tab (variable) selected?

        console.log(data)
        setTable(
            <div>
                <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Dog_Name</th>
                            <th>Distance_Walked</th>
                            <th>Time_Walked</th>
                            <th>Walker_Name</th>
                            <th>UNIX_Timestamp</th>
                        </tr>
                        </thead>
                        <thead>
                        {data.map((row, index) => (
                            <tr id={index}>
                                <td>{row["Dog_Name"]}</td>
                                <td>{row["Distance_Walked"]}</td>
                                <td>{row["Time_Walked"]}</td>
                                <td>{row["Walker_Name"]}</td>
                                <td>{row["UNIX_Timestamp"]}</td>
                            </tr>
                        ))}
                    </thead>
                </Table>
            </div>)
    }
    
  return (
    <Card>
    <Card.Body>
    <Button onClick={createMapping}>update data</Button>
    <div class="container">
        <div class="row">
        <div class="col-md">
            <Tabs className="justify-content-center" defaultActiveKey="Home" 
                    id="controlled-tab-example">
                <Tab eventKey="Home" title="Distance Walked">
                    <div style={{ marginTop: `12px` }}>
                    {table}
                    </div>
                </Tab>
                <Tab eventKey="profile" title="Profile">
                </Tab>
                <Tab eventKey="contact" title="Contact">
                </Tab>
                <Tab eventKey="contact" title="Y33t">
                </Tab>
            </Tabs>                    
        </div>
        </div>
    </div>
    </Card.Body>
    </Card>
  )
}